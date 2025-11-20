import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Match results from Kola.html
const matchData = [
  // Kolo 1 - 20.9.2025
  { round: 1, date: '2025-09-20', home: 'DC Kraken Dřínov', away: 'DC Stop Chropyně', homeLegs: 12, awayLegs: 24, homeGames: 5, awayGames: 11 },
  { round: 1, date: '2025-09-20', home: 'Cech křivé šipky', away: 'ŠK Pivní psi Chropyně', homeLegs: 20, awayLegs: 14, homeGames: 10, awayGames: 6 },
  { round: 1, date: '2025-09-20', home: 'Bochořský koblihy', away: 'Rychlí šneci Vlkoš', homeLegs: 26, awayLegs: 7, homeGames: 14, awayGames: 2 },
  { round: 1, date: '2025-09-20', home: 'AK Kojetín', away: 'Dark Horse Moštárna', homeLegs: 23, awayLegs: 11, homeGames: 11, awayGames: 5 },
  { round: 1, date: '2025-09-20', home: 'Hospoda Kanada', away: 'Stoned Lobo Ponies', homeLegs: 10, awayLegs: 25, homeGames: 3, awayGames: 13 },
  { round: 1, date: '2025-09-20', home: 'Kohouti Ludslavice', away: 'Draci Počenice', homeLegs: 26, awayLegs: 5, homeGames: 14, awayGames: 2 },

  // Kolo 2 - 27.9.2025
  { round: 2, date: '2025-09-27', home: 'DC Stop Chropyně', away: 'Cech křivé šipky', homeLegs: 16, awayLegs: 20, homeGames: 6, awayGames: 10 },
  { round: 2, date: '2025-09-27', home: 'Rychlí šneci Vlkoš', away: 'DC Kraken Dřínov', homeLegs: 11, awayLegs: 23, homeGames: 5, awayGames: 11 },
  { round: 2, date: '2025-09-27', home: 'ŠK Pivní psi Chropyně', away: 'AK Kojetín', homeLegs: 10, awayLegs: 25, homeGames: 3, awayGames: 13 },
  { round: 2, date: '2025-09-27', home: 'Stoned Lobo Ponies', away: 'Bochořský koblihy', homeLegs: 22, awayLegs: 16, homeGames: 10, awayGames: 6 },
  { round: 2, date: '2025-09-27', home: 'Dark Horse Moštárna', away: 'Kohouti Ludslavice', homeLegs: 16, awayLegs: 19, homeGames: 7, awayGames: 9 },
  { round: 2, date: '2025-09-27', home: 'Draci Počenice', away: 'Hospoda Kanada', homeLegs: 19, awayLegs: 13, homeGames: 9, awayGames: 7 },

  // Kolo 3 - 4.10.2025
  { round: 3, date: '2025-10-04', home: 'DC Stop Chropyně', away: 'Rychlí šneci Vlkoš', homeLegs: 21, awayLegs: 17, homeGames: 9, awayGames: 8 },
  { round: 3, date: '2025-10-04', home: 'AK Kojetín', away: 'Cech křivé šipky', homeLegs: 15, awayLegs: 24, homeGames: 5, awayGames: 11 },
  { round: 3, date: '2025-10-04', home: 'DC Kraken Dřínov', away: 'Stoned Lobo Ponies', homeLegs: 9, awayLegs: 28, homeGames: 2, awayGames: 14 },
  { round: 3, date: '2025-10-04', home: 'Kohouti Ludslavice', away: 'ŠK Pivní psi Chropyně', homeLegs: 21, awayLegs: 12, homeGames: 11, awayGames: 5 },
  { round: 3, date: '2025-10-04', home: 'Bochořský koblihy', away: 'Draci Počenice', homeLegs: 20, awayLegs: 13, homeGames: 10, awayGames: 6 },
  { round: 3, date: '2025-10-04', home: 'Hospoda Kanada', away: 'Dark Horse Moštárna', homeLegs: 7, awayLegs: 21, homeGames: 3, awayGames: 13 },

  // Kolo 4 - 11.10.2025
  { round: 4, date: '2025-10-11', home: 'DC Stop Chropyně', away: 'AK Kojetín', homeLegs: 16, awayLegs: 21, homeGames: 6, awayGames: 10 },
  { round: 4, date: '2025-10-11', home: 'Stoned Lobo Ponies', away: 'Rychlí šneci Vlkoš', homeLegs: 27, awayLegs: 2, homeGames: 15, awayGames: 1 },
  { round: 4, date: '2025-10-11', home: 'Cech křivé šipky', away: 'Kohouti Ludslavice', homeLegs: 17, awayLegs: 17, homeGames: 7, awayGames: 9 },
  { round: 4, date: '2025-10-11', home: 'Draci Počenice', away: 'DC Kraken Dřínov', homeLegs: 10, awayLegs: 23, homeGames: 5, awayGames: 11 },
  { round: 4, date: '2025-10-11', home: 'ŠK Pivní psi Chropyně', away: 'Hospoda Kanada', homeLegs: 26, awayLegs: 10, homeGames: 14, awayGames: 2 },
  { round: 4, date: '2025-10-11', home: 'Dark Horse Moštárna', away: 'Bochořský koblihy', homeLegs: 16, awayLegs: 16, homeGames: 9, awayGames: 7 },

  // Kolo 5 - 25.10.2025
  { round: 5, date: '2025-10-25', home: 'Stoned Lobo Ponies', away: 'DC Stop Chropyně', homeLegs: 23, awayLegs: 10, homeGames: 12, awayGames: 4 },
  { round: 5, date: '2025-10-25', home: 'Kohouti Ludslavice', away: 'AK Kojetín', homeLegs: 19, awayLegs: 16, homeGames: 10, awayGames: 6 },
  { round: 5, date: '2025-10-25', home: 'Rychlí šneci Vlkoš', away: 'Draci Počenice', homeLegs: 14, awayLegs: 18, homeGames: 7, awayGames: 9 },
  { round: 5, date: '2025-10-25', home: 'Hospoda Kanada', away: 'Cech křivé šipky', homeLegs: 15, awayLegs: 19, homeGames: 6, awayGames: 10 },
  { round: 5, date: '2025-10-25', home: 'DC Kraken Dřínov', away: 'Dark Horse Moštárna', homeLegs: 16, awayLegs: 19, homeGames: 7, awayGames: 9 },
  { round: 5, date: '2025-10-25', home: 'Bochořský koblihy', away: 'ŠK Pivní psi Chropyně', homeLegs: 18, awayLegs: 16, homeGames: 10, awayGames: 6 },

  // Kolo 6 - 1.11.2025
  { round: 6, date: '2025-11-01', home: 'DC Stop Chropyně', away: 'Kohouti Ludslavice', homeLegs: 20, awayLegs: 15, homeGames: 10, awayGames: 6 },
  { round: 6, date: '2025-11-01', home: 'Draci Počenice', away: 'Stoned Lobo Ponies', homeLegs: 6, awayLegs: 25, homeGames: 2, awayGames: 14 },
  { round: 6, date: '2025-11-01', home: 'AK Kojetín', away: 'Hospoda Kanada', homeLegs: 22, awayLegs: 8, homeGames: 12, awayGames: 4 },
  { round: 6, date: '2025-11-01', home: 'Dark Horse Moštárna', away: 'Rychlí šneci Vlkoš', homeLegs: 23, awayLegs: 13, homeGames: 11, awayGames: 5 },
  { round: 6, date: '2025-11-01', home: 'Cech křivé šipky', away: 'Bochořský koblihy', homeLegs: 22, awayLegs: 12, homeGames: 11, awayGames: 5 },
  { round: 6, date: '2025-11-01', home: 'ŠK Pivní psi Chropyně', away: 'DC Kraken Dřínov', homeLegs: 12, awayLegs: 25, homeGames: 4, awayGames: 12 },

  // Kolo 7 - 8.11.2025
  { round: 7, date: '2025-11-08', home: 'Draci Počenice', away: 'DC Stop Chropyně', homeLegs: 17, awayLegs: 21, homeGames: 7, awayGames: 9 },
  { round: 7, date: '2025-11-08', home: 'Hospoda Kanada', away: 'Kohouti Ludslavice', homeLegs: 10, awayLegs: 25, homeGames: 4, awayGames: 12 },
  { round: 7, date: '2025-11-08', home: 'Stoned Lobo Ponies', away: 'Dark Horse Moštárna', homeLegs: 23, awayLegs: 11, homeGames: 11, awayGames: 5 },
  { round: 7, date: '2025-11-08', home: 'Bochořský koblihy', away: 'AK Kojetín', homeLegs: 21, awayLegs: 17, homeGames: 9, awayGames: 7 },
  { round: 7, date: '2025-11-08', home: 'Rychlí šneci Vlkoš', away: 'ŠK Pivní psi Chropyně', homeLegs: 21, awayLegs: 17, homeGames: 10, awayGames: 6 },
  { round: 7, date: '2025-11-08', home: 'DC Kraken Dřínov', away: 'Cech křivé šipky', homeLegs: 21, awayLegs: 13, homeGames: 10, awayGames: 6 },

  // Kolo 8 - 22.11.2025 (partial)
  { round: 8, date: '2025-11-22', home: 'ŠK Pivní psi Chropyně', away: 'Stoned Lobo Ponies', homeLegs: 7, awayLegs: 25, homeGames: 3, awayGames: 13 },
]

function calculatePoints(homeGames: number, awayGames: number): { homePoints: number, awayPoints: number } {
  if (homeGames > awayGames) {
    if (awayGames <= 4) {
      return { homePoints: 3, awayPoints: 0 }
    } else {
      return { homePoints: 2, awayPoints: 1 }
    }
  } else if (awayGames > homeGames) {
    if (homeGames <= 4) {
      return { homePoints: 0, awayPoints: 3 }
    } else {
      return { homePoints: 1, awayPoints: 2 }
    }
  } else {
    return { homePoints: 1, awayPoints: 1 }
  }
}

async function main() {
  console.log('Updating match results...\n')

  const season = await prisma.season.findFirst({
    where: { isActive: true }
  })

  if (!season) {
    console.error('No active season found!')
    return
  }

  console.log(`Season: ${season.name}\n`)

  const teams = await prisma.team.findMany({
    where: { seasonId: season.id }
  })

  const teamMap = new Map<string, string>()
  teams.forEach(team => {
    teamMap.set(team.name.trim(), team.id)
  })

  let updated = 0
  let notFound = 0
  let alreadyComplete = 0

  for (const match of matchData) {
    const homeTeamId = teamMap.get(match.home.trim())
    const awayTeamId = teamMap.get(match.away.trim())

    if (!homeTeamId || !awayTeamId) {
      console.error(`❌ Team not found: ${!homeTeamId ? match.home : match.away}`)
      notFound++
      continue
    }

    // Find existing match
    const existing = await prisma.match.findFirst({
      where: {
        seasonId: season.id,
        homeTeamId,
        awayTeamId,
        round: match.round
      }
    })

    if (!existing) {
      console.log(`⚠️  Match not found: ${match.home} vs ${match.away} (round ${match.round})`)
      notFound++
      continue
    }

    // Skip if already has detailed result (with gameResults)
    if (existing.result && (existing.result as any).gameResults) {
      console.log(`⏭️  Already detailed: ${match.home} vs ${match.away} (round ${match.round})`)
      alreadyComplete++
      continue
    }

    const { homePoints, awayPoints } = calculatePoints(match.homeGames, match.awayGames)

    // Update match with result
    await prisma.match.update({
      where: { id: existing.id },
      data: {
        startTime: new Date(`${match.date}T15:00:00`),
        endTime: new Date(`${match.date}T18:00:00`),
        status: 'completed',
        isQuickResult: true,
        result: {
          homeLegs: match.homeLegs,
          awayLegs: match.awayLegs,
          homeWins: match.homeGames,
          awayWins: match.awayGames,
          homePoints,
          awayPoints
        }
      }
    })

    console.log(`✅ Updated: ${match.home} ${match.homeGames}:${match.awayGames} ${match.away} (round ${match.round})`)
    updated++
  }

  console.log(`\n--- Summary ---`)
  console.log(`Updated: ${updated}`)
  console.log(`Already detailed: ${alreadyComplete}`)
  console.log(`Not found: ${notFound}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
