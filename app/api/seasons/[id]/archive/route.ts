import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBPI } from '@/lib/bpi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const season = await prisma.season.findUnique({
      where: { id }
    });

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    // Get teams for this season
    const teams = await prisma.team.findMany({
      where: { seasonId: id },
      include: {
        players: true
      }
    });

    // Get completed matches for this season
    const matches = await prisma.match.findMany({
      where: { 
        seasonId: id,
        endTime: { not: null }
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        games: true
      }
    });

    // Calculate final standings for this season
    const finalStandings = teams.map(team => {
      let played = 0;
      let won = 0;
      let wonPenalty = 0;
      let lostPenalty = 0;
      let lost = 0;
      let points = 0;

      // Count match results for this team
      matches.forEach(match => {
        if (match.homeTeamId === team.id || match.awayTeamId === team.id) {
          played++;
          
          const result = match.result as any;
          if (result) {
            const isHome = match.homeTeamId === team.id;
            const teamScore = isHome ? result.home : result.away;
            const opponentScore = isHome ? result.away : result.home;
            
            if (teamScore > opponentScore) {
              if (opponentScore === 0) {
                won++;
                points += 3;
              } else {
                won++;
                points += 3;
              }
            } else if (teamScore < opponentScore) {
              if (teamScore === 0) {
                lost++;
                points += 0;
              } else {
                lost++;
                points += 1;
              }
            } else {
              // Tie
              wonPenalty++;
              lostPenalty++;
              points += 2;
            }
          }
        }
      });

      return {
        ...team,
        played,
        won,
        wonPenalty,
        lostPenalty,
        lost,
        points
      };
    }).sort((a, b) => b.points - a.points);

    // Get top players by BPI for this season
    const topPlayers = await prisma.player.findMany({
      where: { 
        team: { seasonId: id }
      },
      include: {
        team: true,
        stats: {
          where: { seasonId: id }
        }
      }
    });

    const playersWithBPI = topPlayers
      .map(player => {
        const stats = player.stats[0];
        const bpi = stats ? calculateBPI(stats) : 0;
        return {
          ...player,
          bpi,
          stats: stats || null
        };
      })
      .filter(player => player.bpi > 0)
      .sort((a, b) => b.bpi - a.bpi);

    // Get posts from this season
    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: season.startDate,
          lte: season.endDate
        },
        published: true
      },
      include: {
        author: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const archiveData = {
      season,
      teams,
      topPlayers: playersWithBPI,
      finalStandings,
      totalMatches: matches.length,
      completedMatches: matches.length,
      posts
    };

    return NextResponse.json(archiveData);
  } catch (error) {
    console.error('Error fetching archive data:', error);
    return NextResponse.json({ error: 'Failed to fetch archive data' }, { status: 500 });
  }
}