import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllStats() {
  try {
    const stats = await prisma.playerStats.findMany({
      where: {
        OR: [
          { totalGamesPlayed: { gt: 0 } },
          { singlesPlayed: { gt: 0 } }
        ]
      },
      include: {
        player: {
          include: {
            team: true
          }
        }
      },
      orderBy: {
        totalGamesPlayed: 'desc'
      }
    });

    console.log(`Found ${stats.length} players with stats:`);
    stats.forEach(stat => {
      console.log(`${stat.player.name} (${stat.player.team.name}):`);
      console.log(`  Total: ${stat.totalGamesPlayed} played, ${stat.totalGamesWon} won (${stat.totalGamesPlayed > 0 ? Math.round((stat.totalGamesWon / stat.totalGamesPlayed) * 100) : 0}%)`);
      console.log(`  Singles: ${stat.singlesPlayed} played, ${stat.singlesWon} won (${stat.singlesPlayed > 0 ? Math.round((stat.singlesWon / stat.singlesPlayed) * 100) : 0}%)`);
      console.log(`  BPI: ${stat.bpi}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllStats();