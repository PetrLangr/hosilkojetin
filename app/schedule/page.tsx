"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Edit, Target } from "lucide-react";
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';
import { readResult } from '@/lib/standings';
import { PageHeader } from '@/components/layout/page-header';
import { SeasonSwitcher, ArchiveBanner, type SeasonOption } from '@/components/layout/season-switcher';

type Status = 'vse' | 'odehrane' | 'naplanovane';

const dayMonth = (d: string) =>
  new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });

const weekdayDate = (d: string) =>
  new Date(d).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'long' });

/** Logo týmu s náhradou na barevnou zkratku, když obrázek chybí. */
function TeamMark({ name, shortName }: { name: string; shortName?: string }) {
  return (
    <span className="size-5 shrink-0 overflow-hidden rounded border border-border bg-white">
      <img
        src={getTeamLogo(name)}
        alt=""
        className="h-full w-full object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.parentElement;
          if (fallback) {
            fallback.className = `size-5 shrink-0 rounded bg-gradient-to-br ${getTeamGradient(name)} grid place-items-center text-white`;
            fallback.innerHTML = `<span class="text-[8px] font-bold">${
              shortName || name.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()
            }</span>`;
          }
        }}
      />
    </span>
  );
}

/**
 * Jeden zápas: domácí vpravo zarovnaní ke skóre, hosté vlevo — čte se zevnitř ven.
 * `lead` je datum nebo číslo kola podle toho, v jakém režimu se řádek zobrazuje.
 */
function MatchRow({
  match,
  lead,
  highlightTeamId,
  isAdmin,
}: {
  match: any;
  lead?: string;
  highlightTeamId?: string;
  isAdmin?: boolean;
}) {
  const score = match.result ? readResult(match.result) : null;
  const played = Boolean(match.endTime);
  const homeWon = score && score.homeGamesWon > score.awayGamesWon;
  const awayWon = score && score.awayGamesWon > score.homeGamesWon;
  const homePicked = highlightTeamId && match.homeTeam.id === highlightTeamId;
  const awayPicked = highlightTeamId && match.awayTeam.id === highlightTeamId;

  const nameClass = (picked?: boolean | string, won?: boolean | null) =>
    picked ? 'font-semibold text-primary'
    : won ? 'font-semibold text-slate-900'
    : 'text-slate-600';

  // Detail zápasu je veřejný, jen když je zápas odehraný — u naplánovaného vyhodí
  // návštěvníka na přihlášení. Nezadaný zápas proto není odkaz; kapitán a admin
  // se k zadání výsledku dostanou tlačítkem na konci řádku.
  const TeamName = ({
    name,
    className,
  }: {
    name: string;
    className: string;
  }) =>
    played ? (
      <Link href={`/match/${match.id}`} className={`${className} hover:underline`}>
        {name}
      </Link>
    ) : (
      <span className={className}>{name}</span>
    );

  return (
    <li className="flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50/50">
      <span className="tnum w-12 shrink-0 text-[11px] text-muted-foreground">{lead ?? ''}</span>

      <TeamName
        name={match.homeTeam.name}
        className={`flex-1 truncate text-right text-xs ${nameClass(homePicked, homeWon)}`}
      />
      <TeamMark name={match.homeTeam.name} shortName={match.homeTeam.shortName} />

      {played && score ? (
        <Link
          href={`/match/${match.id}`}
          className="tnum shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-900 hover:bg-slate-200"
        >
          {score.homeGamesWon}:{score.awayGamesWon}
        </Link>
      ) : (
        <span className="shrink-0 px-1.5 text-[11px] text-muted-foreground">vs</span>
      )}

      <TeamMark name={match.awayTeam.name} shortName={match.awayTeam.shortName} />
      <TeamName
        name={match.awayTeam.name}
        className={`flex-1 truncate text-xs ${nameClass(awayPicked, awayWon)}`}
      />

      {isAdmin && (
        <Button asChild size="sm" variant="outline" className="ml-1 h-6 shrink-0 rounded px-1.5 text-[11px]">
          <Link href={`/match/${match.id}`}>
            <Edit className="mr-1 h-3 w-3" />
            {played ? 'Upravit' : 'Zadat'}
          </Link>
        </Button>
      )}
    </li>
  );
}

