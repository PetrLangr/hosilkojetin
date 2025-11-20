import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateGames() {
  const matchId = 'cmg4x7wis000513fourw3n608';

  console.log(`Cleaning up duplicate games for match ${matchId}...`);

  // First, delete all game events for this match
  const deletedEvents = await prisma.gameEvent.deleteMany({
    where: {
      game: {
        matchId: matchId
      }
    }
  });

  console.log(`Deleted ${deletedEvents.count} game events`);

  // Then delete all games for this match
  const deletedGames = await prisma.game.deleteMany({
    where: {
      matchId: matchId
    }
  });

  console.log(`Deleted ${deletedGames.count} duplicate games`);

  console.log('Cleanup complete! The match now has no games saved.');
  console.log('You can re-enter the match results and they will be saved correctly.');
}

cleanupDuplicateGames()
  .catch(console.error)
  .finally(() => prisma.$disconnect());