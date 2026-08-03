"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Trophy, Info, Globe, ArrowRight } from "lucide-react";
import { getTeamLogo } from "@/lib/team-logos";
import { PageHeader } from "@/components/layout/page-header";

interface Placing {
  name: string;
  points: number;
}

interface SeasonSummary {
  id: string;
  name: string;
  isActive: boolean;
  isArchived: boolean;
  pointsSystem: string;
  archiveNote: string | null;
  teamCount: number;
  matchCount: number;
  playerCount: number;
  rounds: number;
  winner: Placing | null;
  runnerUp: Placing | null;
  third: Placing | null;
}

/**
 * Ročník bez odehraných zápasů se nedohrál — 2014/15 má na starém webu jen tabulku
 * po 3. kole. Tým na prvním místě tehdy nebyl mistr, jen průběžně vedl.
 */
const unfinished = (s: SeasonSummary) => s.matchCount === 0;

/** Logo týmu v malém čtverečku, sjednocené napříč tabulkou i síní slávy. */
function TeamMark({ name, size = "size-5" }: { name: string; size?: string }) {
  return (
    <span className={`${size} shrink-0 overflow-hidden rounded border border-border bg-white`}>
      <img src={getTeamLogo(name)} alt="" className="h-full w-full object-contain" />
    </span>
  );
}

export default function ArchivePage() {
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/archive")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSeasons)
      .catch(() => setSeasons([]))
      .finally(() => setLoading(false));
  }, []);

  const totals = {
    matches: seasons.reduce((a, s) => a + s.matchCount, 0),
    teams: seasons.reduce((a, s) => a + s.teamCount, 0),
    players: seasons.reduce((a, s) => a + s.playerCount, 0),
  };

  // Nejúspěšnější týmy podle počtu vyhraných ročníků.
  // Starý web psal stejný klub v různých sezónách různě ("Š Vepři K" vs "Š VEPŘI K"),
  // proto se tituly sčítají přes název bez ohledu na velikost písmen a diakritiku.
  // Přejmenování klubu (Moštárna Kojetín -> Dark Horse Moštárna) tím spojené není —
  // to jsou různé názvy a bez ručního mapování je za jeden tým prohlásit nelze.
  const key = (n: string) => n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  const titles = new Map<string, { label: string; count: number }>();
  seasons
    .filter((s) => s.winner && !s.isActive && !unfinished(s))
    .forEach((s) => {
      const k = key(s.winner!.name);
      const hit = titles.get(k);
      // zobrazíme zápis z nejnovější sezóny (pole je řazené sestupně)
      if (hit) hit.count += 1;
      else titles.set(k, { label: s.winner!.name, count: 1 });
    });
  const hallOfFame = [...titles.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Archiv"
        subtitle={
          loading
            ? "…"
            : `${seasons.length} sezón · ${totals.matches} zápasů · ${totals.teams} týmů · ${totals.players} hráčů`
        }
        actions={
          <Link
            href="/archiv/dokumenty"
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
          >
            <Globe className="h-3.5 w-3.5" />
            Původní web
            <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Target className="h-4 w-4 animate-spin text-primary" />
          Načítám archiv…
        </div>
      )}

      {!loading && seasons.length === 0 && (
        <div className="rounded-lg border border-border bg-white px-4 py-10 text-center text-sm text-muted-foreground">
          Archiv je zatím prázdný.
        </div>
      )}

      {!loading && seasons.length > 0 && (
        <div className="space-y-4">
          {/* Síň slávy je jen pět položek — vodorovný pruh nechá tabulce plnou šířku,
              aby se do sloupce vítězů vešla celá jména */}
          {hallOfFame.length > 0 && (
            <section className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-lg border border-border bg-white px-3 py-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Trophy className="h-4 w-4 text-warning" />
                Síň slávy
              </span>
              <span className="mr-1 text-[11px] text-muted-foreground">vyhrané ročníky</span>
              {hallOfFame.map(({ label: name, count }) => (
                <span
                  key={name}
                  className="flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-1"
                >
                  <TeamMark name={name} size="size-4" />
                  <span className="text-xs font-medium text-slate-900">{name}</span>
                  <span className="tnum text-xs font-bold text-primary">{count}×</span>
                </span>
              ))}
            </section>
          )}

          <div>
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted hover:bg-muted">
                    <TableHead className="w-24">Sezóna</TableHead>
                    <TableHead>Vítěz</TableHead>
                    <TableHead className="w-12 text-center" title="Body vítěze">B</TableHead>
                    <TableHead className="hidden lg:table-cell">2. místo</TableHead>
                    <TableHead className="hidden xl:table-cell">3. místo</TableHead>
                    <TableHead className="w-12 text-center" title="Počet týmů">Týmů</TableHead>
                    <TableHead className="w-14 text-center" title="Počet zápasů">Zápasů</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasons.map((s) => {
                    const champion = s.winner && !unfinished(s) && !s.isActive;
                    // Před prvním kolem vrací API jako "vítěze" abecedně první tým s nulou
                    // bodů — dokud se nehrálo, nemá se čí jméno ukazovat. Týká se jen
                    // rozjeté sezóny; 2014/15 zápasy taky nemá, ale tabulku ze starého
                    // webu ano, takže její pořadí je skutečné.
                    const noResults = s.isActive && unfinished(s);
                    return (
                      <TableRow key={s.id} className="border-border hover:bg-rose-50/50">
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/standings?season=${encodeURIComponent(s.id)}`}
                              className="tnum font-semibold text-slate-900 hover:text-primary hover:underline"
                            >
                              {s.name}
                            </Link>
                            {s.isActive && (
                              <span className="rounded bg-accent px-1 py-0.5 text-[9px] font-bold uppercase text-white">
                                běží
                              </span>
                            )}
                            {/* Ikona sama title nepřijímá, proto obalený span */}
                            {s.archiveNote && (
                              <span title={s.archiveNote} className="shrink-0" aria-label={s.archiveNote}>
                                <Info className="h-3 w-3 text-amber-600" />
                              </span>
                            )}
                          </div>
                          {/* Do 2016/17 se hrálo bez bodů za rozstřel — bez toho nedávají
                              čísla ve starších ročnících smysl */}
                          <div className="text-[11px] text-muted-foreground">
                            {unfinished(s) && !s.isActive
                              ? 'nedohráno'
                              : s.pointsSystem === "3/0" ? "V=3, P=0" : "V=3, VP=2, PP=1, P=0"}
                          </div>
                        </TableCell>

                        <TableCell className="max-w-0">
                          {noResults && s.isActive ? (
                            <span className="text-xs text-muted-foreground">sezóna začíná</span>
                          ) : s.winner ? (
                            <div className="flex items-center gap-2">
                              {champion && <Trophy className="h-3.5 w-3.5 shrink-0 text-warning" />}
                              <TeamMark name={s.winner.name} />
                              <span
                                className="truncate text-xs font-medium text-slate-900"
                                title={champion ? undefined : 'Ročník nedohrán — šlo jen o průběžné vedení'}
                              >
                                {s.winner.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">bez výsledků</span>
                          )}
                        </TableCell>

                        <TableCell className="tnum text-center text-slate-600">
                          {noResults || !s.winner ? '—' : s.winner.points}
                        </TableCell>

                        <TableCell className="hidden max-w-0 lg:table-cell">
                          <span className="block truncate text-xs text-slate-600">
                            {noResults ? "—" : s.runnerUp?.name ?? "—"}
                          </span>
                        </TableCell>

                        <TableCell className="hidden max-w-0 xl:table-cell">
                          <span className="block truncate text-xs text-slate-600">
                            {noResults ? "—" : s.third?.name ?? "—"}
                          </span>
                        </TableCell>

                        <TableCell className="tnum text-center text-slate-600">{s.teamCount}</TableCell>
                        <TableCell className="tnum text-center text-slate-600">{s.matchCount}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Klik na sezónu otevře její tabulku. U archivních ročníků jde o konečné pořadí tak, jak ho liga vyhlásila.
            </p>
          </div>

          <Link
            href="/archiv/dokumenty"
            className="group flex items-center gap-3 rounded-lg border border-border bg-white p-3 transition-colors hover:border-primary/40"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded bg-primary/10">
              <Globe className="h-4 w-4 text-primary" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900 group-hover:text-primary">
                Původní web
              </span>
              <span className="block text-xs text-muted-foreground">
                Dokumenty ke stažení, pravidla a stránky starého webu
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary" />
          </Link>
        </div>
      )}
    </div>
  );
}
