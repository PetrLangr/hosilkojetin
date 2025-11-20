import { PrismaClient } from '@prisma/client';
import { calculateBPI } from '../lib/bpi';

const prisma = new PrismaClient();

async function updateAllBPI() {
  console.log('Updating BPI for all players...');

  const season = await prisma.season.findFirst({
    where: { isActive: true }
  });

  if (!season) {
    console.log('No active season found');
    return;
  }

  const playerStats = await prisma.playerStats.findMany({
    where: { seasonId: season.id },
    include: { player: true }
  });

  let updated = 0;
  for (const stats of playerStats) {
    const bpi = calculateBPI({
      singlesPlayed: stats.singlesPlayed || 0,
      singlesWon: stats.singlesWon || 0,
      S95: stats.S95 || 0,
      S133: stats.S133 || 0,
      S170: stats.S170 || 0,
      CO3: stats.CO3 || 0,
      CO4: stats.CO4 || 0,
      CO5: stats.CO5 || 0,
      CO6: stats.CO6 || 0
    });

    await prisma.playerStats.update({
      where: { id: stats.id },
      data: { bpi }
    });

    if (bpi > 0) {
      console.log(`Updated ${stats.player.name}: BPI = ${bpi.toFixed(1)}`);
      updated++;
    }
  }

  console.log(`\nUpdated BPI for ${updated} players with non-zero values`);
  console.log(`Total players processed: ${playerStats.length}`);
}

updateAllBPI()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });