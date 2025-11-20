import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateStandings, sortStandings } from '@/lib/standings';

export async function GET(request: NextRequest) {
  try {
    const season = await prisma.season.findFirst({
      where: { isActive: true }
    });

    if (!season) {
      return NextResponse.json([]);
    }

    // Get all teams for the season
    const teams = await prisma.team.findMany({
      where: { seasonId: season.id }
    });

    // Get all completed matches
    const matches = await prisma.match.findMany({
      where: {
        seasonId: season.id,
        endTime: { not: null }
      },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });

    // Calculate standings
    const standings = calculateStandings(teams, matches);
    const sortedStandings = sortStandings(standings);

    return NextResponse.json(sortedStandings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}