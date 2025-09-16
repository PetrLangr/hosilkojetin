import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fixtures = [
  { "round": 1, "datetime": "2025-09-20T15:00:00", "homeTeam": "AK Kojetín", "awayTeam": "Dark Horse Moštárna", "venue": null, "status": "scheduled" },
  { "round": 1, "datetime": "2025-09-20T15:00:00", "homeTeam": "Bochořský koblihy", "awayTeam": "Rychlí šneci Vlkoš", "venue": null, "status": "scheduled" },
  { "round": 1, "datetime": "2025-09-20T15:00:00", "homeTeam": "Cech křivé šipky", "awayTeam": "ŠK Pivní psi Chropyně", "venue": null, "status": "scheduled" },
  { "round": 1, "datetime": "2025-09-20T15:00:00", "homeTeam": "DC Kraken Dřínov", "awayTeam": "DC Stop Chropyně", "venue": null, "status": "scheduled" },
  { "round": 1, "datetime": "2025-09-20T15:00:00", "homeTeam": "Hospoda Kanada", "awayTeam": "Stoned Lobo Ponies", "venue": null, "status": "scheduled" },
  { "round": 1, "datetime": "2025-09-20T15:00:00", "homeTeam": "Kohouti Ludslavice", "awayTeam": "Draci Počenice", "venue": null, "status": "scheduled" },
  { "round": 2, "datetime": "2025-09-27T15:00:00", "homeTeam": "DC Stop Chropyně", "awayTeam": "Cech křivé šipky", "venue": null, "status": "scheduled" },
  { "round": 2, "datetime": "2025-09-27T15:00:00", "homeTeam": "Dark Horse Moštárna", "awayTeam": "Kohouti Ludslavice", "venue": null, "status": "scheduled" },
  { "round": 2, "datetime": "2025-09-27T15:00:00", "homeTeam": "Draci Počenice", "awayTeam": "Hospoda Kanada", "venue": null, "status": "scheduled" },
  { "round": 2, "datetime": "2025-09-27T15:00:00", "homeTeam": "Rychlí šneci Vlkoš", "awayTeam": "DC Kraken Dřínov", "venue": null, "status": "scheduled" },
  { "round": 2, "datetime": "2025-09-27T15:00:00", "homeTeam": "Stoned Lobo Ponies", "awayTeam": "Bochořský koblihy", "venue": null, "status": "scheduled" },
  { "round": 2, "datetime": "2025-09-27T15:00:00", "homeTeam": "ŠK Pivní psi Chropyně", "awayTeam": "AK Kojetín", "venue": null, "status": "scheduled" },
  { "round": 3, "datetime": "2025-10-04T15:00:00", "homeTeam": "AK Kojetín", "awayTeam": "Cech křivé šipky", "venue": null, "status": "scheduled" },
  { "round": 3, "datetime": "2025-10-04T15:00:00", "homeTeam": "Bochořský koblihy", "awayTeam": "Draci Počenice", "venue": null, "status": "scheduled" },
  { "round": 3, "datetime": "2025-10-04T15:00:00", "homeTeam": "DC Kraken Dřínov", "awayTeam": "Stoned Lobo Ponies", "venue": null, "status": "scheduled" },
  { "round": 3, "datetime": "2025-10-04T15:00:00", "homeTeam": "Hospoda Kanada", "awayTeam": "Dark Horse Moštárna", "venue": null, "status": "scheduled" },
  { "round": 3, "datetime": "2025-10-04T15:00:00", "homeTeam": "Kohouti Ludslavice", "awayTeam": "ŠK Pivní psi Chropyně", "venue": null, "status": "scheduled" },
  { "round": 3, "datetime": "2025-10-04T15:00:00", "homeTeam": "Rychlí šneci Vlkoš", "awayTeam": "DC Stop Chropyně", "venue": null, "status": "scheduled" },
  { "round": 4, "datetime": "2025-10-11T15:00:00", "homeTeam": "Cech křivé šipky", "awayTeam": "Kohouti Ludslavice", "venue": null, "status": "scheduled" },
  { "round": 4, "datetime": "2025-10-11T15:00:00", "homeTeam": "DC Stop Chropyně", "awayTeam": "AK Kojetín", "venue": null, "status": "scheduled" },
  { "round": 4, "datetime": "2025-10-11T15:00:00", "homeTeam": "Dark Horse Moštárna", "awayTeam": "Bochořský koblihy", "venue": null, "status": "scheduled" },
  { "round": 4, "datetime": "2025-10-11T15:00:00", "homeTeam": "Draci Počenice", "awayTeam": "DC Kraken Dřínov", "venue": null, "status": "scheduled" },
  { "round": 4, "datetime": "2025-10-11T15:00:00", "homeTeam": "Stoned Lobo Ponies", "awayTeam": "Rychlí šneci Vlkoš", "venue": null, "status": "scheduled" },
  { "round": 4, "datetime": "2025-10-11T15:00:00", "homeTeam": "ŠK Pivní psi Chropyně", "awayTeam": "Hospoda Kanada", "venue": null, "status": "scheduled" },
  { "round": 5, "datetime": "2025-10-25T15:00:00", "homeTeam": "Bochořský koblihy", "awayTeam": "ŠK Pivní psi Chropyně", "venue": null, "status": "scheduled" },
  { "round": 5, "datetime": "2025-10-25T15:00:00", "homeTeam": "DC Kraken Dřínov", "awayTeam": "Dark Horse Moštárna", "venue": null, "status": "scheduled" },
  { "round": 5, "datetime": "2025-10-25T15:00:00", "homeTeam": "Hospoda Kanada", "awayTeam": "Cech křivé šipky", "venue": null, "status": "scheduled" },
  { "round": 5, "datetime": "2025-10-25T15:00:00", "homeTeam": "Kohouti Ludslavice", "awayTeam": "AK Kojetín", "venue": null, "status": "scheduled" },
  { "round": 5, "datetime": "2025-10-25T15:00:00", "homeTeam": "Rychlí šneci Vlkoš", "awayTeam": "Draci Počenice", "venue": null, "status": "scheduled" },
  { "round": 5, "datetime": "2025-10-25T15:00:00", "homeTeam": "Stoned Lobo Ponies", "awayTeam": "DC Stop Chropyně", "venue": null, "status": "scheduled" },
  { "round": 6, "datetime": "2025-11-01T15:00:00", "homeTeam": "AK Kojetín", "awayTeam": "Hospoda Kanada", "venue": null, "status": "scheduled" },
  { "round": 6, "datetime": "2025-11-01T15:00:00", "homeTeam": "Cech křivé šipky", "awayTeam": "Bochořský koblihy", "venue": null, "status": "scheduled" },
  { "round": 6, "datetime": "2025-11-01T15:00:00", "homeTeam": "DC Stop Chropyně", "awayTeam": "Kohouti Ludslavice", "venue": null, "status": "scheduled" },
  { "round": 6, "datetime": "2025-11-01T15:00:00", "homeTeam": "Dark Horse Moštárna", "awayTeam": "Rychlí šneci Vlkoš", "venue": null, "status": "scheduled" },
  { "round": 6, "datetime": "2025-11-01T15:00:00", "homeTeam": "Draci Počenice", "awayTeam": "Stoned Lobo Ponies", "venue": null, "status": "scheduled" },
  { "round": 6, "datetime": "2025-11-01T15:00:00", "homeTeam": "ŠK Pivní psi Chropyně", "awayTeam": "DC Kraken Dřínov", "venue": null, "status": "scheduled" },
  { "round": 7, "datetime": "2025-11-08T15:00:00", "homeTeam": "Bochořský koblihy", "awayTeam": "AK Kojetín", "venue": null, "status": "scheduled" },
  { "round": 7, "datetime": "2025-11-08T15:00:00", "homeTeam": "DC Kraken Dřínov", "awayTeam": "Cech křivé šipky", "venue": null, "status": "scheduled" },
  { "round": 7, "datetime": "2025-11-08T15:00:00", "homeTeam": "Draci Počenice", "awayTeam": "DC Stop Chropyně", "venue": null, "status": "scheduled" },
  { "round": 7, "datetime": "2025-11-08T15:00:00", "homeTeam": "Hospoda Kanada", "awayTeam": "Kohouti Ludslavice", "venue": null, "status": "scheduled" },
  { "round": 7, "datetime": "2025-11-08T15:00:00", "homeTeam": "Rychlí šneci Vlkoš", "awayTeam": "ŠK Pivní psi Chropyně", "venue": null, "status": "scheduled" },
  { "round": 7, "datetime": "2025-11-08T15:00:00", "homeTeam": "Stoned Lobo Ponies", "awayTeam": "Dark Horse Moštárna", "venue": null, "status": "scheduled" },
  { "round": 8, "datetime": "2025-11-22T15:00:00", "homeTeam": "AK Kojetín", "awayTeam": "DC Kraken Dřínov", "venue": null, "status": "scheduled" },
  { "round": 8, "datetime": "2025-11-22T15:00:00", "homeTeam": "Cech křivé šipky", "awayTeam": "Rychlí šneci Vlkoš", "venue": null, "status": "scheduled" },
  { "round": 8, "datetime": "2025-11-22T15:00:00", "homeTeam": "DC Stop Chropyně", "awayTeam": "Hospoda Kanada", "venue": null, "status": "scheduled" },
  { "round": 8, "datetime": "2025-11-22T15:00:00", "homeTeam": "Dark Horse Moštárna", "awayTeam": "Draci Počenice", "venue": null, "status": "scheduled" },
  { "round": 8, "datetime": "2025-11-22T15:00:00", "homeTeam": "Kohouti Ludslavice", "awayTeam": "Bochořský koblihy", "venue": null, "status": "scheduled" },
  { "round": 8, "datetime": "2025-11-22T15:00:00", "homeTeam": "ŠK Pivní psi Chropyně", "awayTeam": "Stoned Lobo Ponies", "venue": null, "status": "scheduled" },
  { "round": 9, "datetime": "2025-11-29T15:00:00", "homeTeam": "Bochořský koblihy", "awayTeam": "Hospoda Kanada", "venue": null, "status": "scheduled" },
  { "round": 9, "datetime": "2025-11-29T15:00:00", "homeTeam": "DC Kraken Dřínov", "awayTeam": "Kohouti Ludslavice", "venue": null, "status": "scheduled" },
  { "round": 9, "datetime": "2025-11-29T15:00:00", "homeTeam": "Dark Horse Moštárna", "awayTeam": "DC Stop Chropyně", "venue": null, "status": "scheduled" },
  { "round": 9, "datetime": "2025-11-29T15:00:00", "homeTeam": "Draci Počenice", "awayTeam": "ŠK Pivní psi Chropyně", "venue": null, "status": "scheduled" },
  { "round": 9, "datetime": "2025-11-29T15:00:00", "homeTeam": "Rychlí šneci Vlkoš", "awayTeam": "AK Kojetín", "venue": null, "status": "scheduled" },
  { "round": 9, "datetime": "2025-11-29T15:00:00", "homeTeam": "Stoned Lobo Ponies", "awayTeam": "Cech křivé šipky", "venue": null, "status": "scheduled" },
  { "round": 10, "datetime": "2025-12-06T15:00:00", "homeTeam": "AK Kojetín", "awayTeam": "Stoned Lobo Ponies", "venue": null, "status": "scheduled" },
  { "round": 10, "datetime": "2025-12-06T15:00:00", "homeTeam": "Cech křivé šipky", "awayTeam": "Draci Počenice", "venue": null, "status": "scheduled" },
  { "round": 10, "datetime": "2025-12-06T15:00:00", "homeTeam": "DC Stop Chropyně", "awayTeam": "Bochořský koblihy", "venue": null, "status": "scheduled" },
  { "round": 10, "datetime": "2025-12-06T15:00:00", "homeTeam": "Hospoda Kanada", "awayTeam": "DC Kraken Dřínov", "venue": null, "status": "scheduled" },
  { "round": 10, "datetime": "2025-12-06T15:00:00", "homeTeam": "Kohouti Ludslavice", "awayTeam": "Rychlí šneci Vlkoš", "venue": null, "status": "scheduled" },
  { "round": 10, "datetime": "2025-12-06T15:00:00", "homeTeam": "ŠK Pivní psi Chropyně", "awayTeam": "Dark Horse Moštárna", "venue": null, "status": "scheduled" },
  { "round": 11, "datetime": "2025-12-13T15:00:00", "homeTeam": "DC Kraken Dřínov", "awayTeam": "Bochořský koblihy", "venue": null, "status": "scheduled" },
  { "round": 11, "datetime": "2025-12-13T15:00:00", "homeTeam": "Dark Horse Moštárna", "awayTeam": "Cech křivé šipky", "venue": null, "status": "scheduled" },
  { "round": 11, "datetime": "2025-12-13T15:00:00", "homeTeam": "Draci Počenice", "awayTeam": "AK Kojetín", "venue": null, "status": "scheduled" },
  { "round": 11, "datetime": "2025-12-13T15:00:00", "homeTeam": "Rychlí šneci Vlkoš", "awayTeam": "Hospoda Kanada", "venue": null, "status": "scheduled" },
  { "round": 11, "datetime": "2025-12-13T15:00:00", "homeTeam": "Stoned Lobo Ponies", "awayTeam": "Kohouti Ludslavice", "venue": null, "status": "scheduled" },
  { "round": 11, "datetime": "2025-12-13T15:00:00", "homeTeam": "ŠK Pivní psi Chropyně", "awayTeam": "DC Stop Chropyně", "venue": null, "status": "scheduled" }
];

