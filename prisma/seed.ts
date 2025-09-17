import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Load data from JSON files
const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../teams.json'), 'utf8'));
const playersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../players (1).json'), 'utf8'));
const fixturesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../fixtures.json'), 'utf8'));

async function main() {
  console.log('Seeding database...');

  // Create season if it doesn't exist
  let season = await prisma.season.findFirst({
    where: { name: '2024/2025' }
  });

  if (!season) {
    season = await prisma.season.create({
      data: {
        name: '2024/2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-05-31'),
        isActive: true,
      },
    });
    console.log('Created season:', season.name);
  } else {
    console.log('Season already exists:', season.name);
  }

  // Create teams if they don't exist
  const teamMap = new Map();
  for (const teamData of teamsData) {
    let team = await prisma.team.findFirst({
      where: { 
        name: teamData.name,
        seasonId: season.id
      }
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: teamData.name,
          shortName: teamData.shortName,
          city: teamData.city || '',
          logoUrl: teamData.logoUrl,
          seasonId: season.id,
        },
      });
      console.log('Created team:', team.name);
    } else {
      console.log('Team already exists:', team.name);
    }
    
    teamMap.set(teamData.name, team.id);
  }

  // Create players with all data including dates of birth
  for (const playerData of playersData) {
    // Handle team name variations
    let teamName = playerData.team;
    
    // Fix team name mismatches
    if (teamName === 'SK Pivní psi Chropyně') {
      teamName = 'ŠK Pivní psi Chropyně';
    }
    if (teamName === 'Češi křivé šipky') {
      teamName = 'Cech křivé šipky';
    }
    if (teamName === 'Hospodka Kanada') {
      teamName = 'Hospoda Kanada';
    }

    const teamId = teamMap.get(teamName);
    if (!teamId) {
      console.log('Team not found for player:', playerData.name, 'team:', teamName);
      continue;
    }

    const existingPlayer = await prisma.player.findFirst({
      where: {
        name: playerData.name,
        teamId: teamId
      }
    });

    if (!existingPlayer) {
      // Parse date of birth
      let dateOfBirth = null;
      if (playerData.dob) {
        try {
          dateOfBirth = new Date(playerData.dob);
        } catch (error) {
          console.log('Invalid date for player:', playerData.name, 'dob:', playerData.dob);
        }
      }

      const player = await prisma.player.create({
        data: {
          name: playerData.name,
          dateOfBirth: dateOfBirth,
          teamId: teamId,
          role: 'hráč'
        },
      });
      
      // Create player stats for the season
      await prisma.playerStats.create({
        data: {
          playerId: player.id,
          seasonId: season.id,
        },
      });

      console.log('Created player:', player.name, 'for team:', teamName, dateOfBirth ? `(born: ${dateOfBirth.toISOString().split('T')[0]})` : '');
    } else {
      // Update existing player with missing dateOfBirth if needed
      if (playerData.dob && !existingPlayer.dateOfBirth) {
        try {
          const dateOfBirth = new Date(playerData.dob);
          await prisma.player.update({
            where: { id: existingPlayer.id },
            data: { dateOfBirth: dateOfBirth }
          });
          console.log('Updated player date of birth:', existingPlayer.name);
        } catch (error) {
          console.log('Invalid date for existing player:', existingPlayer.name, 'dob:', playerData.dob);
        }
      } else {
        console.log('Player already exists:', playerData.name);
      }
    }
  }

  // Create fixtures/matches
  for (const fixtureData of fixturesData) {
    const homeTeamId = teamMap.get(fixtureData.homeTeam);
    const awayTeamId = teamMap.get(fixtureData.awayTeam);

    if (!homeTeamId || !awayTeamId) {
      console.log('Teams not found for fixture:', fixtureData.homeTeam, 'vs', fixtureData.awayTeam);
      continue;
    }

    const existingMatch = await prisma.match.findFirst({
      where: {
        seasonId: season.id,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        round: fixtureData.round
      }
    });

    if (!existingMatch) {
      const startTime = new Date(fixtureData.datetime);
      
      const match = await prisma.match.create({
        data: {
          seasonId: season.id,
          homeTeamId: homeTeamId,
          awayTeamId: awayTeamId,
          round: fixtureData.round,
          startTime: startTime,
        },
      });

      console.log(`Created match: Round ${fixtureData.round} - ${fixtureData.homeTeam} vs ${fixtureData.awayTeam}`);
    } else {
      console.log(`Match already exists: Round ${fixtureData.round} - ${fixtureData.homeTeam} vs ${fixtureData.awayTeam}`);
    }
  }

  console.log('Database seeded successfully!');
  
  // Print summary statistics
  const teamCount = await prisma.team.count({ where: { seasonId: season.id } });
  const playerCount = await prisma.player.count({ 
    where: { team: { seasonId: season.id } }
  });
  const matchCount = await prisma.match.count({ where: { seasonId: season.id } });
  const playersWithDob = await prisma.player.count({
    where: { 
      team: { seasonId: season.id },
      dateOfBirth: { not: null }
    }
  });

  console.log('\n=== SEEDING SUMMARY ===');
  console.log(`Teams: ${teamCount}`);
  console.log(`Players: ${playerCount} (${playersWithDob} with date of birth)`);
  console.log(`Matches: ${matchCount}`);
  console.log('======================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });