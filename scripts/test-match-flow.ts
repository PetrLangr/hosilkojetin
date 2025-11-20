import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMatchFlow() {
  console.log('🎯 Testing complete match flow...\n');

  try {
    // 1. Get a match to test with
    const match = await prisma.match.findFirst({
      where: {
        status: 'scheduled'
      },
      include: {
        homeTeam: {
          include: { players: true }
        },
        awayTeam: {
          include: { players: true }
        },
        season: true
      }
    });

    if (!match) {
      console.log('❌ No scheduled match found for testing');
      return;
    }

    console.log(`📋 Testing with match: ${match.homeTeam.name} vs ${match.awayTeam.name}\n`);

    // 2. Get players for lineups
    const homePlayers = match.homeTeam.players.slice(0, 3);
    const awayPlayers = match.awayTeam.players.slice(0, 3);

    if (homePlayers.length < 3 || awayPlayers.length < 3) {
      console.log('❌ Not enough players for testing');
      return;
    }

    console.log('Home lineup:', homePlayers.map(p => p.name).join(', '));
    console.log('Away lineup:', awayPlayers.map(p => p.name).join(', '));

    // 3. Simulate game results (16 games + optional tiebreaker)
    const gameResults: Record<string, any> = {
      // Singles 1-3
      '1': {
        type: 'single',
        format: 'bo3',
        homeLegs: 2,
        awayLegs: 1,
        winner: 'home',
        participants: {
          home: [homePlayers[0].id],
          away: [awayPlayers[0].id]
        }
      },
      '2': {
        type: 'single',
        format: 'bo3',
        homeLegs: 0,
        awayLegs: 2,
        winner: 'away',
        participants: {
          home: [homePlayers[1].id],
          away: [awayPlayers[1].id]
        }
      },
      '3': {
        type: 'single',
        format: 'bo3',
        homeLegs: 2,
        awayLegs: 0,
        winner: 'home',
        participants: {
          home: [homePlayers[2].id],
          away: [awayPlayers[2].id]
        }
      },
      // Doubles 4-5
      '4': {
        type: 'double_501',
        format: 'bo3',
        homeLegs: 2,
        awayLegs: 1,
        winner: 'home',
        participants: {
          home: [homePlayers[0].id, homePlayers[1].id],
          away: [awayPlayers[0].id, awayPlayers[1].id]
        }
      },
      '5': {
        type: 'double_cricket',
        format: 'bo1_15rounds',
        homeLegs: 0,
        awayLegs: 1,
        winner: 'away',
        participants: {
          home: [homePlayers[1].id, homePlayers[2].id],
          away: [awayPlayers[1].id, awayPlayers[2].id]
        }
      },
      // Singles 6-8
      '6': {
        type: 'single',
        format: 'bo3',
        homeLegs: 2,
        awayLegs: 1,
        winner: 'home',
        participants: {
          home: [homePlayers[2].id],
          away: [awayPlayers[2].id]
        }
      },
      '7': {
        type: 'single',
        format: 'bo3',
        homeLegs: 1,
        awayLegs: 2,
        winner: 'away',
        participants: {
          home: [homePlayers[0].id],
          away: [awayPlayers[0].id]
        }
      },
      '8': {
        type: 'single',
        format: 'bo3',
        homeLegs: 2,
        awayLegs: 0,
        winner: 'home',
        participants: {
          home: [homePlayers[1].id],
          away: [awayPlayers[1].id]
        }
      },
      // Triple 9
      '9': {
        type: 'triple_301',
        format: 'bo3',
        homeLegs: 1,
        awayLegs: 2,
        winner: 'away',
        participants: {
          home: homePlayers.map(p => p.id),
          away: awayPlayers.map(p => p.id)
        }
      },
      // Doubles 10-11
      '10': {
        type: 'double_501',
        format: 'bo3',
        homeLegs: 2,
        awayLegs: 0,
        winner: 'home',
        participants: {
          home: [homePlayers[2].id, homePlayers[0].id],
          away: [awayPlayers[2].id, awayPlayers[0].id]
        }
      },
      '11': {
        type: 'double_cricket',
        format: 'bo1_15rounds',
        homeLegs: 0,
        awayLegs: 1,
        winner: 'away',
        participants: {
          home: [homePlayers[0].id, homePlayers[1].id],
          away: [awayPlayers[0].id, awayPlayers[1].id]
        }
      },
      // Singles 12-14
      '12': {
        type: 'single',
        format: 'bo3',
        homeLegs: 1,
        awayLegs: 2,
        winner: 'away',
        participants: {
          home: [homePlayers[1].id],
          away: [awayPlayers[1].id]
        }
      },
      '13': {
        type: 'single',
        format: 'bo3',
        homeLegs: 2,
        awayLegs: 1,
        winner: 'home',
        participants: {
          home: [homePlayers[2].id],
          away: [awayPlayers[2].id]
        }
      },
      '14': {
        type: 'single',
        format: 'bo3',
        homeLegs: 0,
        awayLegs: 2,
        winner: 'away',
        participants: {
          home: [homePlayers[0].id],
          away: [awayPlayers[0].id]
        }
      },
      // Doubles 15-16
      '15': {
        type: 'double_501',
        format: 'bo3',
        homeLegs: 2,
        awayLegs: 1,
        winner: 'home',
        participants: {
          home: [homePlayers[1].id, homePlayers[2].id],
          away: [awayPlayers[1].id, awayPlayers[2].id]
        }
      },
      '16': {
        type: 'double_cricket',
        format: 'bo1_15rounds',
        homeLegs: 1,
        awayLegs: 0,
        winner: 'home',
        participants: {
          home: [homePlayers[0].id, homePlayers[2].id],
          away: [awayPlayers[0].id, awayPlayers[2].id]
        }
      }
    };

    // Add events for singles games (only for testing)
    const events: Record<string, any> = {};
    [1, 2, 3, 6, 7, 8, 12, 13, 14].forEach(gameNum => {
      events[gameNum] = {};

      // Add some test events for home player
      if (gameResults[gameNum].participants.home[0]) {
        events[gameNum][gameResults[gameNum].participants.home[0]] = {
          S95: Math.floor(Math.random() * 3),
          S133: Math.floor(Math.random() * 2),
          S170: Math.random() > 0.7 ? 1 : 0,
          CO3: Math.floor(Math.random() * 2),
          CO4: Math.floor(Math.random() * 2),
          CO5: Math.random() > 0.5 ? 1 : 0,
          CO6: 0
        };
      }

      // Add some test events for away player
      if (gameResults[gameNum].participants.away[0]) {
        events[gameNum][gameResults[gameNum].participants.away[0]] = {
          S95: Math.floor(Math.random() * 3),
          S133: Math.floor(Math.random() * 2),
          S170: Math.random() > 0.7 ? 1 : 0,
          CO3: Math.floor(Math.random() * 2),
          CO4: Math.floor(Math.random() * 2),
          CO5: Math.random() > 0.5 ? 1 : 0,
          CO6: 0
        };
      }
    });

    // Count games won
    let homeGamesWon = 0;
    let awayGamesWon = 0;
    let homeLegsTotal = 0;
    let awayLegsTotal = 0;

    Object.values(gameResults).forEach((result: any) => {
      if (result.winner === 'home') homeGamesWon++;
      else if (result.winner === 'away') awayGamesWon++;

      homeLegsTotal += result.homeLegs || 0;
      awayLegsTotal += result.awayLegs || 0;
    });

    console.log(`\n📊 Match result: ${homeGamesWon}:${awayGamesWon} (Legs: ${homeLegsTotal}:${awayLegsTotal})`);

    // Calculate expected points
    let expectedHomePoints = 0;
    let expectedAwayPoints = 0;

    if (homeGamesWon > 8) {
      expectedHomePoints = 3;
      expectedAwayPoints = 0;
      console.log('Expected: Home wins (3-0 points)');
    } else if (awayGamesWon > 8) {
      expectedHomePoints = 0;
      expectedAwayPoints = 3;
      console.log('Expected: Away wins (0-3 points)');
    } else if (homeGamesWon === 8 && awayGamesWon === 8) {
      // Would need tiebreaker
      console.log('Expected: Tie - would need 17th game');
    }

    // 4. Save match via API
    console.log('\n💾 Saving match data...');

    // Prepare match result
    const matchResult = {
      homeGamesWon,
      awayGamesWon,
      homeLegsTotal,
      awayLegsTotal,
      homePoints: expectedHomePoints,
      awayPoints: expectedAwayPoints,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    // Add events to game results
    const processedGameResults: Record<string, any> = {};
    Object.entries(gameResults).forEach(([gameId, result]) => {
      processedGameResults[gameId] = {
        ...result,
        events: events[gameId] || {}
      };
    });

    // Update match in database
    const updatedMatch = await prisma.match.update({
      where: { id: match.id },
      data: {
        result: matchResult,
        status: 'completed',
        endTime: new Date()
      }
    });

    // Save games
    for (const [gameOrder, gameResult] of Object.entries(processedGameResults)) {
      const game = await prisma.game.create({
        data: {
          matchId: match.id,
          order: parseInt(gameOrder),
          type: gameResult.type,
          format: gameResult.format,
          result: gameResult,
          participants: gameResult.participants
        }
      });

      // Save events for singles
      if (gameResult.type === 'single' && gameResult.events) {
        for (const [playerId, playerEvents] of Object.entries(gameResult.events)) {
          for (const [eventType, count] of Object.entries(playerEvents as any)) {
            const typedCount = count as number;
            if (typedCount > 0) {
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

    console.log('✅ Match saved successfully!\n');

    // 5. Verify statistics were updated
    console.log('📈 Verifying player statistics...\n');

    for (const player of [...homePlayers, ...awayPlayers]) {
      const stats = await prisma.playerStats.findUnique({
        where: {
          playerId_seasonId: {
            playerId: player.id,
            seasonId: match.seasonId
          }
        }
      });

      if (stats && (stats.totalGamesPlayed > 0 || stats.singlesPlayed > 0)) {
        console.log(`${player.name}:`);
        console.log(`  Total: ${stats.totalGamesPlayed} played, ${stats.totalGamesWon} won`);
        console.log(`  Singles: ${stats.singlesPlayed} played, ${stats.singlesWon} won`);
        console.log(`  Events: S95=${stats.S95}, S133=${stats.S133}, S170=${stats.S170}`);
        console.log(`  Checkouts: CO3=${stats.CO3}, CO4=${stats.CO4}, CO5=${stats.CO5}`);
        console.log(`  BPI: ${stats.bpi}\n`);
      }
    }

    // 6. Check standings
    console.log('📊 Checking standings update...\n');

    const homeTeamStanding = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: match.homeTeam.id },
          { awayTeamId: match.homeTeam.id }
        ],
        status: 'completed'
      }
    });

    const awayTeamStanding = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: match.awayTeam.id },
          { awayTeamId: match.awayTeam.id }
        ],
        status: 'completed'
      }
    });

    console.log(`${match.homeTeam.name}: ${homeTeamStanding.length} matches played`);
    console.log(`${match.awayTeam.name}: ${awayTeamStanding.length} matches played`);

    console.log('\n✨ Test completed successfully!');
    console.log('Check /standings and /players pages to verify the updates.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMatchFlow()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });