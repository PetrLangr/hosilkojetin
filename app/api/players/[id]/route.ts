import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, nickname, dateOfBirth, role, teamId, photoUrl } = body;

    if (!name?.trim() || !teamId?.trim()) {
      return NextResponse.json(
        { error: 'Jméno a tým jsou povinné' },
        { status: 400 }
      );
    }

    const player = await prisma.player.update({
      where: { id },
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

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if player has any game events or is a captain
    const player = await prisma.player.findUnique({
      where: { id },
      include: { 
        gameEvents: true,
        captainOf: true,
        stats: true
      }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    if (player.captainOf.length > 0) {
      return NextResponse.json(
        { error: 'Nelze smazat hráče, který je kapitánem týmu. Nejprve změňte kapitána.' },
        { status: 400 }
      );
    }

    // Delete player stats first (due to foreign key constraints)
    await prisma.playerStats.deleteMany({
      where: { playerId: id }
    });

    // Delete game events
    await prisma.gameEvent.deleteMany({
      where: { playerId: id }
    });

    // Delete player
    await prisma.player.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}