"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/layout/page-header';
import { TeamMark } from '@/components/team-mark';
import { getTeamLogo } from '@/lib/team-logos';

const dateTime = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'termín neurčen';

const winRate = (played: number, won: number) => (played > 0 ? Math.round((won / played) * 100) : 0);

function Panel({ title, meta, action, children }: {
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex h-10 items-center justify-between gap-2 border-b border-border bg-muted px-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="truncate text-sm font-semibold text-slate-900">{title}</h2>
          {meta && <span className="text-xs text-muted-foreground tnum">{meta}</span>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex h-row items-center gap-3 px-3 text-sm">
      <span className="w-16 shrink-0 label-muted">{label}</span>
      <span className="min-w-0 flex-1 truncate text-slate-900">{children}</span>
    </div>
  );
}

const Muted = ({ children }: { children: React.ReactNode }) => (
  <p className="px-3 py-4 text-center text-xs text-muted-foreground">{children}</p>
);

const Loading = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin text-primary" />
    {children}
  </div>
);

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="bg-white px-3 py-2">
      <div className="label-muted">{label}</div>
      <div className={`mt-0.5 text-lg font-bold tnum ${tone ?? 'text-slate-900'}`}>{value}</div>
    </div>
  );
}

export default function Profile() {
  const { data: session, status } = useSession();
  const [teamData, setTeamData] = useState<any>(null);
  const [teamMatches, setTeamMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user;
  const player = user?.player;
  const team = player?.team;

  useEffect(() => {
    async function fetchTeamData() {
      if (!team?.id) {
        setLoading(false);
        return;
      }

      try {
        const [teamResponse, matchesResponse] = await Promise.all([
          fetch(`/api/teams/${team.id}`),
          fetch(`/api/teams/${team.id}/matches`)
        ]);

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamData(teamData);
        }

        if (matchesResponse.ok) {
          const matches = await matchesResponse.json();
          setTeamMatches(matches);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session && team) {
      fetchTeamData();
    }
  }, [session, team]);

  if (status === "loading") {
    return <Loading>Načítám profil…</Loading>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  // Admin má vlastní přehled na /admin
  if (session.user.role === 'admin') {
    redirect("/admin");
  }

  const isCaptain = user?.role === 'kapitán';
  // Vlastní statistiky bereme ze soupisky — API je počítá pro sezónu týmu.
  const me = teamData?.players?.find((p: any) => p.id === player?.id);
  const myStats = me?.stats;
  const openMatches = teamMatches.filter((m: any) => !m.endTime);

  return (
    <div className="space-y-4">
      <PageHeader
        title={user?.name || 'Můj profil'}
        subtitle={[user?.role, team?.name].filter(Boolean).join(' · ') || undefined}
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
        <div className="space-y-4">
          <Panel title="Účet">
            <div className="divide-y divide-border">
              {user?.email && <InfoRow label="E-mail">{user.email}</InfoRow>}
              <InfoRow label="Role">{user?.role ?? '—'}</InfoRow>
              <InfoRow label="Tým">
                {team ? (
                  <Link href={`/team/${team.id}`} className="inline-flex max-w-full items-center gap-2 font-medium hover:text-primary">
                    <TeamMark name={team.name} shortName={team.shortName} logoUrl={getTeamLogo(team.name)} />
                    <span className="truncate">{team.name}</span>
                  </Link>
                ) : (
                  <span className="text-muted-foreground">nepřiřazen</span>
                )}
              </InfoRow>
              {user?.role === 'admin' && (
                <Link href="/admin" className="group flex h-row items-center gap-3 px-3 text-sm font-medium hover:bg-muted">
                  <span className="flex-1">Administrace ligy</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                </Link>
              )}
            </div>
          </Panel>

          {player && team && isCaptain && (
            <Panel
              title="Kapitán"
              meta={!loading ? `${openMatches.length} k zadání` : undefined}
            >
              {loading ? (
                <Loading>Načítám zápasy…</Loading>
              ) : openMatches.length > 0 ? (
                <ul className="divide-y divide-border">
                  {openMatches.slice(0, 3).map((match: any) => {
                    const isHome = match.homeTeamId === team.id;
                    const opponent = isHome ? match.awayTeam : match.homeTeam;
                    return (
                      <li key={match.id}>
                        <Link href={`/match/${match.id}`} className="group flex h-row items-center gap-2 px-3 text-sm hover:bg-muted">
                          <span className="w-7 shrink-0 text-xs text-muted-foreground tnum">{match.round ? `${match.round}.` : ''}</span>
                          <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
                            {isHome ? 'vs' : '@'} {opponent?.name}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-primary">Zadat</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Muted>Žádný zápas nečeká na zadání.</Muted>
              )}
              <div className="border-t border-border p-3">
                <Button asChild size="sm" className="h-8 w-full rounded-md bg-primary font-semibold text-white hover:bg-[#9F1239]">
                  <Link href="/schedule">Zadat výsledky zápasů</Link>
                </Button>
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          {player && team ? (
            <>
              {/* Vlastní statistiky sezóny — tenký pruh, detail událostí v jednom řádku */}
              {loading ? (
                <Loading>Načítám statistiky…</Loading>
              ) : myStats ? (
                <section className="overflow-hidden rounded-lg border border-border bg-white">
                  <div className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-4">
                    <Stat label="BPI" value={(me.bpi ?? 0).toFixed(1)} tone="text-primary" />
                    <Stat label="Singly" value={myStats.singlesPlayed} />
                    <Stat label="Výhry" value={myStats.singlesWon} tone="text-emerald-700" />
                    <Stat label="Úspěšnost" value={`${winRate(myStats.singlesPlayed, myStats.singlesWon)} %`} />
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {['95+', '133+', '170+', 'CO3', 'CO4', 'CO5', 'CO6'].map((h) => (
                            <TableHead key={h} className="text-center">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          {['S95', 'S133', 'S170', 'CO3', 'CO4', 'CO5', 'CO6'].map((k) => (
                            <TableCell key={k} className="text-center tnum">{myStats[k] ?? 0}</TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </section>
              ) : null}

              <Panel title="Soupiska" meta={teamData?.players?.length}>
                {loading ? (
                  <Loading>Načítám soupisku…</Loading>
                ) : teamData ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Hráč</TableHead>
                        <TableHead className="hidden md:table-cell">Role</TableHead>
                        <TableHead className="text-right">BPI</TableHead>
                        <TableHead className="text-right">Singly</TableHead>
                        <TableHead className="hidden text-right sm:table-cell">Úsp.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamData.players.map((teamPlayer: any, index: number) => {
                        const isMe = teamPlayer.id === player?.id;
                        return (
                          <TableRow key={teamPlayer.id} className={isMe ? 'bg-primary/5' : ''}>
                            <TableCell className="text-muted-foreground tnum">{index + 1}</TableCell>
                            <TableCell>
                              <span className={isMe ? 'font-semibold text-slate-900' : 'font-medium text-slate-900'}>
                                {teamPlayer.name}
                              </span>
                              {teamPlayer.nickname && (
                                <span className="ml-1.5 text-xs text-muted-foreground">„{teamPlayer.nickname}“</span>
                              )}
                              {isMe && <span className="ml-1.5 text-[11px] font-semibold uppercase text-primary">ty</span>}
                            </TableCell>
                            <TableCell className="hidden text-muted-foreground md:table-cell">{teamPlayer.role}</TableCell>
                            <TableCell className="text-right font-semibold tnum">{teamPlayer.bpi.toFixed(1)}</TableCell>
                            <TableCell className="text-right tnum">{teamPlayer.stats.singlesPlayed}</TableCell>
                            <TableCell className="hidden text-right tnum sm:table-cell">
                              {winRate(teamPlayer.stats.singlesPlayed, teamPlayer.stats.singlesWon)} %
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <Muted>Soupisku se nepodařilo načíst.</Muted>
                )}
              </Panel>

              <Panel title="Zápasy týmu" meta={!loading ? teamMatches.length : undefined}>
                {loading ? (
                  <Loading>Načítám zápasy…</Loading>
                ) : teamMatches.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {teamMatches.map((match: any) => {
                      const isHome = match.homeTeamId === team.id;
                      const opponent = isHome ? match.awayTeam : match.homeTeam;
                      return (
                        <li key={match.id}>
                          <Link href={`/match/${match.id}`} className="group flex h-row items-center gap-3 px-3 text-sm hover:bg-muted">
                            <span className="w-7 shrink-0 text-xs text-muted-foreground tnum">{match.round ? `${match.round}.` : ''}</span>
                            <TeamMark name={opponent.name} shortName={opponent.shortName} logoUrl={getTeamLogo(opponent.name)} />
                            <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
                              <span className="mr-1 text-muted-foreground">{isHome ? 'vs' : '@'}</span>
                              {opponent.name}
                            </span>
                            <span className="hidden shrink-0 text-xs text-muted-foreground tnum sm:inline">{dateTime(match.startTime)}</span>
                            <span className={`w-20 shrink-0 text-right text-xs font-semibold ${match.endTime ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                              {match.endTime ? 'Odehráno' : isCaptain ? 'Zadat' : 'Naplánováno'}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Muted>Žádné zápasy.</Muted>
                )}
              </Panel>
            </>
          ) : user?.role !== 'admin' ? (
            <div className="rounded-lg border border-border bg-white px-3 py-3 text-sm text-muted-foreground">
              Účet není propojen s hráčem v lize. Přiřazení zařídí administrátor —{' '}
              <Link href="/contact" className="font-medium text-primary hover:underline">kontakt</Link>.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
