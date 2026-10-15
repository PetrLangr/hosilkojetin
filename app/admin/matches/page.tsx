"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTeamLogo } from "@/lib/team-logos";
import {
  AdminToolbar, EmptyRow, ErrorBanner, LoadingRow, Segmented, TableFrame, TeamMark,
} from "@/components/admin/admin-ui";

type Team = { id: string; name: string; shortName: string };
type Match = {
  id: string;
  round: number | null;
  startTime: string | null;
  endTime: string | null;
  status: string;
  result: { homeScore?: number; awayScore?: number; homeWins?: number; awayWins?: number } | null;
  homeTeam: Team;
  awayTeam: Team;
};

type State = 'missing' | 'pending' | 'completed' | 'scheduled';
type Filter = 'all' | State;

// Odehraný = má endTime (stejně jako titulní stránka). Ke schválení = kapitán
// zapsal výsledek a čeká na admina. Chybí = termín minul a nic zapsáno není.
function matchState(m: Match, now: number): State {
  if (m.endTime) return 'completed';
  if (m.status === 'pending_approval') return 'pending';
  if (m.startTime && new Date(m.startTime).getTime() < now) return 'missing';
  return 'scheduled';
}

const STATE_LABEL: Record<State, { label: string; className: string }> = {
  missing:   { label: 'Chybí výsledek',    className: 'text-red-700' },
  pending:   { label: 'Ke schválení',      className: 'text-amber-700' },
  completed: { label: 'Odehráno',          className: 'text-slate-500' },
  scheduled: { label: 'Naplánováno',       className: 'text-slate-500' },
};

// Rychlé zadání ukládá skóre jako homeWins/awayWins, podrobný zápis (scorecard)
// jako homeScore/awayScore — obojí jsou vyhrané hry z 19.
function score(m: Match): [number, number] | null {
  const home = m.result?.homeWins ?? m.result?.homeScore;
  const away = m.result?.awayWins ?? m.result?.awayScore;
  return home != null && away != null ? [home, away] : null;
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      if (!response.ok) throw new Error();
      setMatches(await response.json());
    } catch {
      setError('Zápasy se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const approveMatch = async (matchId: string) => {
    setApproving(matchId);
    setError('');
    try {
      const response = await fetch(`/api/admin/matches/${matchId}/approve`, { method: 'POST' });
      if (!response.ok) throw new Error();
      await fetchMatches();
    } catch {
      setError('Výsledek se nepodařilo schválit. Zkuste to znovu.');
    } finally {
      setApproving(null);
    }
  };

  const { rows, counts } = useMemo(() => {
    const now = Date.now();
    const rows = matches.map((m) => ({ match: m, state: matchState(m, now) }));
    const counts = { all: rows.length, missing: 0, pending: 0, completed: 0, scheduled: 0 };
    rows.forEach((r) => counts[r.state]++);
    return { rows, counts };
  }, [matches]);

  // Seskupení podle kola až po filtru, ať se nezobrazují prázdná kola.
  const rounds = useMemo(() => {
    const visible = filter === 'all' ? rows : rows.filter((r) => r.state === filter);
    const byRound = new Map<number, typeof rows>();
    for (const r of visible) {
      const key = r.match.round ?? 0;
      byRound.set(key, [...(byRound.get(key) ?? []), r]);
    }
    return [...byRound.entries()].sort(([a], [b]) => a - b);
  }, [rows, filter]);

  return (
    <div>
      <AdminToolbar
        title="Zápasy"
        meta={!loading && `${counts.completed}/${counts.all} odehráno`}
      >
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Vše', count: counts.all },
            { value: 'missing', label: 'Chybí výsledek', count: counts.missing },
            { value: 'pending', label: 'Ke schválení', count: counts.pending },
            { value: 'scheduled', label: 'Naplánované', count: counts.scheduled },
            { value: 'completed', label: 'Odehrané', count: counts.completed },
          ]}
        />
      </AdminToolbar>

      {error && <ErrorBanner message={error} onClose={() => setError('')} />}

      <TableFrame>
        {loading ? (
          <LoadingRow>Načítám zápasy…</LoadingRow>
        ) : rounds.length === 0 ? (
          <EmptyRow>{filter === 'all' ? 'V aktivní sezóně nejsou žádné zápasy.' : 'Žádný zápas v tomto stavu.'}</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted hover:bg-muted">
                <TableHead className="w-40">Termín</TableHead>
                <TableHead>Zápas</TableHead>
                <TableHead className="w-20 text-center">Výsledek</TableHead>
                <TableHead className="hidden w-32 md:table-cell">Stav</TableHead>
                <TableHead className="w-44 text-right"><span className="sr-only">Akce</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rounds.map(([round, items]) => {
                const done = items.filter((r) => r.state === 'completed').length;
                return (
                  <Fragment key={round}>
                    <TableRow className="border-border bg-slate-50/70 hover:bg-slate-50/70">
                      <TableCell colSpan={5} className="h-8">
                        <span className="text-xs font-semibold text-slate-900">
                          {round ? `${round}. kolo` : 'Bez kola'}
                        </span>
                        {filter === 'all' && (
                          <span className="ml-2 text-xs text-muted-foreground tnum">{done}/{items.length}</span>
                        )}
                      </TableCell>
                    </TableRow>

                    {items.map(({ match: m, state }) => (
                      <TableRow key={m.id} className="border-border hover:bg-rose-50/40">
                        <TableCell className="whitespace-nowrap text-xs text-slate-600 tnum">
                          {formatDate(m.startTime)}
                        </TableCell>
                        <TableCell className="max-w-0">
                          <div className="flex items-center gap-2">
                            <TeamMark name={m.homeTeam.name} shortName={m.homeTeam.shortName} logoUrl={getTeamLogo(m.homeTeam.name)} />
                            <span className="truncate font-medium text-slate-900">{m.homeTeam.name}</span>
                            <span className="text-muted-foreground">–</span>
                            <span className="truncate font-medium text-slate-900">{m.awayTeam.name}</span>
                            <TeamMark name={m.awayTeam.name} shortName={m.awayTeam.shortName} logoUrl={getTeamLogo(m.awayTeam.name)} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {score(m) ? (
                            <span className="font-semibold text-slate-900 tnum">
                              {score(m)!.join(":")}
                            </span>
                          ) : (
                            <span className="text-slate-300">–</span>
                          )}
                        </TableCell>
                        <TableCell className={`hidden text-xs font-medium md:table-cell ${STATE_LABEL[state].className}`}>
                          {STATE_LABEL[state].label}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {state === 'pending' && (
                              <button
                                type="button"
                                onClick={() => approveMatch(m.id)}
                                disabled={approving === m.id}
                                className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {approving === m.id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <Check className="h-3.5 w-3.5" />}
                                Schválit
                              </button>
                            )}
                            <Link
                              href={`/match/${m.id}`}
                              className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold ${
                                state === 'missing'
                                  ? 'bg-primary text-white hover:bg-[#9F1239]'
                                  : 'border border-border text-slate-700 hover:border-slate-300 hover:bg-muted'
                              }`}
                            >
                              {state === 'completed' || state === 'pending' ? 'Detail' : 'Zadat výsledek'}
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableFrame>
    </div>
  );
}
