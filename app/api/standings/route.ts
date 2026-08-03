import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateStandings, sortStandings } from '@/lib/standings';
import { resolveSeason } from '@/lib/season';
import { officialStandings } from '@/lib/archive';

export async function GET(request: NextRequest) {
  try {
    const season = await resolveSeason(request);

    if (!season) {
      return NextResponse.json([]);
    }

    // Archivní sezóny mají uloženou tabulku tak, jak ji liga vyhlásila. Nedopočítáváme ji:
    // do 2016/17 se hrálo bez VP/PP, takže dnešní pravidlo by dalo jiná čísla, než tehdy platila.
    if (season.isArchived && season.finalStandings) {
      return NextResponse.json(officialStandings(season));
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
    const sortedStandings = sortStandings(standings, matches);

    return NextResponse.json(sortedStandings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}