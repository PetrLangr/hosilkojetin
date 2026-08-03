import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateStandings, sortStandings } from '@/lib/standings';
import { officialStandings } from '@/lib/archive';

/** Přehled všech sezón pro /archiv — vítěz, rozsah dat a poznámky. */
export async function GET() {
  try {
    const seasons = await prisma.season.findMany({ orderBy: { startDate: 'desc' } });

    const summaries = await Promise.all(
      seasons.map(async (season) => {
        const [teamCount, matchCount, playerCount] = await Promise.all([
          prisma.team.count({ where: { seasonId: season.id } }),
          prisma.match.count({ where: { seasonId: season.id } }),
          prisma.player.count({ where: { team: { seasonId: season.id } } }),
        ]);

        // Archivní sezóny mají vyhlášenou tabulku uloženou, živá se dopočítává ze zápasů.
        let table;
        if (season.isArchived && season.finalStandings) {
          table = officialStandings(season);
        } else {
          const [teams, matches] = await Promise.all([
            prisma.team.findMany({ where: { seasonId: season.id } }),
            prisma.match.findMany({
              where: { seasonId: season.id, endTime: { not: null } },
              include: { homeTeam: true, awayTeam: true },
            }),
          ]);
          table = sortStandings(calculateStandings(teams, matches), matches);
        }

        const winner = table[0];
        return {
          id: season.id,
          name: season.name,
          isActive: season.isActive,
          isArchived: season.isArchived,
          pointsSystem: season.pointsSystem,
          archiveNote: season.archiveNote,
          teamCount,
          matchCount,
          playerCount,
          rounds: matchCount ? Math.max(...(await prisma.match.findMany({
            where: { seasonId: season.id }, select: { round: true },
          })).map((m) => m.round ?? 0)) : 0,
          winner: winner ? { name: winner.teamName, points: winner.points } : null,
          runnerUp: table[1] ? { name: table[1].teamName, points: table[1].points } : null,
          third: table[2] ? { name: table[2].teamName, points: table[2].points } : null,
        };
      })
    );

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching archive:', error);
    return NextResponse.json({ error: 'Failed to fetch archive' }, { status: 500 });
  }
}
