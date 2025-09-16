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