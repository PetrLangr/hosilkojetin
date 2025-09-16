import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBPI } from '@/lib/bpi';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { gameResults, matchResult } = await request.json();

    // Update match with results
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        result: matchResult,
        endTime: new Date()
      }
    });

    // Save games and events
    for (const [gameOrder, gameResult] of Object.entries(gameResults)) {
      const typedGameResult = gameResult as any;
      const game = await prisma.game.create({
        data: {
          matchId: id,
          order: parseInt(gameOrder),
          type: typedGameResult.type,
          format: typedGameResult.format,
          result: typedGameResult,
          participants: typedGameResult.participants
        }
      });

      // Save player events (only for singles)
      if (typedGameResult.type === 'single' && typedGameResult.events) {
        for (const [playerId, playerEvents] of Object.entries(typedGameResult.events)) {
          for (const [eventType, count] of Object.entries(playerEvents as any)) {
            const typedCount = count as number;
            if (typedCount > 0) {
              // Create multiple events for the count
              for (let i = 0; i < typedCount; i++) {
                await prisma.gameEvent.create({
                  data: {
                    gameId: game.id,
                    playerId: playerId,
                    type: eventType,
                    value: null
                  }
                });
              }
            }
          }
        }
      }
    }

    // Update player statistics
    await updatePlayerStatistics(id, gameResults);

    return NextResponse.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}

async function updatePlayerStatistics(matchId: string, gameResults: Record<string, any>) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { season: true }
  });

  if (!match) return;

  // Aggregate stats for each player
  const playerStats = new Map();

  Object.values(gameResults).forEach((gameResult: any) => {
    if (gameResult.type === 'single') {
      // Count singles played and won
      [...gameResult.participants.home, ...gameResult.participants.away].forEach((playerId: string) => {
        if (!playerStats.has(playerId)) {
          playerStats.set(playerId, {
            singlesPlayed: 0,
            singlesWon: 0,
            S95: 0,
            S133: 0,
            S170: 0,
            CO3: 0,
            CO4: 0,
            CO5: 0,
            CO6: 0
          });
        }

        const stats = playerStats.get(playerId);
        stats.singlesPlayed += 1;

        // Check if player won this game
        const isHomePlayer = gameResult.participants.home.includes(playerId);
        if ((isHomePlayer && gameResult.winner === 'home') || 
            (!isHomePlayer && gameResult.winner === 'away')) {
          stats.singlesWon += 1;
        }

        // Add events
        if (gameResult.events && gameResult.events[playerId]) {
          Object.entries(gameResult.events[playerId]).forEach(([eventType, count]: [string, any]) => {
            stats[eventType] = (stats[eventType] || 0) + count;
          });
        }
      });
    }
  });

  // Update database
  for (const [playerId, stats] of playerStats.entries()) {
    const existingStats = await prisma.playerStats.findUnique({
      where: {
        playerId_seasonId: {
          playerId: playerId,
          seasonId: match.seasonId
        }
      }
    });

    if (existingStats) {
      const newStats = {
        singlesPlayed: existingStats.singlesPlayed + stats.singlesPlayed,
        singlesWon: existingStats.singlesWon + stats.singlesWon,
        S95: existingStats.S95 + stats.S95,
        S133: existingStats.S133 + stats.S133,
        S170: existingStats.S170 + stats.S170,
        CO3: existingStats.CO3 + stats.CO3,
        CO4: existingStats.CO4 + stats.CO4,
        CO5: existingStats.CO5 + stats.CO5,
        CO6: existingStats.CO6 + stats.CO6
      };

      // Calculate new BPI
      const bpi = calculateBPI(newStats);

      await prisma.playerStats.update({
        where: {
          playerId_seasonId: {
            playerId: playerId,
            seasonId: match.seasonId
          }
        },
        data: {
          ...newStats,
          bpi
        }
      });
    }
  }
}