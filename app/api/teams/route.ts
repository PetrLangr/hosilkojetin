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

    const teams = await prisma.team.findMany({
      where: { seasonId: season.id },
      include: {
        players: true,
        _count: {
          select: { players: true }
        }
      }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}