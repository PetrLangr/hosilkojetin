import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStats() {
  try {
    const stats = await prisma.playerStats.findMany({
      include: {
        player: {
          include: {
            team: true
          }
        }
      },
      take: 10
    });

    console.log('Current player stats:');
    stats.forEach(stat => {
      console.log(`${stat.player.name} (${stat.player.team.name}):`);
      console.log(`  Total: ${stat.totalGamesPlayed} played, ${stat.totalGamesWon} won`);
      console.log(`  Singles: ${stat.singlesPlayed} played, ${stat.singlesWon} won`);
      console.log(`  BPI: ${stat.bpi}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStats();