"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { getTeamLogo } from '@/lib/team-logos';
import { readResult } from '@/lib/standings';

interface PublicMatchViewProps {
  match: any;
  canEdit?: boolean;
  onUpgradeToDetailed?: () => void;
}

// Pořadí skupin odpovídá pravidlům (singly → dvojice → cricket → trojice → rozstřel),
// ne pořadí na papírovém zápisu, kde se typy střídají.
const GAME_GROUPS: { type: string; label: string; format: string }[] = [
  { type: 'single', label: 'Singly', format: '501 DO, Bo3' },
  { type: 'double_501', label: 'Dvojice 501', format: '501 DO, Bo3' },
  { type: 'double_cricket', label: 'Dvojice Cricket', format: 'Cut Throat, 15 kol' },
  { type: 'triple_301', label: 'Trojice 301', format: 'DI/DO, Bo3' },
  { type: 'tiebreak_701', label: 'Rozstřel 701', format: 'DO, Bo1' },
];

type Side = 'home' | 'away';

/** Logo v hlavičce zápasu. Při chybě obrázku ukáže zkratku. */
function TeamLogo({ name, shortName }: { name: string; shortName?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-white md:size-12">
      {failed ? (
        <span className="text-[11px] font-bold text-slate-500">
          {(shortName || name.split(' ').map((w) => w[0]).join('')).slice(0, 3).toUpperCase()}
        </span>
      ) : (
        <img src={getTeamLogo(name)} alt="" className="h-full w-full object-contain" onError={() => setFailed(true)} />
      )}
    </span>
  );
}

