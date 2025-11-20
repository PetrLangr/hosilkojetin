import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupKeepOne() {
  console.log('🧹 Cleaning database - keeping only one match...\n');

  try {
    // 1. Delete ALL game events
    const deletedEvents = await prisma.gameEvent.deleteMany();
    console.log(`✅ Deleted ${deletedEvents.count} game events`);

    // 2. Delete ALL games
    const deletedGames = await prisma.game.deleteMany();
    console.log(`✅ Deleted ${deletedGames.count} games`);

    // 3. Reset ALL player statistics to zero
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

    // 4. Get all matches
    const allMatches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: { startTime: 'asc' }
    });

    console.log(`\n📋 Found ${allMatches.length} matches total`);

    if (allMatches.length > 1) {
      // Keep the first match, delete all others
      const matchToKeep = allMatches[0];
      const matchesToDelete = allMatches.slice(1);

      console.log(`\n🎯 Keeping match: ${matchToKeep.homeTeam.name} vs ${matchToKeep.awayTeam.name}`);
      console.log(`🗑️  Deleting ${matchesToDelete.length} other matches...`);

      // Delete all matches except the first one
      const deletedMatches = await prisma.match.deleteMany({
        where: {
          id: {
            in: matchesToDelete.map(m => m.id)
          }
        }
      });
      console.log(`✅ Deleted ${deletedMatches.count} matches`);
    }

    // 5. Reset the remaining match to clean scheduled state
    const resetMatch = await prisma.match.updateMany({
      data: {
        status: 'scheduled',
        result: null,
        endTime: null
      }
    });
    console.log(`✅ Reset the remaining match to scheduled status`);

    // 6. Verify final state
    const finalMatchCount = await prisma.match.count();
    const finalGameCount = await prisma.game.count();
    const finalEventCount = await prisma.gameEvent.count();

    console.log('\n✨ Database cleanup complete!');
    console.log(`   - Matches remaining: ${finalMatchCount}`);
    console.log(`   - Games remaining: ${finalGameCount}`);
    console.log(`   - Events remaining: ${finalEventCount}`);
    console.log('   - All player stats reset to zero');

    if (finalMatchCount === 1) {
      const remainingMatch = await prisma.match.findFirst({
        include: {
          homeTeam: true,
          awayTeam: true
        }
      });
      console.log(`\n📌 Remaining match: ${remainingMatch?.homeTeam.name} vs ${remainingMatch?.awayTeam.name}`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupKeepOne()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });