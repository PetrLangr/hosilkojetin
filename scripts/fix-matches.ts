import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing matches without endTime...\n')

  // Get all completed matches without endTime
  const matches = await prisma.match.findMany({
    where: {
      status: 'completed',
      endTime: null,
      result: { not: null }
    },
    include: {
      homeTeam: true,
      awayTeam: true
    }
  })

  console.log(`Found ${matches.length} matches to fix\n`)

  for (const match of matches) {
    const result = match.result as any

    // Fix result format if needed
    const updatedResult = {
      ...result,
      homeWins: result.homeWins ?? result.homeGames ?? result.homeScore ?? 0,
      awayWins: result.awayWins ?? result.awayGames ?? result.awayScore ?? 0,
      homeLegs: result.homeLegs ?? 0,
      awayLegs: result.awayLegs ?? 0
    }

    // Set endTime to 3 hours after startTime
    const endTime = match.startTime
      ? new Date(match.startTime.getTime() + 3 * 60 * 60 * 1000)
      : new Date()

    await prisma.match.update({
      where: { id: match.id },
      data: {
        endTime,
        result: updatedResult
      }
    })

    console.log(`✅ Fixed: ${match.homeTeam.name} vs ${match.awayTeam.name} (round ${match.round})`)
  }

  console.log(`\nFixed ${matches.length} matches`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
