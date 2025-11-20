import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateTotalStats() {
  console.log('Populating total game statistics...');

  try {
    // Get all player stats that have singles data but no total data
    const playerStats = await prisma.playerStats.findMany({
      where: {
        totalGamesPlayed: 0,
        singlesPlayed: { gt: 0 }
      }
    });

    console.log(`Found ${playerStats.length} player records to update`);

    for (const stats of playerStats) {
      // For now, set total games equal to singles games
      // This is a temporary solution until we have mixed game data
      await prisma.playerStats.update({
        where: { id: stats.id },
        data: {
          totalGamesPlayed: stats.singlesPlayed,
          totalGamesWon: stats.singlesWon
        }
      });

      console.log(`Updated stats for player ${stats.playerId}: ${stats.singlesPlayed} total games, ${stats.singlesWon} total wins`);
    }

    console.log('Total stats population completed!');
  } catch (error) {
    console.error('Error populating total stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateTotalStats();