"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, Crown, Target } from "lucide-react";
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';
import { PageHeader } from '@/components/layout/page-header';
import { SeasonSwitcher, ArchiveBanner, type SeasonOption } from '@/components/layout/season-switcher';

/** Datum narození ze soupisky, tak jak ho uvádí přihláška. */
const birthDate = (iso: string) =>
  new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });

/** Jeden údaj bilance — popisek nahoře, hodnota dole. */
function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div>
      <div className="label-muted">{label}</div>
      <div className={`tnum text-sm font-semibold ${tone ?? 'text-slate-900'}`}>{value}</div>
    </div>
  );
}

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<SeasonOption | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!season) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setOpenId(null);
      const q = `?season=${encodeURIComponent(season!.id)}`;
      try {
        // Obojí najednou — dřív se čekalo na týmy a teprve pak na tabulku
        const [teamsRes, standingsRes] = await Promise.all([
          fetch(`/api/teams${q}`),
          fetch(`/api/standings${q}`),
        ]);
        if (!cancelled && teamsRes.ok) setTeams(await teamsRes.json());
        if (!cancelled && standingsRes.ok) setStandings(await standingsRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [season]);

  // U archivních sezón nese tabulka jako teamId převzatý název týmu, ne id z DB,
  // takže se párování zkouší nejdřív podle id a teprve pak podle názvu.
  const standingOf = (team: any) =>
    standings.find((s: any) => s.teamId === team.id) ??
    standings.find((s: any) => s.teamName === team.name);

  // Řadíme podle abecedy. Pořadí podle bodů patří do tabulky — kdyby stálo i tady,
  // byly by ze dvou stránek dvě verze téhož žebříčku.
  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name, 'cs'));

  return (
    <div>
      <PageHeader
        title="Týmy"
        subtitle={season ? `${season.name} · ${teams.length} týmů` : '…'}
        actions={<SeasonSwitcher value={season?.id ?? null} onChange={setSeason} />}
      >
        {season && <ArchiveBanner season={season} />}
      </PageHeader>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Target className="h-4 w-4 animate-spin text-primary" />
          Načítám týmy…
        </div>
      )}

      {!loading && teams.length === 0 && (
        <div className="rounded-lg border border-border bg-white px-4 py-10 text-center text-sm text-muted-foreground">
          Pro tuto sezónu nejsou zapsané žádné týmy.
        </div>
      )}

      {!loading && teams.length > 0 && (
        <>
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted hover:bg-muted">
                  <TableHead className="w-8" />
                  <TableHead>Tým</TableHead>
                  <TableHead className="hidden md:table-cell">Hrací místo</TableHead>
                  <TableHead className="hidden lg:table-cell w-44">Kapitán</TableHead>
                  <TableHead className="w-16 text-center" title="Počet hráčů na soupisce">Hráčů</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTeams.map((team: any) => {
                  const open = openId === team.id;
                  const standing = standingOf(team);
                  const players = team.players ?? [];

                  return [
                    <TableRow
                      key={team.id}
                      onClick={() => setOpenId(open ? null : team.id)}
                      // Řádek se chová jako rozbalovací tlačítko, takže musí jít
                      // ovládat i z klávesnice, ne jen myší
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenId(open ? null : team.id);
                        }
                      }}
                      aria-expanded={open}
                      aria-controls={`tym-${team.id}`}
                      className={`cursor-pointer border-border hover:bg-rose-50/50 focus:outline-none focus-visible:bg-rose-50 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary ${open ? 'bg-rose-50/50' : ''}`}
                    >
                      <TableCell className="text-center">
                        <ChevronRight
                          className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}
                        />
                      </TableCell>

                      <TableCell className="max-w-0">
                        <div className="flex items-center gap-2">
                          <div className="size-6 shrink-0 overflow-hidden rounded border border-border bg-white">
                            <img
                              src={getTeamLogo(team.name)}
                              alt=""
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement;
                                if (fallback) {
                                  fallback.className = `size-6 shrink-0 rounded bg-gradient-to-br ${getTeamGradient(team.name)} grid place-items-center text-white`;
                                  fallback.innerHTML = `<span class="text-[9px] font-bold">${
                                    team.shortName || team.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()
                                  }</span>`;
                                }
                              }}
                            />
                          </div>
                          <span className="truncate font-medium text-slate-900">{team.name}</span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden max-w-0 md:table-cell">
                        {/* Jedno místo pro lokalitu. Město se neukazuje zvlášť — u archivních
                            sezón se do city naimportovalo hrací místo, takže by tu stál
                            dvakrát tentýž údaj a ukrajoval šířku názvu týmu. */}
                        <span className="block truncate text-xs text-slate-600" title={team.venue || team.city || ''}>
                          {team.venue || team.city || '—'}
                        </span>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <span className="block truncate text-xs text-slate-600">
                          {team.captain?.name || '—'}
                        </span>
                      </TableCell>

                      <TableCell className="tnum text-center text-slate-600">
                        {team._count?.players ?? players.length}
                      </TableCell>
                    </TableRow>,

                    open && (
                      <TableRow key={`${team.id}-detail`} className="border-border hover:bg-transparent">
                        <TableCell id={`tym-${team.id}`} colSpan={5} className="h-auto bg-muted/50 p-0">
                          <div className="grid gap-4 px-4 py-3 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                              <div className="label-muted mb-1.5">Soupiska</div>
                              {players.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Soupiska není zapsaná.</p>
                              ) : (
                                <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
                                  {players.map((p: any) => (
                                    <li key={p.id} className="flex items-baseline gap-1.5 text-xs">
                                      {p.id === team.captainId && (
                                        <Crown className="h-3 w-3 shrink-0 self-center text-warning" aria-label="kapitán" />
                                      )}
                                      <span className="truncate text-slate-700">{p.name}</span>
                                      {p.dateOfBirth && (
                                        <span className="tnum ml-auto shrink-0 text-[11px] text-muted-foreground">
                                          {birthDate(p.dateOfBirth)}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div>
                              <div className="label-muted mb-1.5">Bilance sezóny</div>
                              {standing ? (
                                <div className="grid grid-cols-4 gap-3">
                                  <Stat label="Z" value={standing.played} />
                                  <Stat label="V" value={standing.won} tone="text-success" />
                                  <Stat label="P" value={standing.lost} tone="text-destructive" />
                                  <Stat label="Body" value={standing.points} />
                                  <div className="col-span-4">
                                    <div className="label-muted">Legy</div>
                                    <div className="tnum text-sm font-semibold text-slate-900">
                                      {standing.legsFor}:{standing.legsAgainst}{' '}
                                      <span className={standing.legDifference >= 0 ? 'text-success' : 'text-destructive'}>
                                        ({standing.legDifference > 0 ? '+' : ''}{standing.legDifference})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">Zatím bez odehraných zápasů.</p>
                              )}

                              <Link
                                href={`/schedule`}
                                className="mt-2 inline-block text-xs text-muted-foreground underline hover:text-primary"
                              >
                                Zápasy najdeš v rozpisu kol
                              </Link>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  ];
                })}
              </TableBody>
            </Table>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Klikem na tým rozbalíš soupisku a bilanci. Pořadí a body najdeš v{' '}
            <Link href="/standings" className="underline hover:text-primary">tabulce</Link>.
          </p>
        </>
      )}
    </div>
  );
}
