import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const season = await prisma.season.findFirst({
      where: { isActive: true }
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    const matches = await prisma.match.findMany({
      where: { seasonId: season.id },
      include: {
        homeTeam: {
          include: {
            players: true
          }
        },
        awayTeam: {
          include: {
            players: true
          }
        }
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