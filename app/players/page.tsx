"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, X, Construction } from "lucide-react";
import Link from "next/link";
import { PageHeader } from '@/components/layout/page-header';
import { getTeamLogo } from '@/lib/team-logos';
import { TeamMark } from '@/components/team-mark';

export default function Players() {
  const { data: session, status } = useSession();
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [teams, setTeams] = useState<any[]>([]);

  // Helper function to safely get player stats
  const getPlayerStats = (player: any) => {
    const stats = player.stats?.[0] || {};
    return {
      // Total stats (all game types)
      totalPlayed: stats.totalGamesPlayed || 0,
      totalWon: stats.totalGamesWon || 0,

      // Singles-specific stats
      singlesPlayed: stats.singlesPlayed || 0,
      singlesWon: stats.singlesWon || 0,

      // Performance events (singles only)
      S95: stats.S95 || 0,
      S133: stats.S133 || 0,
      S170: stats.S170 || 0,
      Asfalt: stats.Asfalt || 0,
      CO3: stats.CO3 || 0,
      CO4: stats.CO4 || 0,
      CO5: stats.CO5 || 0,
      CO6: stats.CO6 || 0,
      highestCheckout: stats.highestCheckout || 0,
      hslIndex: player.hslIndex || 0,
      usoIndex: player.usoIndex || 0
    };
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch players
        const playersResponse = await fetch('/api/players');
        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          // Sort players by HSL Index descending for ranking
          const sortedPlayers = playersData.sort((a: any, b: any) => (b.hslIndex || 0) - (a.hslIndex || 0));
          setPlayers(sortedPlayers);
          setFilteredPlayers(sortedPlayers);
        }

        // Fetch teams for dropdown
        const teamsResponse = await fetch('/api/teams');
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter players when search or team selection changes
  useEffect(() => {
    let filtered = [...players];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply team filter
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(player => player.teamId === selectedTeam);
    }

    setFilteredPlayers(filtered);
  }, [searchQuery, selectedTeam, players]);


  if (loading || status === "loading") {
    return (
      <div>
        <PageHeader title="Hráči" />
        <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Načítám hráče…
        </div>
      </div>
    );
  }

  // Nepřihlášeným ukazujeme, co se chystá. Statistiky hráčů zatím nejsou
  // dopočítané pro celou sezónu, takže žebříček by byl samá nula.
  if (!session) {
    return (
      <div>
        <PageHeader title="Hráči" subtitle="statistiky se připravují" />
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
            <Construction className="h-4 w-4" />
            Žebříček hráčů zatím není hotový
          </p>
          <p className="mt-1 text-xs text-amber-900/80">
            Chystáme HŠL index, kompletní statistiky za sezónu (singly, dvojice, trojice),
            vysoké náhozy 95+, 133+ a 170+, rychlá zavření CO3–CO6 a historii výsledků.
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { href: '/standings', label: 'Tabulka' },
            { href: '/teams', label: 'Týmy a soupisky' },
            { href: '/schedule', label: 'Zápasy' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Pořadí bereme z celé ligy, ne z vyfiltrovaného výpisu — po výběru týmu
  // má hráč pořád své ligové umístění, ne "1. v týmu".
  const rankOf = new Map(players.map((p: any, i: number) => [p.id, i + 1]));
  // Bez odehraných singlů je index všude nula — medailové pruhy by nic neznamenaly.
  const notStarted = players.every((p: any) => !(p.stats?.[0]?.singlesPlayed > 0));
  const filtersActive = searchQuery !== '' || selectedTeam !== 'all';

  return (
    <div>
      <PageHeader
        title="Hráči"
        subtitle={filtersActive ? `${filteredPlayers.length} z ${players.length}` : `${players.length} hráčů`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Hledat hráče"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-40 rounded-md pl-8 text-sm sm:w-52"
              />
            </div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="h-8 w-40 rounded-md text-sm sm:w-48">
                <SelectValue placeholder="Tým" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny týmy</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <TeamMark name={team.name} shortName={team.shortName} logoUrl={getTeamLogo(team.name)} />
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filtersActive && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTeam('all');
                }}
                className="h-8 rounded-md px-2 text-xs text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Zrušit
              </Button>
            )}
          </div>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted hover:bg-muted">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Hráč</TableHead>
              <TableHead className="w-14 text-center text-slate-900" title="HŠL index">Index</TableHead>
              <TableHead className="hidden w-11 text-center md:table-cell" title="Odehrané singly">S</TableHead>
              <TableHead className="hidden w-11 text-center md:table-cell" title="Vyhrané singly">SV</TableHead>
              <TableHead className="w-12 text-center" title="Úspěšnost v singlech">%</TableHead>
              <TableHead className="hidden w-14 text-center lg:table-cell" title="Všechny hry: vyhrané/odehrané">Hry</TableHead>
              <TableHead className="hidden w-11 text-center md:table-cell" title="Náhozy 95+">95+</TableHead>
              <TableHead className="hidden w-11 text-center md:table-cell" title="Náhozy 133+">133+</TableHead>
              <TableHead className="hidden w-11 text-center md:table-cell" title="Náhozy 170+">170</TableHead>
              <TableHead className="hidden w-11 text-center lg:table-cell" title="Asfalt">A</TableHead>
              <TableHead className="w-11 text-center" title="Zavření na 3–6 šipek (CO3–CO6)">CO</TableHead>
              <TableHead className="hidden w-12 text-center lg:table-cell" title="Nejvyšší zavření">NZ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={13} className="py-3 text-center text-sm text-muted-foreground">
                  Žádný hráč neodpovídá filtru.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player: any) => {
                const st = getPlayerStats(player);
                const rank = rankOf.get(player.id) ?? 0;
                const checkouts = st.CO3 + st.CO4 + st.CO5 + st.CO6;
                return (
                  <TableRow key={player.id} className="border-border hover:bg-rose-50/50">
                    <TableCell className="text-center">
                      <span className="tnum text-sm font-semibold text-slate-500">{notStarted ? '–' : rank}</span>
                    </TableCell>

                    <TableCell className="max-w-0 min-w-40">
                      <div className="flex items-center gap-2">
                        {/* Medailová pozice: tenký pruh jako v tabulce týmů */}
                        <span
                          aria-hidden
                          className={`h-5 w-0.5 shrink-0 rounded-full ${
                            notStarted ? 'bg-transparent'
                            : rank === 1 ? 'bg-amber-400'
                            : rank === 2 ? 'bg-slate-300'
                            : rank === 3 ? 'bg-amber-700/60'
                            : 'bg-transparent'
                          }`}
                        />
                        <TeamMark
                          name={player.team?.name || '?'}
                          shortName={player.team?.shortName}
                          logoUrl={getTeamLogo(player.team?.name || '')}
                        />
                        {/* Detail hráče neexistuje — jméno zůstává jako text */}
                        <div className="min-w-0 leading-tight">
                          <div className="truncate font-medium text-slate-900">{player.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {player.team?.name || 'Bez týmu'}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="tnum text-center text-base font-bold text-slate-900">
                      {st.hslIndex.toFixed(1)}
                    </TableCell>
                    <TableCell className="tnum hidden text-center text-slate-600 md:table-cell">{st.singlesPlayed}</TableCell>
                    <TableCell className="tnum hidden text-center text-slate-600 md:table-cell">{st.singlesWon}</TableCell>
                    <TableCell className="tnum text-center font-medium text-slate-700">
                      {st.singlesPlayed > 0 ? `${Math.round((st.singlesWon / st.singlesPlayed) * 100)}` : '–'}
                    </TableCell>
                    <TableCell className="tnum hidden text-center text-slate-600 lg:table-cell">
                      {st.totalPlayed > 0 ? `${st.totalWon}/${st.totalPlayed}` : '–'}
                    </TableCell>
                    <TableCell className="tnum hidden text-center text-slate-600 md:table-cell">{st.S95}</TableCell>
                    <TableCell className="tnum hidden text-center text-slate-600 md:table-cell">{st.S133}</TableCell>
                    <TableCell className="tnum hidden text-center text-slate-600 md:table-cell">{st.S170}</TableCell>
                    <TableCell className="tnum hidden text-center text-slate-600 lg:table-cell">{st.Asfalt}</TableCell>
                    <TableCell
                      className="tnum text-center text-slate-600"
                      title={`CO3 ${st.CO3} · CO4 ${st.CO4} · CO5 ${st.CO5} · CO6 ${st.CO6}`}
                    >
                      {checkouts}
                    </TableCell>
                    <TableCell className="tnum hidden text-center text-slate-600 lg:table-cell">
                      {st.highestCheckout > 0 ? st.highestCheckout : '–'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Index – HŠL index · S/SV – singly odehrané a vyhrané · % – úspěšnost v singlech ·
        95+/133+/170 – vysoké náhozy · CO – zavření na 3–6 šipek (rozpis po najetí myší)
        · NZ – nejvyšší zavření · A – asfalt.
      </p>
    </div>
  );
}
