import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Load data from JSON files
const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../teams.json'), 'utf8'));
const playersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../players (1).json'), 'utf8'));
const fixturesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../fixtures.json'), 'utf8'));

async function main() {
  console.log('Seeding database...');

  // Create current season if it doesn't exist
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

  // Create archived seasons for the archive page
  const archivedSeasons = [
    { name: '2023/2024', startDate: '2023-09-01', endDate: '2024-05-31' },
    { name: '2022/2023', startDate: '2022-09-01', endDate: '2023-05-31' },
    { name: '2021/2022', startDate: '2021-09-01', endDate: '2022-05-31' },
  ];

  for (const archiveSeason of archivedSeasons) {
    const existingArchive = await prisma.season.findFirst({
      where: { name: archiveSeason.name }
    });

    if (!existingArchive) {
      await prisma.season.create({
        data: {
          name: archiveSeason.name,
          startDate: new Date(archiveSeason.startDate),
          endDate: new Date(archiveSeason.endDate),
          isActive: false,
        },
      });
      console.log('Created archived season:', archiveSeason.name);
    }
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
      // Update existing match with start time if it's missing
      const startTime = new Date(fixtureData.datetime);
      if (!existingMatch.startTime) {
        await prisma.match.update({
          where: { id: existingMatch.id },
          data: { startTime: startTime }
        });
        console.log(`Updated match start time: Round ${fixtureData.round} - ${fixtureData.homeTeam} vs ${fixtureData.awayTeam}`);
      } else {
        console.log(`Match already exists: Round ${fixtureData.round} - ${fixtureData.homeTeam} vs ${fixtureData.awayTeam}`);
      }
    }
  }

  // Create admin user
  const adminEmail = 'petr.langr@pmlogy.cz';
  const adminPassword = 'AdminHSL2025!';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'HŠL Administrator',
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('Created admin user:', adminUser.email);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }

  // Create sample posts if they don't exist
  const postsData = [
    {
      id: '1',
      title: 'Máme nové webové stránky!',
      excerpt: 'Spuštění nových webových stránek s online zápisy a elektronickým podepisováním.',
      imageUrl: '/hero-dartboard.webp',
      content: `<p>S radostí oznamujeme spuštění nových webových stránek HŠL! Nový systém přináší řadu vylepšení a nových funkcí, které usnadní správu ligy jak kapitánům, tak hráčům.</p>

<h3>Hlavní novinky:</h3>
<ul>
  <li><strong>Online zadávání výsledků</strong> - Kapitáni mohou zadávat výsledky zápasů přímo přes web</li>
  <li><strong>Automatické statistiky</strong> - Systém automaticky počítá BPI indexy a další statistiky hráčů</li>
  <li><strong>Elektronické podpisy</strong> - Zápisy lze podepisovat elektronicky pomocí PIN kódů</li>
  <li><strong>PWA podpora</strong> - Webové stránky fungují i jako mobilní aplikace</li>
  <li><strong>Responzivní design</strong> - Perfektní zobrazení na všech zařízeních</li>
</ul>

<p>Nové webové stránky jsou navrženy s důrazem na jednoduchost použití a moderní design. Kapitáni týmů obdrží své PIN kódy v nejbližších dnech.</p>

<p>Pro případné dotazy nebo problémy s novým systémem nás kontaktujte na <strong>info@hsl-liga.cz</strong>.</p>`,
      type: 'announcement',
      pinned: true,
      createdAt: new Date('2025-01-15')
    },
    {
      id: '2',
      title: 'Mobilní aplikace je na cestě!',
      excerpt: 'Připravujeme mobilní aplikaci pro ještě pohodlnější přístup k lize.',
      imageUrl: '/mobile-app.webp',
      content: `<p>Pracujeme na vývoji mobilní aplikace pro iOS a Android, která přinese ještě lepší uživatelský zážitek pro všechny příznivce HŠL.</p>

<h3>Co přinese mobilní aplikace:</h3>
<ul>
  <li><strong>Push notifikace</strong> - Okamžité informace o nových výsledcích a zápasech</li>
  <li><strong>Offline režim</strong> - Prohlížení statistik i bez internetového připojení</li>
  <li><strong>Rychlý přístup</strong> - Nejdůležitější funkce na dosah ruky</li>
  <li><strong>Optimalizace pro mobily</strong> - Ještě lepší výkon na mobilních zařízeních</li>
  <li><strong>Tmavý režim</strong> - Možnost přepnutí na tmavé téma</li>
</ul>

<p>Aplikace bude dostupná zdarma na Google Play Store i Apple App Store. Očekáváme vydání v průběhu března 2025.</p>

<p>Zatím si můžete přidat naše webové stránky na domovskou obrazovku svého telefonu - fungují jako plnohodnotná PWA aplikace!</p>`,
      type: 'news',
      pinned: false,
      createdAt: new Date('2025-01-10')
    }
  ];

  // Find admin user to assign posts
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (adminUser) {
    for (const postData of postsData) {
      const existingPost = await prisma.post.findFirst({
        where: { title: postData.title }
      });

      if (!existingPost) {
        await prisma.post.create({
          data: {
            title: postData.title,
            content: postData.content,
            excerpt: postData.excerpt,
            imageUrl: postData.imageUrl,
            authorId: adminUser.id,
            type: postData.type,
            published: true,
            pinned: postData.pinned,
            createdAt: postData.createdAt
          }
        });
        console.log('Created post:', postData.title);
      } else {
        // Update existing post with new content and imageUrl
        await prisma.post.update({
          where: { id: existingPost.id },
          data: {
            content: postData.content,
            excerpt: postData.excerpt,
            imageUrl: postData.imageUrl,
            type: postData.type,
            pinned: postData.pinned
          }
        });
        console.log('Updated post:', postData.title);
      }
    }
  }

  // Create sample game results for one completed match
  const completedMatch = await prisma.match.findFirst({
    where: { seasonId: season.id },
    include: {
      homeTeam: { include: { players: true } },
      awayTeam: { include: { players: true } }
    }
  });

  if (completedMatch && completedMatch.homeTeam.players.length > 0 && completedMatch.awayTeam.players.length > 0) {
    const existingGames = await prisma.game.count({ where: { matchId: completedMatch.id } });
    
    if (existingGames === 0) {
      // Create sample games for this match
      const sampleGames = [
        {
          order: 1,
          type: 'single',
          format: 'bo3',
          participants: { 
            home: [completedMatch.homeTeam.players[0].id], 
            away: [completedMatch.awayTeam.players[0].id] 
          },
          result: {
            winner: 'home',
            legs: [
              { winner: 'home', homeScore: 501, awayScore: 320 },
              { winner: 'away', homeScore: 280, awayScore: 501 },
              { winner: 'home', homeScore: 501, awayScore: 450 }
            ]
          }
        },
        {
          order: 2,
          type: 'single',
          format: 'bo3',
          participants: { 
            home: [(completedMatch.homeTeam.players[1] || completedMatch.homeTeam.players[0]).id], 
            away: [(completedMatch.awayTeam.players[1] || completedMatch.awayTeam.players[0]).id]
          },
          result: {
            winner: 'away',
            legs: [
              { winner: 'away', homeScore: 140, awayScore: 501 },
              { winner: 'away', homeScore: 295, awayScore: 501 }
            ]
          }
        },
        {
          order: 3,
          type: 'double_501',
          format: 'bo3',
          participants: { 
            home: [completedMatch.homeTeam.players[0]?.id, completedMatch.homeTeam.players[1]?.id || completedMatch.homeTeam.players[0]?.id], 
            away: [completedMatch.awayTeam.players[0]?.id, completedMatch.awayTeam.players[1]?.id || completedMatch.awayTeam.players[0]?.id]
          },
          result: {
            winner: 'home',
            legs: [
              { winner: 'home', homeScore: 501, awayScore: 410 },
              { winner: 'away', homeScore: 360, awayScore: 501 },
              { winner: 'home', homeScore: 501, awayScore: 298 }
            ]
          }
        },
        {
          order: 4,
          type: 'double_cricket',
          format: 'bo1_15rounds',
          participants: { 
            home: [completedMatch.homeTeam.players[0]?.id, completedMatch.homeTeam.players[1]?.id || completedMatch.homeTeam.players[0]?.id], 
            away: [completedMatch.awayTeam.players[0]?.id, completedMatch.awayTeam.players[1]?.id || completedMatch.awayTeam.players[0]?.id]
          },
          result: {
            winner: 'away',
            rounds: 15
          }
        }
      ];

      for (const gameData of sampleGames) {
        await prisma.game.create({
          data: {
            matchId: completedMatch.id,
            order: gameData.order,
            type: gameData.type,
            format: gameData.format,
            participants: gameData.participants,
            result: gameData.result
          }
        });
      }

      // Update match with final result and mark as completed
      await prisma.match.update({
        where: { id: completedMatch.id },
        data: {
          result: {
            home: 2,
            away: 2,
            type: 'VP-VP'
          },
          endTime: new Date(),
          status: 'completed'
        }
      });

      // Update player stats for all games
      const allPlayers = [...completedMatch.homeTeam.players, ...completedMatch.awayTeam.players];
      
      for (const player of allPlayers) {
        let totalGamesPlayed = 0;
        let totalGamesWon = 0;
        let singlesPlayed = 0;
        let singlesWon = 0;

        // Count each game this player participated in
        for (const gameData of sampleGames) {
          const allParticipants = [...gameData.participants.home, ...gameData.participants.away];
          if (allParticipants.includes(player.id)) {
            totalGamesPlayed++;

            // Check if player's team won this game
            const isHomePlayer = gameData.participants.home.includes(player.id);
            if ((isHomePlayer && gameData.result.winner === 'home') || 
                (!isHomePlayer && gameData.result.winner === 'away')) {
              totalGamesWon++;
            }

            // Count singles separately
            if (gameData.type === 'single') {
              singlesPlayed++;
              if ((isHomePlayer && gameData.result.winner === 'home') || 
                  (!isHomePlayer && gameData.result.winner === 'away')) {
                singlesWon++;
              }
            }
          }
        }

        // Update player stats
        await prisma.playerStats.upsert({
          where: {
            playerId_seasonId: {
              playerId: player.id,
              seasonId: season.id
            }
          },
          update: {
            totalGamesPlayed: totalGamesPlayed,
            totalGamesWon: totalGamesWon,
            singlesPlayed: singlesPlayed,
            singlesWon: singlesWon
          },
          create: {
            playerId: player.id,
            seasonId: season.id,
            totalGamesPlayed: totalGamesPlayed,
            totalGamesWon: totalGamesWon,
            singlesPlayed: singlesPlayed,
            singlesWon: singlesWon
          }
        });
      }

      console.log('Created sample game results for match:', 
        completedMatch.homeTeam.name, 'vs', completedMatch.awayTeam.name);
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
  const userCount = await prisma.user.count();
  const postCount = await prisma.post.count();

  console.log('\n=== SEEDING SUMMARY ===');
  console.log(`Teams: ${teamCount}`);
  console.log(`Players: ${playerCount} (${playersWithDob} with date of birth)`);
  console.log(`Matches: ${matchCount}`);
  console.log(`Users: ${userCount}`);
  console.log(`Posts: ${postCount}`);
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