import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveSeason } from '@/lib/season';

export async function GET(request: Request) {
  try {
    const season = await resolveSeason(request);

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Seznam zápasů potřebuje z týmu jen identitu. Kompletní soupisky sem tahaly
    // ~650 kB navíc a nikdo z konzumentů seznamu (/matches, /schedule, /admin/matches)
    // je nečetl — detail zápasu si je bere z /api/matches/[id].
    const teamSummary = { select: { id: true, name: true, shortName: true } };

    const matches = await prisma.match.findMany({
      where: { seasonId: season.id },
      include: {
        homeTeam: teamSummary,
        awayTeam: teamSummary,
      },
      orderBy: [
        { round: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}