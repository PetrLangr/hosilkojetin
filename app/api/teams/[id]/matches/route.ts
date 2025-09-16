import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const team = await prisma.team.findUnique({
      where: { id }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: id },
          { awayTeamId: id }
        ],
        seasonId: team.seasonId
      },
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: [
        { round: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching team matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}