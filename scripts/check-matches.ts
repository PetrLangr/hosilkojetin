import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMatches() {
  const matches = await prisma.match.findMany({
    where: {
      status: 'completed'
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      games: true
    }
  });

  console.log(`\n🏆 Found ${matches.length} completed matches\n`);

  for (const match of matches) {
    console.log(`Match: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
    console.log(`Status: ${match.status}`);
    console.log(`Result:`, match.result);
    console.log(`Games: ${match.games.length}`);

    for (const game of match.games) {
      console.log(`  - Game ${game.order}: Type=${game.type}, Format=${game.format}`);
      console.log(`    Result:`, JSON.stringify(game.result, null, 2).substring(0, 200));
      console.log(`    Participants:`, JSON.stringify(game.participants, null, 2).substring(0, 200));
    }
    console.log('---');
  }
}

checkMatches()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });