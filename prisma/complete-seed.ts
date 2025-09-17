import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Complete seeding database...');

  // Read JSON data files
  const playersPath = path.join(process.cwd(), '../../players (1).json');
  const teamsPath = path.join(process.cwd(), '../../teams.json');
  const fixturesPath = path.join(process.cwd(), '../../fixtures.json');

  let playersData, teamsData, fixturesData;

  try {
    playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
    console.log(`📊 Found ${playersData.length} players in JSON`);
  } catch (error) {
    console.log('⚠️ Could not read players JSON, using default data');
    playersData = [];
  }

  try {
    teamsData = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));
    console.log(`👥 Found ${teamsData.length} teams in JSON`);
  } catch (error) {
    console.log('⚠️ Could not read teams JSON, using default data');
    teamsData = [];
  }

  try {
    fixturesData = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
    console.log(`⚽ Found ${fixturesData.length} fixtures in JSON`);
  } catch (error) {
    console.log('⚠️ Could not read fixtures JSON');
    fixturesData = [];
  }

  // Create or get season
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
    console.log('✅ Created season:', season.name);
  }

  // Use teams from JSON or fallback to default
  const defaultTeams = [
    { "name": "AK Kojetín", "shortName": "AKK", "city": "Kojetín" },
    { "name": "Bochořský koblihy", "shortName": "BOK", "city": "Bochoř" },
    { "name": "Cech křivé šipky", "shortName": "CKŠ", "city": "" },
    { "name": "DC Kraken Dřínov", "shortName": "DKD", "city": "Dřínov" },
    { "name": "DC Stop Chropyně", "shortName": "DSC", "city": "Chropyně" },
    { "name": "Dark Horse Moštárna", "shortName": "DHM", "city": "" },
    { "name": "Draci Počenice", "shortName": "DRP", "city": "Počenice" },
    { "name": "Hospoda Kanada", "shortName": "HKA", "city": "" },
    { "name": "Kohouti Ludslavice", "shortName": "KHL", "city": "Ludslavice" },
    { "name": "Rychlí šneci Vlkoš", "shortName": "RSV", "city": "Vlkoš" },
    { "name": "Stoned Lobo Ponies", "shortName": "SLP", "city": "" },
    { "name": "ŠK Pivní psi Chropyně", "shortName": "SPP", "city": "Chropyně" }
  ];

  const teams = teamsData.length > 0 ? teamsData : defaultTeams;
  const teamMap = new Map();

  // Create teams
  for (const teamData of teams) {
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
          seasonId: season.id,
        },
      });
      console.log('✅ Created team:', team.name);
    }
    
    teamMap.set(teamData.name, team.id);
  }

  // Create players from JSON data
  if (playersData.length > 0) {
    for (const playerData of playersData) {
      // Map team names between JSON and database
      let teamName = playerData.team;
      
      // Fix team name mismatches
      if (teamName === 'SK Pivní psi Chropyně') teamName = 'ŠK Pivní psi Chropyně';
      if (teamName === 'Češi křivé šipky') teamName = 'Cech křivé šipky';
      if (teamName === 'Hospodka Kanada') teamName = 'Hospoda Kanada';
      
      const teamId = teamMap.get(teamName);
      if (!teamId) {
        console.log('⚠️ Team not found for player:', playerData.name, 'team:', teamName);
        continue;
      }

      const existingPlayer = await prisma.player.findFirst({
        where: {
          name: playerData.name,
          teamId: teamId
        }
      });

      if (!existingPlayer) {
        const player = await prisma.player.create({
          data: {
            name: playerData.name,
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

        console.log('✅ Created player:', player.name, 'for team:', teamName);
      }
    }
  }

  // Create matches from fixtures if available
  if (fixturesData.length > 0) {
    for (const fixture of fixturesData) {
      const homeTeam = teamMap.get(fixture.homeTeam);
      const awayTeam = teamMap.get(fixture.awayTeam);
      
      if (homeTeam && awayTeam) {
        const existingMatch = await prisma.match.findFirst({
          where: {
            homeTeamId: homeTeam,
            awayTeamId: awayTeam,
            round: fixture.round,
            seasonId: season.id
          }
        });

        if (!existingMatch) {
          await prisma.match.create({
            data: {
              homeTeamId: homeTeam,
              awayTeamId: awayTeam,
              round: fixture.round,
              startTime: fixture.date ? new Date(fixture.date) : null,
              seasonId: season.id
            }
          });
          console.log(`✅ Created match: ${fixture.homeTeam} vs ${fixture.awayTeam} (Round ${fixture.round})`);
        }
      }
    }
  }

  const finalCounts = await Promise.all([
    prisma.team.count({ where: { seasonId: season.id } }),
    prisma.player.count({ where: { team: { seasonId: season.id } } }),
    prisma.match.count({ where: { seasonId: season.id } })
  ]);

  console.log('🎉 Complete seeding finished!');
  console.log(`📊 Database contains:`);
  console.log(`   - ${finalCounts[0]} teams`);
  console.log(`   - ${finalCounts[1]} players`);
  console.log(`   - ${finalCounts[2]} matches`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });