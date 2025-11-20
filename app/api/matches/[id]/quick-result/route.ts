import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface QuickResultData {
  homeWins: number
  awayWins: number
  homeLegs: number
  awayLegs: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ message: 'Nepřihlášený uživatel' }, { status: 401 })
    }

    // Get match
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        season: true,
      },
    })

    if (!match) {
      return NextResponse.json({ message: 'Zápas nebyl nalezen' }, { status: 404 })
    }

    // Check authorization (admin or team captain)
    const isAdmin = session.user.role === 'admin'
    const isHomeCaptain = session.user.role === 'kapitán' && session.user.player?.team?.id === match.homeTeamId
    const isAwayCaptain = session.user.role === 'kapitán' && session.user.player?.team?.id === match.awayTeamId

    if (!isAdmin && !isHomeCaptain && !isAwayCaptain) {
      return NextResponse.json({ message: 'Nemáte oprávnění zadávat výsledky tohoto zápasu' }, { status: 403 })
    }

    // Parse request body
    const body: QuickResultData = await request.json()
    const { homeWins, awayWins, homeLegs, awayLegs } = body

    // Validate input
    if (
      typeof homeWins !== 'number' ||
      typeof awayWins !== 'number' ||
      typeof homeLegs !== 'number' ||
      typeof awayLegs !== 'number'
    ) {
      return NextResponse.json({ message: 'Neplatná data' }, { status: 400 })
    }

    if (homeWins < 0 || awayWins < 0 || homeLegs < 0 || awayLegs < 0) {
      return NextResponse.json({ message: 'Hodnoty nesmí být záporné' }, { status: 400 })
    }

    if (homeWins + awayWins > 19) {
      return NextResponse.json(
        { message: 'Celkový počet výher nesmí přesáhnout 19' },
        { status: 400 }
      )
    }

    if (homeLegs < homeWins || awayLegs < awayWins) {
      return NextResponse.json(
        { message: 'Počet legů musí být alespoň stejný jako počet výher' },
        { status: 400 }
      )
    }

    // Calculate match points based on HŠL rules
    let homePoints = 0
    let awayPoints = 0

    if (homeWins > awayWins) {
      homePoints = 3
      awayPoints = 0
    } else if (awayWins > homeWins) {
      homePoints = 0
      awayPoints = 3
    } else {
      // Draw (shouldn't happen in HŠL due to tiebreaker, but handle it)
      homePoints = 1
      awayPoints = 1
    }

    // Create result summary
    const resultSummary = {
      homeWins,
      awayWins,
      homeLegs,
      awayLegs,
      homePoints,
      awayPoints,
      legDifference: homeLegs - awayLegs,
      isQuickResult: true,
    }

    // Update match with quick result
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        result: resultSummary,
        isQuickResult: true,
        status: 'completed',
        endTime: new Date(),
        startTime: match.startTime || new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Rychlý výsledek byl úspěšně uložen',
      match: updatedMatch,
    })
  } catch (error) {
    console.error('Error saving quick result:', error)
    return NextResponse.json(
      { message: 'Chyba při ukládání výsledku', error: String(error) },
      { status: 500 }
    )
  }
}
