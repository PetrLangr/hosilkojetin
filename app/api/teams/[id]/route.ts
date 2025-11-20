import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBPI } from '@/lib/bpi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            stats: true
          }
        },
        captain: true
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Calculate BPIs for players
    const playersWithBPI = team.players.map(player => {
      const stats = player.stats.find(s => s.seasonId === team.seasonId);
      const bpi = stats ? calculateBPI(stats) : 0;
      
      return {
        ...player,
        bpi,
        stats: stats || {
          singlesPlayed: 0,
          singlesWon: 0,
          S95: 0,
          S133: 0,
          S170: 0,
          CO3: 0,
          CO4: 0,
          CO5: 0,
          CO6: 0
        }
      };
    }).sort((a, b) => b.bpi - a.bpi);

    return NextResponse.json({
      ...team,
      players: playersWithBPI
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, shortName, city, logoUrl } = body;

    if (!name?.trim() || !shortName?.trim()) {
      return NextResponse.json(
        { error: 'Název a zkratka týmu jsou povinné' },
        { status: 400 }
      );
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        name: name.trim(),
        shortName: shortName.trim(),
        city: city?.trim() || '',
        logoUrl: logoUrl?.trim() || null
      },
      include: {
        players: true,
        captain: true,
        _count: {
          select: { players: true }
        }
      }
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if team has any players
    const team = await prisma.team.findUnique({
      where: { id },
      include: { _count: { select: { players: true } } }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team._count.players > 0) {
      return NextResponse.json(
        { error: 'Nelze smazat tým s hráči. Nejprve přesuňte nebo smažte všechny hráče.' },
        { status: 400 }
      );
    }

    await prisma.team.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}