async function main() {
  console.log('Importing fixtures...');

  // Get season
  const season = await prisma.season.findFirst({
    where: { name: '2024/2025' }
  });

  if (!season) {
    console.error('Season 2024/2025 not found!');
    return;
  }

  // Get all teams
  const teams = await prisma.team.findMany({
    where: { seasonId: season.id }
  });

  const teamMap = new Map();
  for (const team of teams) {
    teamMap.set(team.name, team.id);
  }

  let matchesCreated = 0;
  let matchesSkipped = 0;

  // Process each fixture
  for (const fixture of fixtures) {
    const homeTeamId = teamMap.get(fixture.homeTeam);
    const awayTeamId = teamMap.get(fixture.awayTeam);

    if (!homeTeamId || !awayTeamId) {
      console.log('Team not found for match:', fixture.homeTeam, 'vs', fixture.awayTeam);
      continue;
    }

    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        seasonId: season.id,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        round: fixture.round
      }
    });

    if (!existingMatch) {
      const match = await prisma.match.create({
        data: {
          seasonId: season.id,
          homeTeamId: homeTeamId,
          awayTeamId: awayTeamId,
          round: fixture.round,
          startTime: new Date(fixture.datetime),
          result: null
        }
      });

      console.log(`Created match: ${fixture.homeTeam} vs ${fixture.awayTeam} (Round ${fixture.round})`);
      matchesCreated++;
    } else {
      matchesSkipped++;
    }
  }

  console.log(`\nImport complete:`);
  console.log(`- New matches created: ${matchesCreated}`);
  console.log(`- Existing matches skipped: ${matchesSkipped}`);
  console.log(`- Total fixtures processed: ${fixtures.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });