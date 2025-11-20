import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanAllMatches() {
  console.log('🧹 Cleaning all game statistics (keeping matches)...\n');

  try {
    // First, show what matches have results
    const matchesWithResults = await prisma.match.findMany({
      where: {
        OR: [
          { result: { not: null } },
          { status: { not: 'scheduled' } },
          { endTime: { not: null } }
        ]
      },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });

    console.log(`Found ${matchesWithResults.length} matches with game data to clean:`);
    matchesWithResults.forEach(match => {
      console.log(`  - ${match.homeTeam.name} vs ${match.awayTeam.name}`);
    });

    // Delete all game events first
    const deletedEvents = await prisma.gameEvent.deleteMany();
    console.log(`\n✅ Deleted ${deletedEvents.count} game events`);

    // Delete all games
    const deletedGames = await prisma.game.deleteMany();
    console.log(`✅ Deleted ${deletedGames.count} games`);

    // Reset only match results/status (keep the matches themselves)
    const resetMatches = await prisma.match.updateMany({
      where: {
        OR: [
          { result: { not: null } },
          { status: { not: 'scheduled' } },
          { endTime: { not: null } }
        ]
      },
      data: {
        status: 'scheduled',
        result: null,
        endTime: null
      }
    });
    console.log(`✅ Reset ${resetMatches.count} matches to scheduled status`);

    // Reset all player statistics to zero
    const resetStats = await prisma.playerStats.updateMany({
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
    console.log(`✅ Reset statistics for ${resetStats.count} players`);

    // Show total matches remaining
    const totalMatches = await prisma.match.count();
    console.log(`\n📋 Total matches in database: ${totalMatches}`);

    // Verify cleanup
    const remainingCompleted = await prisma.match.count({
      where: {
        OR: [
          { result: { not: null } },
          { status: { not: 'scheduled' } }
        ]
      }
    });

    if (remainingCompleted === 0) {
      console.log('\n✨ All game data successfully cleaned!');
      console.log('   - All games and events deleted');
      console.log('   - All match results removed');
      console.log('   - All matches reset to scheduled status');
      console.log('   - All player stats reset to zero');
      console.log(`   - ${totalMatches} matches preserved in database`);
    } else {
      console.log(`\n⚠️  Warning: ${remainingCompleted} matches still have data`);
    }

  } catch (error) {
    console.error('❌ Error cleaning matches:', error);
    throw error;
  }
}

cleanAllMatches()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });