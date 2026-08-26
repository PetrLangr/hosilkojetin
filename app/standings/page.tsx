"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target } from "lucide-react";
import { type TeamRecord } from '@/lib/standings';
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';
import { PageHeader } from '@/components/layout/page-header';
import { SeasonSwitcher, ArchiveBanner, type SeasonOption } from '@/components/layout/season-switcher';

/** Sloupce tabulky. Užší se na malých displejích skrývají, pořadí zůstává. */
const COLUMNS: { key: keyof TeamRecord | 'rank'; label: string; title: string; hide?: string }[] = [
  { key: 'played', label: 'Z', title: 'Odehrané zápasy' },
  { key: 'won', label: 'V', title: 'Výhry' },
  { key: 'wonPenalty', label: 'VP', title: 'Výhry po rozstřelu', hide: 'hidden md:table-cell' },
  { key: 'lostPenalty', label: 'PP', title: 'Prohry po rozstřelu', hide: 'hidden md:table-cell' },
  { key: 'lost', label: 'P', title: 'Prohry' },
  { key: 'legsFor', label: 'LZ', title: 'Legy získané', hide: 'hidden lg:table-cell' },
  { key: 'legsAgainst', label: 'LP', title: 'Legy ztracené', hide: 'hidden lg:table-cell' },
];

/** Posledních 5 zápasů jako řada teček, nejstarší vlevo. */
function Form({ form }: { form: string[] }) {
  if (form.length === 0) return null;
  const style: Record<string, string> = {
    W: 'bg-success', WP: 'bg-success/45', LP: 'bg-destructive/45', L: 'bg-destructive',
  };
  const label: Record<string, string> = {
    W: 'výhra', WP: 'výhra po rozstřelu', LP: 'prohra po rozstřelu', L: 'prohra',
  };
  // form je uložená od nejnovějšího; pro čtení zleva doprava ji otáčíme
  return (
    <span className="flex items-center gap-1">
      {[...form].reverse().map((r, i) => (
        <span
          key={i}
          title={label[r] ?? r}
          className={`size-2 rounded-full ${style[r] ?? 'bg-slate-300'}`}
        />
      ))}
    </span>
  );
}

export default function Standings() {
  const [standings, setStandings] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<SeasonOption | null>(null);

  useEffect(() => {
    if (!season) return;
    let cancelled = false;

    async function fetchStandings() {
      setLoading(true);
      try {
        const response = await fetch(`/api/standings?season=${encodeURIComponent(season!.id)}`);
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setStandings(data);
        }
      } catch (error) {
        console.error('Error fetching standings:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStandings();
    return () => { cancelled = true; };
  }, [season]);

  // Nejstarší archivní tabulky legy neobsahují (hlásí to hasLegs) — sloupce LZ, LP
  // a rozdíl by v nich byly samé nuly, což vypadá jako výsledek, ne jako chybějící údaj.
  const noLegs = standings.length > 0 && standings.every((t: any) => t.hasLegs === false);

  // Do sezóny 2016/17 se hrálo 3/0 — sloupce VP a PP by byly samé nuly.
  // Forma se počítá jen ze živých zápasů, archivní tabulky ji nemají.
  const columns = COLUMNS.filter(
    (c) => !(season?.pointsSystem === '3/0' && (c.label === 'VP' || c.label === 'PP'))
         && !(noLegs && (c.label === 'LZ' || c.label === 'LP'))
  );
  const showForm = standings.some((t) => t.form.length > 0);
  // Před prvním kolem je "pořadí" jen abecední seznam — medailové pruhy ani čísla
  // pozic by tvrdily něco, co se ještě nestalo.
  const notStarted = standings.length > 0 && standings.every((t) => t.played === 0);

  return (
    <div>
      <PageHeader
        title="Tabulka"
        subtitle={
          season
            ? `${season.isArchived ? 'Konečné pořadí' : 'Aktuální pořadí'} · ${season.name} · ${
                season.pointsSystem === '3/0' ? 'V=3, P=0' : 'V=3, VP=2, PP=1, P=0'
              }`
            : '…'
        }
        actions={<SeasonSwitcher value={season?.id ?? null} onChange={setSeason} />}
      >
        {season && <ArchiveBanner season={season} />}
      </PageHeader>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Target className="h-4 w-4 animate-spin text-primary" />
          Načítám tabulku…
        </div>
      )}

      {!loading && standings.length === 0 && (
        <div className="rounded-lg border border-border bg-white px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            Pro tuto sezónu nejsou k dispozici žádné výsledky.
          </p>
          {season?.archiveNote && (
            <p className="mt-1 text-xs text-muted-foreground">{season.archiveNote}</p>
          )}
        </div>
      )}

      {!loading && standings.length > 0 && (
        <>
          {notStarted && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <strong>Sezóna zatím nezačala.</strong> Tabulka se naplní po prvním odehraném kole —
              týmy jsou zatím seřazené podle abecedy.
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted hover:bg-muted">
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>Tým</TableHead>
                  {showForm && (
                    <TableHead className="hidden w-24 lg:table-cell" title="Posledních 5 zápasů">
                      Forma
                    </TableHead>
                  )}
                  {columns.map((c) => (
                    <TableHead
                      key={c.label}
                      title={c.title}
                      className={`w-11 text-center ${c.hide ?? ''}`}
                    >
                      {c.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-14 text-center" title="Rozdíl legů">±</TableHead>
                  <TableHead className="w-12 text-center text-slate-900" title="Body">B</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((team, index) => (
                  <TableRow
                    key={team.teamId}
                    className="border-border hover:bg-rose-50/50"
                  >
                    <TableCell className="text-center">
                      <span className="tnum text-sm font-semibold text-slate-500">
                        {notStarted ? '–' : index + 1}
                      </span>
                    </TableCell>

                    <TableCell className="max-w-0">
                      <div className="flex items-center gap-2">
                        {/* Medailová pozice: tenký pruh u hrany řádku místo barevného kolečka */}
                        <span
                          aria-hidden
                          className={`h-5 w-0.5 shrink-0 rounded-full ${
                            notStarted ? 'bg-transparent'
                            : index === 0 ? 'bg-amber-400'
                            : index === 1 ? 'bg-slate-300'
                            : index === 2 ? 'bg-amber-700/60'
                            : 'bg-transparent'
                          }`}
                        />
                        <div className="size-6 shrink-0 overflow-hidden rounded border border-border bg-white">
                          <img
                            src={getTeamLogo(team.teamName)}
                            alt=""
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement;
                              if (fallback) {
                                fallback.className = `size-6 shrink-0 rounded bg-gradient-to-br ${getTeamGradient(team.teamName)} grid place-items-center text-white`;
                                fallback.innerHTML = `<span class="text-[9px] font-bold">${team.teamName.split(' ').map((word: string) => word[0]).join('').slice(0, 3).toUpperCase()}</span>`;
                              }
                            }}
                          />
                        </div>
                        {/* U archivních sezón je teamId převzatý název z tabulky
                            starého webu, ne id v DB — odkaz na detail by vedl nikam */}
                        {season?.isArchived ? (
                          <span className="truncate font-medium text-slate-900">
                            {team.teamName}
                          </span>
                        ) : (
                          <Link
                            href={`/team/${team.teamId}`}
                            className="truncate font-medium text-slate-900 hover:text-primary hover:underline"
                          >
                            {team.teamName}
                          </Link>
                        )}
                      </div>
                    </TableCell>

                    {showForm && (
                      <TableCell className="hidden lg:table-cell">
                        <Form form={team.form} />
                      </TableCell>
                    )}

                    {columns.map((c) => (
                      <TableCell
                        key={c.label}
                        className={`tnum text-center text-slate-600 ${c.hide ?? ''}`}
                      >
                        {team[c.key as keyof TeamRecord] as number}
                      </TableCell>
                    ))}

                    <TableCell
                      className={`tnum text-center font-medium ${
                        noLegs ? 'text-slate-400'
                        : team.legDifference > 0 ? 'text-success'
                        : team.legDifference < 0 ? 'text-destructive'
                        : 'text-slate-500'
                      }`}
                    >
                      {noLegs ? '–' : `${team.legDifference > 0 ? '+' : ''}${team.legDifference}`}
                    </TableCell>

                    <TableCell className="tnum text-center text-base font-bold text-slate-900">
                      {team.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Z – zápasy · V/P – výhry a prohry
            {season?.pointsSystem !== '3/0' && ' · VP/PP – po rozstřelu'}
            {!noLegs && ' · LZ/LP – legy získané a ztracené · ± – rozdíl legů'}
            {' '}· B – body.
            {noLegs
              ? ' Legy se v tomto ročníku do tabulky nepočítaly. Pořadí: body → vzájemný zápas.'
              : ' Pořadí: body → vzájemný zápas → rozdíl legů.'}{' '}
            <Link href="/rules" className="underline hover:text-primary">Pravidla</Link>
          </p>
        </>
      )}
    </div>
  );
}