export function PublicMatchView({ match, canEdit = false, onUpgradeToDetailed }: PublicMatchViewProps) {
  const games: any[] = match.games || [];
  const matchResult = match.result || null;

  // Rychlý výsledek = jen součty, bez jednotlivých her
  const isQuickResult = match.isQuickResult === true || (games.length === 0 && matchResult);

  // Součty: z uloženého výsledku (rychlé i podrobné zadání mají různé tvary),
  // jinak spočítat z her
  const stored = matchResult ? readResult(matchResult) : null;
  const fromGames = games.reduce(
    (acc, g) => {
      const r = g.result || {};
      if (r.winner === 'home') acc.homeWins++;
      if (r.winner === 'away') acc.awayWins++;
      acc.homeLegs += r.homeScore || 0;
      acc.awayLegs += r.awayScore || 0;
      return acc;
    },
    { homeWins: 0, awayWins: 0, homeLegs: 0, awayLegs: 0 }
  );
  const useStored = stored && (stored.homeGamesWon + stored.awayGamesWon > 0 || games.length === 0);
  const homeWins = useStored ? stored!.homeGamesWon : fromGames.homeWins;
  const awayWins = useStored ? stored!.awayGamesWon : fromGames.awayWins;
  const homeLegs = useStored && (stored!.homeLegs || stored!.awayLegs) ? stored!.homeLegs : fromGames.homeLegs;
  const awayLegs = useStored && (stored!.homeLegs || stored!.awayLegs) ? stored!.awayLegs : fromGames.awayLegs;
  const hasScore = homeWins + awayWins > 0;

  // Body: rychlé zadání je ukládá, podrobné ne — dopočet stejně jako lib/standings (9:8 = rozstřel)
  const tiebreak = (homeWins === 9 && awayWins === 8) || (homeWins === 8 && awayWins === 9);
  const homePoints = matchResult?.homePoints ?? (homeWins > awayWins ? (tiebreak ? 2 : 3) : homeWins < awayWins ? (tiebreak ? 1 : 0) : null);
  const awayPoints = matchResult?.awayPoints ?? (awayWins > homeWins ? (tiebreak ? 2 : 3) : awayWins < homeWins ? (tiebreak ? 1 : 0) : null);

  const winner: Side | null = homeWins > awayWins ? 'home' : awayWins > homeWins ? 'away' : null;

  const getPlayerFromLineup = (playerId: string) => {
    const homePlayer = match.homeTeam?.players?.find((p: any) => p.id === playerId);
    const awayPlayer = match.awayTeam?.players?.find((p: any) => p.id === playerId);
    return homePlayer || awayPlayer || { id: playerId, name: 'Neznámý hráč' };
  };

  const getParticipants = (game: any): { home: string[]; away: string[] } => {
    const raw = typeof game.participants === 'string' ? JSON.parse(game.participants) : game.participants;
    return { home: raw?.home || [], away: raw?.away || [] };
  };

  const when = match.startTime || match.endTime;
  const dateLabel = when
    ? new Date(when).toLocaleString('cs-CZ', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const meta = [
    match.round ? `${match.round}. kolo` : null,
    match.season?.name,
    dateLabel,
    match.homeTeam?.venue,
  ].filter(Boolean);

  const grouped = [
    ...GAME_GROUPS.map((g) => ({ ...g, games: games.filter((x) => x.type === g.type) })),
    // Neznámé typy z importů nezahazujeme
    {
      type: 'other',
      label: 'Ostatní',
      format: '',
      games: games.filter((x) => !GAME_GROUPS.some((g) => g.type === x.type)),
    },
  ]
    .map((g) => ({ ...g, games: [...g.games].sort((a, b) => a.order - b.order) }))
    .filter((g) => g.games.length > 0);

  const teamName = (side: Side) => {
    const team = side === 'home' ? match.homeTeam : match.awayTeam;
    const tone = winner === side ? 'text-slate-900' : winner ? 'text-slate-500' : 'text-slate-900';
    return (
      <Link href={`/team/${team.id}`} className={`font-semibold leading-tight hover:underline ${tone}`}>
        {team.name}
      </Link>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" className="h-8 gap-1.5 px-2 text-muted-foreground">
          <Link href="/schedule">
            <ArrowLeft className="h-3.5 w-3.5" />
            Rozpis
          </Link>
        </Button>
        <Button variant="outline" className="h-8 gap-1.5 font-semibold" disabled>
          <Download className="h-3.5 w-3.5" />
          PDF
        </Button>
      </div>

      {/* Hlavička zápasu: domácí — skóre — hosté */}
      <section className="overflow-hidden rounded-lg border border-border bg-white">
        <div className="border-b border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          {meta.join(' · ')}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-4 md:px-6">
          <div className="flex min-w-0 flex-col items-center gap-2 text-center md:flex-row md:justify-end md:text-right">
            <div className="order-2 min-w-0 md:order-1">
              {teamName('home')}
              {match.homeTeam.city && (
                <div className="hidden text-xs text-muted-foreground md:block">{match.homeTeam.city}</div>
              )}
            </div>
            <span className="order-1 md:order-2">
              <TeamLogo name={match.homeTeam.name} shortName={match.homeTeam.shortName} />
            </span>
          </div>

          <div className="text-center">
            <div className="tnum text-2xl font-bold leading-none text-slate-900">
              {hasScore ? (
                <>
                  <span className={winner === 'away' ? 'text-slate-400' : ''}>{homeWins}</span>
                  <span className="px-1.5 text-slate-300">:</span>
                  <span className={winner === 'home' ? 'text-slate-400' : ''}>{awayWins}</span>
                </>
              ) : (
                <span className="text-slate-300">– : –</span>
              )}
            </div>
            <div className="label-muted mt-1">Hry</div>
          </div>

          <div className="flex min-w-0 flex-col items-center gap-2 text-center md:flex-row md:text-left">
            <TeamLogo name={match.awayTeam.name} shortName={match.awayTeam.shortName} />
            <div className="min-w-0">
              {teamName('away')}
              {match.awayTeam.city && (
                <div className="hidden text-xs text-muted-foreground md:block">{match.awayTeam.city}</div>
              )}
            </div>
          </div>
        </div>

        {hasScore && (
          <div className="flex justify-center divide-x divide-border border-t border-border text-sm">
            <div className="px-4 py-2 text-center">
              <span className="label-muted mr-2">Legy</span>
              <span className="tnum font-semibold text-slate-900">
                {homeLegs} : {awayLegs}
              </span>
            </div>
            {homePoints != null && awayPoints != null && (
              <div className="px-4 py-2 text-center">
                <span className="label-muted mr-2">Body</span>
                <span className="tnum font-semibold text-primary">
                  {homePoints} : {awayPoints}
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      {isQuickResult && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <span>Rychlé zadání: jen celkový výsledek a legy, bez her a statistik hráčů.</span>
          {canEdit && onUpgradeToDetailed && (
            <Button onClick={onUpgradeToDetailed} variant="outline" className="h-7 bg-white px-2.5 text-xs font-semibold">
              Doplnit podrobné zadání
            </Button>
          )}
        </div>
      )}

      {!isQuickResult && games.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-border bg-white">
          <div className="flex h-10 items-center border-b border-border bg-muted px-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Hry</h2>
              <span className="text-xs text-muted-foreground tnum">{games.length}</span>
            </div>
          </div>
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-9" />
              <col />
              <col className="w-16" />
              <col />
            </colgroup>
            {grouped.map((group) => (
              <tbody key={group.type} className="border-b border-border last:border-b-0">
                <tr className="bg-slate-50">
                  <th colSpan={4} className="h-7 px-3 text-left">
                    <span className="label-muted text-slate-700">{group.label}</span>
                    {group.format && (
                      <span className="ml-2 text-[11px] text-muted-foreground">{group.format}</span>
                    )}
                  </th>
                </tr>
                {group.games.map((game) => {
                  const r = game.result || {};
                  const p = getParticipants(game);
                  const hasLegs = r.homeScore !== undefined && r.awayScore !== undefined;
                  const sideCls = (side: Side) =>
                    r.winner === side ? 'font-semibold text-slate-900' : r.winner ? 'text-slate-500' : 'text-slate-700';
                  const names = (ids: string[]) =>
                    ids.length > 0 ? ids.map((id) => getPlayerFromLineup(id)?.name || 'Neznámý hráč').join(', ') : '–';
                  return (
                    <tr key={game.id} className="border-t border-border hover:bg-rose-50/40">
                      <td className="tnum h-row px-3 text-xs text-muted-foreground">{game.order}</td>
                      <td className={`py-2 pr-2 text-right leading-snug ${sideCls('home')}`}>{names(p.home)}</td>
                      <td className="tnum text-center font-semibold">
                        {hasLegs ? (
                          <>
                            <span className={r.winner === 'away' ? 'font-normal text-slate-400' : 'text-slate-900'}>{r.homeScore}</span>
                            <span className="px-1 text-slate-300">:</span>
                            <span className={r.winner === 'home' ? 'font-normal text-slate-400' : 'text-slate-900'}>{r.awayScore}</span>
                          </>
                        ) : r.winner ? (
                          <span className="text-slate-900">{r.winner === 'home' ? '1 : 0' : '0 : 1'}</span>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </td>
                      <td className={`py-2 pl-2 pr-3 leading-snug ${sideCls('away')}`}>{names(p.away)}</td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </section>
      )}
    </div>
  );
}
