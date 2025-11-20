import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAllStats() {
  console.log('🗑️  Resetting all game statistics...\n');

  try {
    // Delete all game events
    const deletedEvents = await prisma.gameEvent.deleteMany();
    console.log(`✅ Deleted ${deletedEvents.count} game events`);

    // Delete all games
    const deletedGames = await prisma.game.deleteMany();
    console.log(`✅ Deleted ${deletedGames.count} games`);

    // Reset all matches to not completed
    const resetMatches = await prisma.match.updateMany({
      where: {
        status: 'completed'
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

    console.log('\n✨ All game statistics have been successfully reset!');
    console.log('   - All games and events deleted');
    console.log('   - All matches set back to scheduled');
    console.log('   - All player stats reset to zero');
    console.log('   - All BPI values reset to 0.0');

  } catch (error) {
    console.error('❌ Error resetting statistics:', error);
    throw error;
  }
}

resetAllStats()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });