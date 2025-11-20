import { PrismaClient } from '@prisma/client';
import { calculateHSLIndex, calculateUSOIndex } from '../lib/bpi';

const prisma = new PrismaClient();

async function recalculateAllStats() {
  console.log('Recalculating all player statistics from game data...');

  try {
    // Get all completed matches with their games
    const matches = await prisma.match.findMany({
      where: {
        endTime: { not: null }  // Only completed matches
      },
      include: {
        games: true,
        season: true
      }
    });

    console.log(`Found ${matches.length} completed matches to process`);

    // Create a map to track stats for each player
    const playerStatsMap = new Map();

    // Process each match and its games
    for (const match of matches) {
      console.log(`Processing match ${match.id} with ${match.games.length} games`);
      
      for (const game of match.games) {
        const gameResult = game.result as any;
        const participants = game.participants as any;
        
        if (gameResult && participants) {
          // Get all participants (home + away)
          const allParticipants = [
            ...(participants.home || []),
            ...(participants.away || [])
          ];

          // Process each participant
          for (const playerId of allParticipants) {
            if (!playerStatsMap.has(playerId)) {
              playerStatsMap.set(playerId, {
                seasonId: match.seasonId,
                totalGamesPlayed: 0,
                totalGamesWon: 0,
                singlesPlayed: 0,
                singlesWon: 0,
                legsWon: 0,
                legsLost: 0,
                S95: 0,
                S133: 0,
                S170: 0,
                Asfalt: 0,
                CO3: 0,
                CO4: 0,
                CO5: 0,
                CO6: 0,
                highestCheckout: 0
              });
            }

            const stats = playerStatsMap.get(playerId);
            
            // Count ALL games for total stats
            stats.totalGamesPlayed++;
            
            // Check if this player won the game
            const isHomePlayer = participants.home?.includes(playerId);
            const playerWon = (isHomePlayer && gameResult.winner === 'home') || 
                            (!isHomePlayer && gameResult.winner === 'away');
            
            if (playerWon) {
              stats.totalGamesWon++;
            }

            // Count singles separately
            if (game.type === 'single') {
              stats.singlesPlayed++;
              if (playerWon) {
                stats.singlesWon++;
              }

              // Track legs for singles
              if (gameResult.homeScore !== undefined && gameResult.awayScore !== undefined) {
                if (isHomePlayer) {
                  stats.legsWon += gameResult.homeScore || 0;
                  stats.legsLost += gameResult.awayScore || 0;
                } else {
                  stats.legsWon += gameResult.awayScore || 0;
                  stats.legsLost += gameResult.homeScore || 0;
                }
              }

              // Add performance events for singles only
              if (gameResult.events && gameResult.events[playerId]) {
                Object.entries(gameResult.events[playerId]).forEach(([eventType, count]: [string, any]) => {
                  if (eventType === 'highestCheckout') {
                    // For highestCheckout, keep the maximum value
                    stats[eventType] = Math.max(stats[eventType] || 0, count);
                  } else {
                    stats[eventType] = (stats[eventType] || 0) + count;
                  }
                });
              }
            }
          }
        }
      }
    }

    console.log(`Updating stats for ${playerStatsMap.size} players`);

    // Update database with calculated stats
    for (const [playerId, stats] of playerStatsMap.entries()) {
      // Calculate indexes
      const hslIndex = calculateHSLIndex(stats);
      const usoIndex = calculateUSOIndex(stats);

      await prisma.playerStats.upsert({
        where: {
          playerId_seasonId: {
            playerId: playerId,
            seasonId: stats.seasonId
          }
        },
        update: {
          totalGamesPlayed: stats.totalGamesPlayed,
          totalGamesWon: stats.totalGamesWon,
          singlesPlayed: stats.singlesPlayed,
          singlesWon: stats.singlesWon,
          legsWon: stats.legsWon,
          legsLost: stats.legsLost,
          S95: stats.S95,
          S133: stats.S133,
          S170: stats.S170,
          Asfalt: stats.Asfalt,
          CO3: stats.CO3,
          CO4: stats.CO4,
          CO5: stats.CO5,
          CO6: stats.CO6,
          highestCheckout: stats.highestCheckout,
          hslIndex: hslIndex,
          usoIndex: usoIndex
        },
        create: {
          playerId: playerId,
          seasonId: stats.seasonId,
          totalGamesPlayed: stats.totalGamesPlayed,
          totalGamesWon: stats.totalGamesWon,
          singlesPlayed: stats.singlesPlayed,
          singlesWon: stats.singlesWon,
          legsWon: stats.legsWon,
          legsLost: stats.legsLost,
          S95: stats.S95,
          S133: stats.S133,
          S170: stats.S170,
          Asfalt: stats.Asfalt,
          CO3: stats.CO3,
          CO4: stats.CO4,
          CO5: stats.CO5,
          CO6: stats.CO6,
          highestCheckout: stats.highestCheckout,
          hslIndex: hslIndex,
          usoIndex: usoIndex
        }
      });

      const totalPercentage = stats.totalGamesPlayed > 0 ? 
        Math.round((stats.totalGamesWon / stats.totalGamesPlayed) * 100) : 0;
      const singlesPercentage = stats.singlesPlayed > 0 ? 
        Math.round((stats.singlesWon / stats.singlesPlayed) * 100) : 0;
        
      console.log(`Updated ${playerId}: Total ${totalPercentage}% (${stats.totalGamesWon}/${stats.totalGamesPlayed}), Singles ${singlesPercentage}% (${stats.singlesWon}/${stats.singlesPlayed})`);
    }

    console.log('All player statistics recalculated!');
  } catch (error) {
    console.error('Error recalculating stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recalculateAllStats();