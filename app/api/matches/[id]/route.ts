import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateHSLIndex, calculateUSOIndex } from '@/lib/bpi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: {
          include: { players: true }
        },
        awayTeam: {
          include: { players: true }
        },
        games: {
          orderBy: { order: 'asc' }
        },
        season: true
      }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { gameResults, matchResult } = await request.json();

    // Update match with results and status
    // When detailed results are entered, mark as NOT a quick result
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        result: matchResult,
        status: matchResult.status || 'completed',
        endTime: matchResult.status === 'completed' ? new Date() : null,
        isQuickResult: false // Detailed entry, so this is not a quick result
      }
    });

    // Delete existing games and their events for this match before creating new ones
    await prisma.gameEvent.deleteMany({
      where: {
        game: {
          matchId: id
        }
      }
    });

    await prisma.game.deleteMany({
      where: { matchId: id }
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
    include: {
      season: true,
      games: {
        include: {
          events: true
        }
      }
    }
  });

  if (!match) return;

  // First, subtract old stats from this match if it was previously saved
  const oldPlayerStats = new Map();

  if (match.games && match.games.length > 0) {
    // Calculate what the old stats were for this match
    match.games.forEach((game: any) => {
      // Parse participants if it's stored as JSON string
      const participants = typeof game.participants === 'string'
        ? JSON.parse(game.participants)
        : game.participants;

      const gameParticipants = [
        ...(participants.home || []),
        ...(participants.away || [])
      ];

      gameParticipants.forEach((playerId: string) => {
        if (!oldPlayerStats.has(playerId)) {
          oldPlayerStats.set(playerId, {
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

        const stats = oldPlayerStats.get(playerId);
        stats.totalGamesPlayed += 1;

        const gameResultData = game.result as any;
        const isHomePlayer = (participants.home || []).includes(playerId);

        if ((isHomePlayer && gameResultData?.winner === 'home') ||
            (!isHomePlayer && gameResultData?.winner === 'away')) {
          stats.totalGamesWon += 1;
        }

        if (game.type === 'single') {
          stats.singlesPlayed += 1;

          if ((isHomePlayer && gameResultData?.winner === 'home') ||
              (!isHomePlayer && gameResultData?.winner === 'away')) {
            stats.singlesWon += 1;
          }

          // Count old events
          game.events.forEach((event: any) => {
            if (event.playerId === playerId) {
              stats[event.type] = (stats[event.type] || 0) + 1;
            }
          });

          // Track old legs
          if (gameResultData?.homeScore !== undefined && gameResultData?.awayScore !== undefined) {
            if (isHomePlayer) {
              stats.legsWon += gameResultData.homeScore || 0;
              stats.legsLost += gameResultData.awayScore || 0;
            } else {
              stats.legsWon += gameResultData.awayScore || 0;
              stats.legsLost += gameResultData.homeScore || 0;
            }
          }
        }
      });
    });
  }

  // Aggregate NEW stats for each player
  const playerStats = new Map();

  Object.values(gameResults).forEach((gameResult: any) => {
    // Count all game types for total statistics
    [...gameResult.participants.home, ...gameResult.participants.away].forEach((playerId: string) => {
      if (!playerStats.has(playerId)) {
        playerStats.set(playerId, {
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

      const stats = playerStats.get(playerId);
      
      // Count all games for total stats
      stats.totalGamesPlayed += 1;
      
      // Check if player won this game (for total stats)
      const isHomePlayer = gameResult.participants.home.includes(playerId);
      if ((isHomePlayer && gameResult.winner === 'home') || 
          (!isHomePlayer && gameResult.winner === 'away')) {
        stats.totalGamesWon += 1;
      }

      // Count singles separately
      if (gameResult.type === 'single') {
        stats.singlesPlayed += 1;

        const isWinner = (isHomePlayer && gameResult.winner === 'home') ||
                        (!isHomePlayer && gameResult.winner === 'away');

        if (isWinner) {
          stats.singlesWon += 1;
        }

        // Track legs for singles (extract from homeScore/awayScore)
        if (gameResult.homeScore !== undefined && gameResult.awayScore !== undefined) {
          if (isHomePlayer) {
            stats.legsWon += gameResult.homeScore || 0;
            stats.legsLost += gameResult.awayScore || 0;
          } else {
            stats.legsWon += gameResult.awayScore || 0;
            stats.legsLost += gameResult.homeScore || 0;
          }
        }

        // Add events (only tracked in singles)
        if (gameResult.events && gameResult.events[playerId]) {
          Object.entries(gameResult.events[playerId]).forEach(([eventType, count]: [string, any]) => {
            stats[eventType] = (stats[eventType] || 0) + count;
          });
        }
      }
    });
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
      // Get old stats for this player from this match (to subtract)
      const oldStats = oldPlayerStats.get(playerId) || {
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
      };

      const newStats = {
        // Subtract old match stats, then add new match stats
        totalGamesPlayed: existingStats.totalGamesPlayed - oldStats.totalGamesPlayed + stats.totalGamesPlayed,
        totalGamesWon: existingStats.totalGamesWon - oldStats.totalGamesWon + stats.totalGamesWon,
        singlesPlayed: existingStats.singlesPlayed - oldStats.singlesPlayed + stats.singlesPlayed,
        singlesWon: existingStats.singlesWon - oldStats.singlesWon + stats.singlesWon,
        legsWon: (existingStats.legsWon || 0) - oldStats.legsWon + stats.legsWon,
        legsLost: (existingStats.legsLost || 0) - oldStats.legsLost + stats.legsLost,
        S95: existingStats.S95 - oldStats.S95 + stats.S95,
        S133: existingStats.S133 - oldStats.S133 + stats.S133,
        S170: existingStats.S170 - oldStats.S170 + stats.S170,
        Asfalt: existingStats.Asfalt - oldStats.Asfalt + stats.Asfalt,
        CO3: existingStats.CO3 - oldStats.CO3 + stats.CO3,
        CO4: existingStats.CO4 - oldStats.CO4 + stats.CO4,
        CO5: existingStats.CO5 - oldStats.CO5 + stats.CO5,
        CO6: existingStats.CO6 - oldStats.CO6 + stats.CO6,
        // For highestCheckout, keep the maximum value (can't subtract, need to recalculate from all matches)
        highestCheckout: Math.max(existingStats.highestCheckout, stats.highestCheckout)
      };

      // Calculate all indexes
      const hslIndex = calculateHSLIndex(newStats);
      const usoIndex = calculateUSOIndex(newStats);

      await prisma.playerStats.update({
        where: {
          playerId_seasonId: {
            playerId: playerId,
            seasonId: match.seasonId
          }
        },
        data: {
          ...newStats,
          hslIndex,
          usoIndex
        }
      });
    } else {
      // Create new player stats
      const hslIndex = calculateHSLIndex(stats);
      const usoIndex = calculateUSOIndex(stats);

      await prisma.playerStats.create({
        data: {
          playerId: playerId,
          seasonId: match.seasonId,
          ...stats,
          hslIndex,
          usoIndex
        }
      });
    }
  }
}