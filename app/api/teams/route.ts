import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { resolveSeason } from '@/lib/season';

export async function GET(request: Request) {
  try {
    const season = await resolveSeason(request);

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    const teams = await prisma.team.findMany({
      where: { seasonId: season.id },
      include: {
        players: true,
        captain: true,
        _count: {
          select: { players: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, shortName, city, logoUrl } = body;

    if (!name?.trim() || !shortName?.trim()) {
      return NextResponse.json(
        { error: 'Název a zkratka týmu jsou povinné' },
        { status: 400 }
      );
    }

    const season = await prisma.season.findFirst({
      where: { isActive: true }
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        shortName: shortName.trim(),
        city: city?.trim() || '',
        logoUrl: logoUrl?.trim() || null,
        seasonId: season.id
      },
      include: {
        players: true,
        captain: true,
        _count: {
          select: { players: true }
        }
      }
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}