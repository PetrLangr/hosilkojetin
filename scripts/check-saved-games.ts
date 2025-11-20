import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSavedGames() {
  try {
    // Check what games we have in the database
    const games = await prisma.game.findMany({
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${games.length} games in database:`);
    
    games.forEach(game => {
      console.log(`Game ${game.order} - ${game.type} (${game.match.homeTeam.name} vs ${game.match.awayTeam.name})`);
      console.log(`  Participants:`, game.participants);
      console.log(`  Result:`, game.result);
      console.log('---');
    });

    // Check if matches have endTime set
    const completedMatches = await prisma.match.findMany({
      where: { endTime: { not: null } },
      include: {
        homeTeam: true,
        awayTeam: true,
        games: true
      }
    });

    console.log(`\nCompleted matches: ${completedMatches.length}`);
    completedMatches.forEach(match => {
      console.log(`${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.games.length} games`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSavedGames();