import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBPI } from '@/lib/bpi';

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
      }
    });

    // Calculate BPI for each player and format data
    const playersWithBPI = players.map(player => {
      const stats = player.stats[0];
      const bpi = stats ? calculateBPI(stats) : 0;
      
      return {
        id: player.id,
        name: player.name,
        nickname: player.nickname,
        teamName: player.team.name,
        bpi,
        played: stats?.singlesPlayed || 0,
        won: stats?.singlesWon || 0,
        winRate: stats?.singlesPlayed ? Math.round((stats.singlesWon / stats.singlesPlayed) * 100) : 0
      };
    });

    // Sort by BPI descending
    playersWithBPI.sort((a, b) => b.bpi - a.bpi);

    return NextResponse.json(playersWithBPI);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}