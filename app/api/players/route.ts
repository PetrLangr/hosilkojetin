import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const season = await prisma.season.findFirst({
      where: { isActive: true }
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    const players = await prisma.player.findMany({
      include: {
        team: true,
        stats: {
          where: { seasonId: season.id }
        }
      },
      orderBy: { name: 'asc' }
    });

    // For admin view, return full player data
    const playersWithStats = players.map(player => {
      const stats = player.stats[0];
      const hslIndex = stats?.hslIndex || 0; // Use stored HSL index
      const usoIndex = stats?.usoIndex || 0; // Use stored USO index

      return {
        ...player,
        hslIndex,
        usoIndex,
        stats: stats ? [stats] : []
      };
    });

    return NextResponse.json(playersWithStats);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nickname, dateOfBirth, role, teamId, photoUrl } = body;

    if (!name?.trim() || !teamId?.trim()) {
      return NextResponse.json(
        { error: 'Jméno a tým jsou povinné' },
        { status: 400 }
      );
    }

    const season = await prisma.season.findFirst({
      where: { isActive: true }
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    const player = await prisma.player.create({
      data: {
        name: name.trim(),
        nickname: nickname?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        role: role || 'hráč',
        teamId: teamId.trim(),
        photoUrl: photoUrl?.trim() || null
      },
      include: {
        team: true,
        stats: true
      }
    });

    // Create initial stats for the player
    await prisma.playerStats.create({
      data: {
        playerId: player.id,
        seasonId: season.id
      }
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}