const selectClass =
  "h-8 rounded-md border border-border bg-white pl-2 pr-7 text-sm font-medium text-slate-900 hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function Schedule() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<SeasonOption | null>(null);
  const [teamId, setTeamId] = useState('');
  const [status, setStatus] = useState<Status>('vse');
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (!season) return;
    let cancelled = false;

    async function fetchMatches() {
      setLoading(true);
      try {
        const response = await fetch(`/api/matches?season=${encodeURIComponent(season!.id)}`);
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setMatches(data);
            setTeamId('');
            setStatus('vse');
          }
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMatches();
    return () => { cancelled = true; };
  }, [season]);

  const teams = useMemo(() => {
    const map = new Map<string, string>();
    matches.forEach((m: any) => {
      map.set(m.homeTeam.id, m.homeTeam.name);
      map.set(m.awayTeam.id, m.awayTeam.name);
    });
    return [...map].map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  }, [matches]);

  const filtered = useMemo(
    () =>
      matches.filter((m: any) => {
        if (teamId && m.homeTeam.id !== teamId && m.awayTeam.id !== teamId) return false;
        if (status === 'odehrane' && !m.endTime) return false;
        if (status === 'naplanovane' && m.endTime) return false;
        return true;
      }),
    [matches, teamId, status]
  );

  const byRound = filtered.reduce((acc: Record<number, any[]>, m: any) => {
    const r = m.round ?? 1;
    (acc[r] ||= []).push(m);
    return acc;
  }, {});
  const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);

  // "Nejbližší" = kolo, ve kterém ještě něco nebylo odehráno. Dřív se sem dosazovalo
  // poslední kolo podle data, takže dohraná sezóna hlásila 22. kolo jako aktuální.
  const allRounds = [...new Set(matches.map((m: any) => m.round ?? 1))].sort((a, b) => a - b);
  const nextRound = allRounds.find((r) => matches.some((m: any) => (m.round ?? 1) === r && !m.endTime));
  const playedCount = matches.filter((m: any) => m.endTime).length;

  const filtering = Boolean(teamId) || status !== 'vse';
  // Filtrování je hledání, a výsledky hledání se čtou jako seznam. Seskupení po kolech
  // by při filtru na tým dalo 22 sekcí po jednom zápase.
  const flat = filtering
    ? [...filtered].sort((a: any, b: any) => (b.round ?? 0) - (a.round ?? 0))
    : [];

  return (
    <div>
      <PageHeader
        title="Zápasy"
        subtitle={
          season
            ? `${season.name} · ${allRounds.length} kol · ${playedCount}/${matches.length} odehráno`
            : '…'
        }
        actions={<SeasonSwitcher value={season?.id ?? null} onChange={setSeason} />}
      >
        {season && <ArchiveBanner season={season} />}
      </PageHeader>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Target className="h-4 w-4 animate-spin text-primary" />
          Načítám zápasy…
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div className="rounded-lg border border-border bg-white px-4 py-10 text-center text-sm text-muted-foreground">
          Pro tuto sezónu není rozlosování k dispozici.
        </div>
      )}

      {!loading && matches.length > 0 && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5">
              <span className="label-muted">Tým</span>
              <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={selectClass}>
                <option value="">všechny</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-0.5 rounded-md border border-border bg-white p-0.5">
              {([['vse', 'Vše'], ['odehrane', 'Odehrané'], ['naplanovane', 'Naplánované']] as const).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setStatus(value)}
                    aria-pressed={status === value}
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      status === value ? 'bg-primary text-white' : 'text-slate-600 hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            {filtering && (
              <button
                onClick={() => { setTeamId(''); setStatus('vse'); }}
                className="text-xs text-muted-foreground underline hover:text-primary"
              >
                Zrušit filtry
              </button>
            )}

            <span className="ml-auto text-xs text-muted-foreground">
              {filtered.length === matches.length
                ? `${matches.length} zápasů`
                : `${filtered.length} z ${matches.length} zápasů`}
            </span>
          </div>

          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-white px-4 py-10 text-center text-sm text-muted-foreground">
              Zvolenému filtru neodpovídá žádný zápas.
            </div>
          )}

          {/* Bez filtru: rozpis po kolech. S filtrem: souvislý seznam od nejnovějšího. */}
          {!filtering && filtered.length > 0 && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-1">
                <span className="label-muted mr-1">Kolo</span>
                {rounds.map((r) => (
                  <a
                    key={r}
                    href={`#kolo-${r}`}
                    className={`tnum rounded px-1.5 py-0.5 text-xs font-medium transition-colors ${
                      r === nextRound ? 'bg-primary text-white' : 'bg-muted text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </a>
                ))}
                {!nextRound && <span className="ml-2 text-xs text-muted-foreground">· sezóna dohrána</span>}
              </div>

              <div className="space-y-3">
                {rounds.map((round) => {
                  const roundMatches = byRound[round];
                  const first = roundMatches.find((m: any) => m.startTime);
                  const roundDay = first?.startTime ? new Date(first.startTime).toDateString() : undefined;
                  const allPlayed = roundMatches.every((m: any) => m.endTime);
                  const isNext = round === nextRound;

                  return (
                    <section
                      key={round}
                      id={`kolo-${round}`}
                      className={`scroll-mt-20 overflow-hidden rounded-lg border bg-white ${
                        isNext ? 'border-primary/40' : 'border-border'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between gap-2 border-b px-3 py-1.5 ${
                          isNext ? 'border-primary/20 bg-rose-50' : 'border-border bg-muted'
                        }`}
                      >
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          {round}. kolo
                          {isNext && (
                            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              nejbližší
                            </span>
                          )}
                        </h2>
                        <span className="text-[11px] text-muted-foreground">
                          {first?.startTime ? weekdayDate(first.startTime) : 'termín neurčen'}
                          {!allPlayed && ` · ${roundMatches.filter((m: any) => m.endTime).length}/${roundMatches.length} odehráno`}
                        </span>
                      </div>

                      <ul className="divide-y divide-border">
                        {roundMatches.map((m: any) => (
                          <MatchRow
                            key={m.id}
                            match={m}
                            // Datum jen u zápasu, který se od zbytku kola liší
                            lead={
                              m.startTime && new Date(m.startTime).toDateString() !== roundDay
                                ? dayMonth(m.startTime)
                                : undefined
                            }
                            isAdmin={isAdmin}
                          />
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </>
          )}

          {filtering && filtered.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <ul className="divide-y divide-border">
                {flat.map((m: any) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    lead={`${m.round}. k.`}
                    highlightTeamId={teamId || undefined}
                    isAdmin={isAdmin}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
