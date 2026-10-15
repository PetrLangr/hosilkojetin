import { notFound } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { calculateBPI } from '@/lib/bpi';
import { TeamLogo } from '@/components/team-logo';
import { TeamMark } from '@/components/team-mark';
import { getTeamLogo } from '@/lib/team-logos';

async function getTeamDetail(id: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            stats: true
          }
        },
        captain: true,
        homeMatches: {
          include: {
            awayTeam: true
          },
          orderBy: [
            { round: 'asc' },
            { startTime: 'asc' }
          ]
        },
        awayMatches: {
          include: {
            homeTeam: true
          },
          orderBy: [
            { round: 'asc' },
            { startTime: 'asc' }
          ]
        },
        season: true
      }
    });

    return team;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
}

function calculateTeamStats(team: any) {
  let played = 0;
  let won = 0;
  let lost = 0;
  let legsFor = 0;
  let legsAgainst = 0;

  // Process home matches
  team.homeMatches.forEach((match: any) => {
    if (match.endTime && match.result) {
      played++;
      const homeWins = match.result.homeWins ?? match.result.homeScore ?? 0;
      const awayWins = match.result.awayWins ?? match.result.awayScore ?? 0;
      const homeLegs = match.result.homeLegs ?? 0;
      const awayLegs = match.result.awayLegs ?? 0;

      if (homeWins > awayWins) won++;
      else if (homeWins < awayWins) lost++;

      legsFor += homeLegs;
      legsAgainst += awayLegs;
    }
  });

  // Process away matches
  team.awayMatches.forEach((match: any) => {
    if (match.endTime && match.result) {
      played++;
      const homeWins = match.result.homeWins ?? match.result.homeScore ?? 0;
      const awayWins = match.result.awayWins ?? match.result.awayScore ?? 0;
      const homeLegs = match.result.homeLegs ?? 0;
      const awayLegs = match.result.awayLegs ?? 0;

      if (awayWins > homeWins) won++;
      else if (awayWins < homeWins) lost++;

      legsFor += awayLegs;
      legsAgainst += homeLegs;
    }
  });

  return {
    played,
    won,
    lost,
    legsFor,
    legsAgainst,
    legDifference: legsFor - legsAgainst,
    winPercentage: played > 0 ? Math.round((won / played) * 100) : 0
  };
}

const dateShort = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) : '—';

function Panel({ title, meta, children }: { title: string; meta?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex h-10 items-center gap-2 border-b border-border bg-muted px-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {meta && <span className="text-xs text-muted-foreground tnum">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: string; tone?: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <div className="label-muted">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className={`text-xl font-bold tnum ${tone ?? 'text-slate-900'}`}>{value}</span>
        {sub && <span className="text-xs text-muted-foreground tnum">{sub}</span>}
      </div>
    </div>
  );
}

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const team = await getTeamDetail(id);

  if (!team) {
    notFound();
  }

  const teamStats = calculateTeamStats(team);
  const allMatches = [...team.homeMatches, ...team.awayMatches]
    .sort((a, b) => {
      // Sort by round first, then by startTime
      if (a.round !== b.round) return (a.round ?? 0) - (b.round ?? 0);
      return new Date(a.startTime || '').getTime() - new Date(b.startTime || '').getTime();
    });

  // Calculate player BPIs
  const playersWithBPI = team.players.map((player: any) => {
    const stats = player.stats.find((s: any) => s.seasonId === team.seasonId);
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

  const diff = teamStats.legDifference;

  return (
    <div className="space-y-4">
      {/* Hlavička týmu: jeden řádek, žádný hero — obsah začíná hned pod ní */}
      <div className="border-b border-border pb-3">
        <Link
          href="/teams"
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Týmy
        </Link>
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-white p-1">
            <TeamLogo teamName={team.name} className="h-full w-full object-contain" fallbackText={team.shortName} />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">{team.name}</h1>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">{team.shortName}</span>
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {[team.city, team.season?.name, team.captain && `kapitán ${team.captain.name}`]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        </div>
      </div>

      {/* Souhrn — jeden pruh místo barevných dlaždic */}
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
        <Stat label="Zápasy" value={teamStats.played} sub={allMatches.length ? `z ${allMatches.length}` : undefined} />
        <Stat
          label="V–P"
          value={
            <>
              <span className="text-emerald-700">{teamStats.won}</span>
              <span className="mx-0.5 text-muted-foreground">–</span>
              <span className="text-red-700">{teamStats.lost}</span>
            </>
          }
        />
        <Stat label="Úspěšnost" value={`${teamStats.winPercentage} %`} />
        <Stat label="Legy" value={`${teamStats.legsFor}:${teamStats.legsAgainst}`} />
        <Stat
          label="Rozdíl"
          value={`${diff > 0 ? '+' : ''}${diff}`}
          tone={diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-red-700' : undefined}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel title="Soupiska" meta={playersWithBPI.length}>
          {playersWithBPI.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">Tým zatím nemá hráče.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-8 text-center">#</TableHead>
                  <TableHead>Hráč</TableHead>
                  <TableHead className="w-11 text-center" title="Odehrané singly">S</TableHead>
                  <TableHead className="w-11 text-center" title="Vyhrané singly">V</TableHead>
                  <TableHead className="hidden w-11 text-center sm:table-cell" title="Náhozy 95+">95+</TableHead>
                  <TableHead className="hidden w-11 text-center sm:table-cell" title="Náhozy 133+">133+</TableHead>
                  <TableHead className="hidden w-11 text-center sm:table-cell" title="Náhozy 170+">170</TableHead>
                  <TableHead className="hidden w-11 text-center md:table-cell" title="Zavření na 3–6 šipek (CO3–CO6)">CO</TableHead>
                  <TableHead className="w-12 text-center text-slate-900" title="Bodový index hráče">BPI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playersWithBPI.map((player, index) => {
                  const st = player.stats;
                  const checkouts = (st.CO3 ?? 0) + (st.CO4 ?? 0) + (st.CO5 ?? 0) + (st.CO6 ?? 0);
                  return (
                    <TableRow key={player.id} className="h-row border-border hover:bg-rose-50/50">
                      <TableCell className="py-0 text-center text-xs text-muted-foreground tnum">{index + 1}</TableCell>
                      {/* Detail hráče byl zrušen — jméno zůstává jako text */}
                      <TableCell className="max-w-0 py-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="truncate font-medium text-slate-900">{player.name}</span>
                          {player.nickname && (
                            <span className="hidden truncate text-xs text-muted-foreground md:inline">
                              „{player.nickname}“
                            </span>
                          )}
                          {player.role !== 'hráč' && (
                            <span className={`shrink-0 text-[11px] ${player.role === 'kapitán' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                              {player.role === 'kapitán' ? 'K' : player.role}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-0 text-center tnum">{st.singlesPlayed}</TableCell>
                      <TableCell className="py-0 text-center tnum">{st.singlesWon}</TableCell>
                      <TableCell className="hidden py-0 text-center tnum text-slate-600 sm:table-cell">{st.S95}</TableCell>
                      <TableCell className="hidden py-0 text-center tnum text-slate-600 sm:table-cell">{st.S133}</TableCell>
                      <TableCell className="hidden py-0 text-center tnum text-slate-600 sm:table-cell">{st.S170}</TableCell>
                      <TableCell className="hidden py-0 text-center tnum text-slate-600 md:table-cell">{checkouts}</TableCell>
                      <TableCell className="py-0 text-center font-semibold tnum text-slate-900">
                        {st.singlesPlayed > 0 ? Math.round(player.bpi) : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel title="Zápasy" meta={allMatches.length ? `${teamStats.played}/${allMatches.length}` : undefined}>
          {allMatches.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">Žádné naplánované zápasy.</p>
          ) : (
            <ul className="divide-y divide-border">
              {allMatches.map((match: any) => {
                const isHome = match.homeTeamId === team.id;
                const opponent = isHome ? match.awayTeam : match.homeTeam;
                const hasResult = match.endTime && match.result;

                // Skóre — výsledek má dvě varianty názvů polí
                let teamScore = 0;
                let opponentScore = 0;
                if (hasResult) {
                  const homeWins = match.result.homeWins ?? match.result.homeScore ?? 0;
                  const awayWins = match.result.awayWins ?? match.result.awayScore ?? 0;
                  teamScore = isHome ? homeWins : awayWins;
                  opponentScore = isHome ? awayWins : homeWins;
                }
                const outcome = !hasResult ? null : teamScore > opponentScore ? 'V' : teamScore < opponentScore ? 'P' : 'R';

                const row = (
                  <>
                    <span className="w-7 shrink-0 text-xs text-muted-foreground tnum">
                      {match.round ? `${match.round}.` : ''}
                    </span>
                    <span className="w-10 shrink-0 text-xs text-muted-foreground tnum">{dateShort(match.startTime)}</span>
                    <TeamMark name={opponent.name} shortName={opponent.shortName} logoUrl={getTeamLogo(opponent.name)} />
                    <span className="min-w-0 flex-1 truncate">
                      {/* Slovem, ne písmenem — „V“ už ve sloupci výsledku znamená výhru */}
                      <span className="mr-1.5 text-[11px] text-muted-foreground">{isHome ? 'doma' : 'venku'}</span>
                      <span className="font-medium text-slate-900">{opponent.name}</span>
                    </span>
                    {hasResult ? (
                      <>
                        <span className="shrink-0 font-semibold tnum text-slate-900">
                          {teamScore}:{opponentScore}
                        </span>
                        <span
                          className={`w-4 shrink-0 text-center text-xs font-bold ${
                            outcome === 'V' ? 'text-emerald-700' : outcome === 'P' ? 'text-red-700' : 'text-muted-foreground'
                          }`}
                          title={outcome === 'V' ? 'Výhra' : outcome === 'P' ? 'Prohra' : 'Remíza'}
                        >
                          {outcome}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary" />
                      </>
                    ) : (
                      <span className="shrink-0 pr-5 text-xs text-muted-foreground">–:–</span>
                    )}
                  </>
                );

                return (
                  <li key={match.id}>
                    {/* Detail nezadaného zápasu vyžaduje přihlášení, tak ho
                        nenabízíme — u naplánovaného zápasu není co ukázat. */}
                    {hasResult ? (
                      <Link href={`/match/${match.id}`} className="group flex h-row items-center gap-2 px-3 text-sm hover:bg-muted">
                        {row}
                      </Link>
                    ) : (
                      <div className="flex h-row items-center gap-2 px-3 text-sm">{row}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
