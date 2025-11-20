import { PrismaClient } from '@prisma/client';
import { calculateBPI } from '../lib/bpi';

const prisma = new PrismaClient();

async function recalculateAllStats() {
  console.log('🎯 Recalculating all player statistics from actual games...\n');

  const season = await prisma.season.findFirst({
    where: { isActive: true }
  });

  if (!season) {
    console.log('❌ No active season found');
    return;
  }

  // First, reset all player stats to zero
  await prisma.playerStats.updateMany({
    where: { seasonId: season.id },
    data: {
      totalGamesPlayed: 0,
      totalGamesWon: 0,
      singlesPlayed: 0,
      singlesWon: 0,
      S95: 0,
      S133: 0,
      S170: 0,
      CO3: 0,
      CO4: 0,
      CO5: 0,
      CO6: 0,
      bpi: 0
    }
  });

  console.log('📊 Reset all player stats to zero');

  // Get all completed matches with games
  const matches = await prisma.match.findMany({
    where: {
      seasonId: season.id,
      status: 'completed',
      result: { not: null }
    },
    include: {
      games: {
        include: {
          events: true
        }
      }
    }
  });

  console.log(`📈 Found ${matches.length} completed matches to process\n`);

  // Process each match
  for (const match of matches) {
    console.log(`Processing match ${match.id}...`);

    // Process each game in the match
    for (const game of match.games) {
      const gameResult = game.result as any;
      if (!gameResult || !gameResult.participants) continue;

      // Get all participants in this game
      const allParticipants = [
        ...(gameResult.participants.home || []),
        ...(gameResult.participants.away || [])
      ];

      // Update stats for each participant
      for (const playerId of allParticipants) {
        const playerStats = await prisma.playerStats.findUnique({
          where: {
            playerId_seasonId: {
              playerId: playerId,
              seasonId: season.id
            }
          }
        });

        if (!playerStats) {
          // Create stats if they don't exist
          await prisma.playerStats.create({
            data: {
              playerId: playerId,
              seasonId: season.id,
              totalGamesPlayed: 0,
              totalGamesWon: 0,
              singlesPlayed: 0,
              singlesWon: 0,
              S95: 0,
              S133: 0,
              S170: 0,
              CO3: 0,
              CO4: 0,
              CO5: 0,
              CO6: 0,
              bpi: 0
            }
          });
          continue;
        }

        // Increment games played
        let updateData: any = {
          totalGamesPlayed: playerStats.totalGamesPlayed + 1
        };

        // Check if player won
        const isHomePlayer = gameResult.participants.home?.includes(playerId);
        const playerWon = (isHomePlayer && gameResult.winner === 'home') ||
                         (!isHomePlayer && gameResult.winner === 'away');

        if (playerWon) {
          updateData.totalGamesWon = playerStats.totalGamesWon + 1;
        }

        // For singles games, update singles-specific stats
        if (game.type === 'single') {
          updateData.singlesPlayed = playerStats.singlesPlayed + 1;
          if (playerWon) {
            updateData.singlesWon = playerStats.singlesWon + 1;
          }

          // Count events for this player in this game
          const playerEvents = game.events.filter(e => e.playerId === playerId);
          for (const event of playerEvents) {
            if (event.type && updateData[event.type] !== undefined) {
              updateData[event.type] = playerStats[event.type as keyof typeof playerStats] + 1;
            } else if (event.type) {
              updateData[event.type] = (playerStats as any)[event.type] + 1;
            }
          }
        }

        await prisma.playerStats.update({
          where: { id: playerStats.id },
          data: updateData
        });
      }
    }
  }

  // Now recalculate BPI for all players
  console.log('\n🎯 Recalculating BPI for all players...\n');

  const allPlayerStats = await prisma.playerStats.findMany({
    where: { seasonId: season.id },
    include: { player: true }
  });

  let playersWithStats = 0;
  for (const stats of allPlayerStats) {
    if (stats.totalGamesPlayed > 0 || stats.singlesPlayed > 0) {
      const bpi = calculateBPI({
        singlesPlayed: stats.singlesPlayed,
        singlesWon: stats.singlesWon,
        S95: stats.S95,
        S133: stats.S133,
        S170: stats.S170,
        CO3: stats.CO3,
        CO4: stats.CO4,
        CO5: stats.CO5,
        CO6: stats.CO6
      });

      await prisma.playerStats.update({
        where: { id: stats.id },
        data: { bpi }
      });

      if (stats.singlesPlayed > 0) {
        const winRate = ((stats.singlesWon / stats.singlesPlayed) * 100).toFixed(1);
        console.log(`✅ ${stats.player.name.padEnd(25)} - Singles: ${stats.singlesPlayed}/${stats.singlesWon} (${winRate}%), BPI: ${bpi.toFixed(1)}`);
        playersWithStats++;
      }
    }
  }

  console.log('\n📊 Statistics Summary:');
  console.log(`- Matches processed: ${matches.length}`);
  console.log(`- Total games: ${matches.reduce((sum, m) => sum + m.games.length, 0)}`);
  console.log(`- Players with singles stats: ${playersWithStats}`);
  console.log(`- Total players: ${allPlayerStats.length}`);
}

recalculateAllStats()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });