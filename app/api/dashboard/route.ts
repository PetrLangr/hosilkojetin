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

    // Get counts
    const [teamsCount, playersCount, totalMatches, completedMatches] = await Promise.all([
      prisma.team.count({ where: { seasonId: season.id } }),
      prisma.player.count({ 
        where: { team: { seasonId: season.id } }
      }),
      prisma.match.count({ where: { seasonId: season.id } }),
      prisma.match.count({ 
        where: { 
          seasonId: season.id,
          endTime: { not: null }
        }
      })
    ]);

    // Get unique rounds to calculate progress
    const rounds = await prisma.match.findMany({
      where: { seasonId: season.id },
      select: { round: true },
      distinct: ['round']
    });

    const totalRounds = rounds.length;

    // Get recent results (completed matches)
    const recentResults = await prisma.match.findMany({
      where: {
        seasonId: season.id,
        endTime: { not: null }
      },
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: { endTime: 'desc' },
      take: 5
    });

    // Get upcoming matches
    const upcomingMatches = await prisma.match.findMany({
      where: {
        seasonId: season.id,
        endTime: null
      },
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: { startTime: 'asc' },
      take: 5
    });

    return NextResponse.json({
      stats: {
        teamsCount,
        playersCount,
        matchesProgress: `${completedMatches}/${totalMatches}`,
        roundsProgress: `0/${totalRounds}` // TODO: Calculate completed rounds
      },
      recentResults: recentResults.map(match => ({
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        result: match.result || 'TBD'
      })),
      upcomingMatches: upcomingMatches.map(match => ({
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        date: match.startTime
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}