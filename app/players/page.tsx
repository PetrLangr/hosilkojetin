"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Trophy, Users, Plus, Minus, Search, Filter, Home, Construction } from "lucide-react";
import Link from "next/link";
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';

export default function Players() {
  const { data: session, status } = useSession();
  const [expandedSections, setExpandedSections] = useState({
    matches: false,
    legs: false,
    throws: false,
    checkouts: false
  });
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };


  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Načítám hráče...</p>
        </div>
      </div>
    );
  }

  // Show "under construction" banner for non-logged-in users
  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          {/* Construction Hero */}
          <div className="relative mb-12">
            <div className="size-32 md:size-40 mx-auto rounded-full border-8 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 grid place-items-center">
              <Construction className="h-16 w-16 md:h-20 md:w-20 text-amber-600" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-6 mb-12">
            <Badge className="bg-amber-600 text-white px-6 py-3 text-lg font-bold">
              VE VÝVOJI
            </Badge>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              DETAILNÍ STATISTIKY <span className="text-primary">HRÁČŮ</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed">
              Připravujeme komplexní žebříček hráčů s detailními statistikami výkonnosti.
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-sm text-slate-600 space-y-3">
                <p><strong>Co můžete očekávat:</strong></p>
                <ul className="list-disc list-inside text-left mx-auto max-w-md space-y-1">
                  <li>HSL Index - žebříček hráčů podle výkonnosti</li>
                  <li>Kompletní statistiky za sezónu (singly, dvojice, trojice)</li>
                  <li>Sledování vysokých náhozů (95+, 133+, 170+)</li>
                  <li>Rychlá zavření (CO3, CO4, CO5, CO6)</li>
                  <li>Historie výsledků a trendů</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid md:grid-cols-3 gap-4">
            <Button asChild className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold py-4">
              <Link href="/">
                <Home className="h-5 w-5 mr-2" />
                Domů
              </Link>
            </Button>

            <Button asChild variant="outline" className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white font-bold py-4">
              <Link href="/teams">
                <Target className="h-5 w-5 mr-2" />
                Týmy
              </Link>
            </Button>

            <Button asChild variant="outline" className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-100 font-bold py-4">
              <Link href="/standings">
                <Trophy className="h-5 w-5 mr-2" />
                Tabulka
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-gray-100 card-shadow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
            ŽEBŘÍČEK <span className="text-primary">HRÁČŮ</span>
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Nejlepší hráči sezóny 2025/2026 podle různých statistik
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-primary text-white px-4 py-2 font-bold">
              {filteredPlayers.length} / {players.length} HRÁČŮ
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search by name */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Hledat hráče podle jména nebo přezdívky..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          {/* Filter by team */}
          <div className="w-full md:w-64">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="rounded-xl">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Vybrat tým" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny týmy</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded bg-white shadow-sm border border-slate-200 p-0.5">
                        <img
                          src={getTeamLogo(team.name)}
                          alt={team.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear filters button */}
          {(searchQuery || selectedTeam !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedTeam('all');
              }}
              className="rounded-xl"
            >
              Vymazat filtry
            </Button>
          )}
        </div>
      </div>

      {/* Player Statistics */}
      <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            KOMPLETNÍ STATISTIKY
          </CardTitle>
          <CardDescription className="text-slate-600 mt-1">
            Klikněte na libovolný sloupec pro seřazení podle této statistiky
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 border-gray-100">
                  <TableHead className="text-center font-black text-slate-700 py-6 w-16 sticky left-0 bg-slate-50 z-20">#</TableHead>
                  <TableHead className="font-black text-slate-700 py-6 w-64 sticky left-16 bg-slate-50 z-20 border-r-2 border-slate-200">HRÁČ</TableHead>
                  
                  {/* Celkem */}
                  <TableHead className="text-center font-black text-slate-700 py-6 w-32 cursor-pointer hover:text-primary transition-colors">
                    <div className="flex items-center justify-center gap-2">
                      CELKEM
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="size-6 p-0 hover:bg-primary hover:text-white transition-all"
                        onClick={() => toggleSection('matches')}
                      >
                        {expandedSections.matches ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableHead>
                  
                  {expandedSections.matches && (
                    <>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-24 cursor-pointer hover:text-primary transition-colors">
                        ODEHRÁNO
                      </TableHead>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-24 cursor-pointer hover:text-primary transition-colors">
                        VYHRÁNO
                      </TableHead>
                    </>
                  )}
                  
                  {/* Singly */}
                  <TableHead className="text-center font-black text-slate-700 py-6 w-32 cursor-pointer hover:text-accent transition-colors border-l border-slate-300">
                    <div className="flex items-center justify-center gap-2">
                      SINGLY
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="size-6 p-0 hover:bg-primary hover:text-white transition-all"
                        onClick={() => toggleSection('legs')}
                      >
                        {expandedSections.legs ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableHead>
                  
                  {expandedSections.legs && (
                    <>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-24 cursor-pointer hover:text-accent transition-colors">
                        ODEHRÁNO
                      </TableHead>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-24 cursor-pointer hover:text-accent transition-colors">
                        VYHRÁNO
                      </TableHead>
                    </>
                  )}
                  
                  {/* Náhozy */}
                  <TableHead className="text-center font-black text-slate-700 py-6 w-32 cursor-pointer hover:text-slate-900 transition-colors border-l border-slate-300">
                    <div className="flex items-center justify-center gap-2">
                      NÁHOZY
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="size-6 p-0 hover:bg-primary hover:text-white transition-all"
                        onClick={() => toggleSection('throws')}
                      >
                        {expandedSections.throws ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableHead>
                  
                  {expandedSections.throws && (
                    <>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-20 cursor-pointer hover:text-slate-900 transition-colors">95+</TableHead>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-20 cursor-pointer hover:text-slate-900 transition-colors">133+</TableHead>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-20 cursor-pointer hover:text-slate-900 transition-colors">170+</TableHead>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-20 cursor-pointer hover:text-slate-900 transition-colors">ASFALT</TableHead>
                    </>
                  )}
                  
                  {/* Checkouty */}
                  <TableHead className="text-center font-black text-slate-700 py-6 w-32 cursor-pointer hover:text-slate-900 transition-colors border-l border-slate-300">
                    <div className="flex items-center justify-center gap-2">
                      CHECKOUTY
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-6 p-0 hover:bg-primary hover:text-white transition-all"
                        onClick={() => toggleSection('checkouts')}
                      >
                        {expandedSections.checkouts ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableHead>

                  {expandedSections.checkouts && (
                    <>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-20 cursor-pointer hover:text-slate-900 transition-colors">CO3</TableHead>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-20 cursor-pointer hover:text-slate-900 transition-colors">CO4</TableHead>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-20 cursor-pointer hover:text-slate-900 transition-colors">CO5</TableHead>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-20 cursor-pointer hover:text-slate-900 transition-colors">CO6</TableHead>
                      <TableHead className="text-center font-black text-slate-700 py-6 w-28 cursor-pointer hover:text-slate-900 transition-colors border-l border-slate-300">NEJVYŠŠÍ ZAVŘENÍ</TableHead>
                    </>
                  )}

                  {/* HSL Index */}
                  <TableHead className="text-center font-black text-slate-700 py-6 w-32 border-l-2 border-primary bg-gradient-to-r from-rose-50 to-rose-50">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      HSL INDEX
                    </div>
                  </TableHead>

                  <TableHead className="text-center font-black text-slate-700 py-6 w-24 border-l border-slate-300">PROFIL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={20} className="text-center py-16">
                      <div className="text-center">
                        <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          Žádní hráči nenalezeni
                        </h3>
                        <p className="text-muted-foreground">
                          Zkuste upravit vyhledávací kritéria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player: any, index: number) => {
                  const playerStats = getPlayerStats(player);
                  return (
                  <TableRow
                    key={player.id}
                    className={`border-gray-100 transition-all duration-200 hover:bg-rose-50/60 hover:shadow-sm ${
                      index === 0 ? 'bg-gradient-to-r from-rose-50/50 to-transparent' :
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <TableCell
                      className={`text-center py-8 sticky left-0 z-20 ${
                        index === 0 ? 'bg-gradient-to-r from-rose-50 to-white' :
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                      style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}
                    >
                      <div className={`size-10 rounded-full mx-auto font-black text-lg grid place-items-center ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md' :
                        'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700'
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>

                    <TableCell
                      className={`py-8 sticky left-16 z-20 border-r-2 border-slate-200 ${
                        index === 0 ? 'bg-gradient-to-r from-rose-50 to-white' :
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                      style={{ boxShadow: '4px 0 8px -3px rgba(0,0,0,0.1)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-white shadow-sm border border-slate-200 p-1 shrink-0 overflow-hidden">
                          <img 
                            src={getTeamLogo(player.team?.name || '')}
                            alt={player.team?.name || ''}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement;
                              if (fallback) {
                                fallback.className = `size-12 rounded-xl bg-gradient-to-br ${getTeamGradient(player.team?.name || '')} grid place-items-center shrink-0 text-white shadow-sm`;
                                fallback.innerHTML = `<span class="font-black text-sm">${player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}</span>`;
                              }
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-lg text-slate-900 leading-tight">
                            <Link href={`/player/${player.id}`} className="hover:text-primary transition-colors">
                              {player.name}
                            </Link>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {player.team?.name || 'Bez týmu'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Celkem % */}
                    <TableCell className="text-center py-8">
                      <div className="font-black text-xl text-slate-900">
                        {playerStats.totalPlayed > 0 ? Math.round((playerStats.totalWon / playerStats.totalPlayed) * 100) : 0}%
                      </div>
                    </TableCell>
                    
                    {expandedSections.matches && (
                      <>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.totalPlayed}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.totalWon}</div>
                        </TableCell>
                      </>
                    )}
                    
                    {/* Singly % */}
                    <TableCell className="text-center py-8">
                      <div className="font-black text-xl text-slate-900">
                        {playerStats.singlesPlayed > 0 ? Math.round((playerStats.singlesWon / playerStats.singlesPlayed) * 100) : 0}%
                      </div>
                    </TableCell>
                    
                    {expandedSections.legs && (
                      <>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.singlesPlayed}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.singlesWon}</div>
                        </TableCell>
                      </>
                    )}
                    
                    {/* Náhozy */}
                    <TableCell className="text-center py-8">
                      <div className="font-black text-xl text-slate-900">{playerStats.S95 + playerStats.S133 + playerStats.S170}</div>
                    </TableCell>
                    
                    {expandedSections.throws && (
                      <>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.S95}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.S133}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.S170}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-red-600 text-lg">{playerStats.Asfalt}</div>
                        </TableCell>
                      </>
                    )}
                    
                    {/* Checkouty */}
                    <TableCell className="text-center py-8">
                      <div className="font-black text-xl text-slate-900">{playerStats.CO3 + playerStats.CO4 + playerStats.CO5 + playerStats.CO6}</div>
                    </TableCell>

                    {expandedSections.checkouts && (
                      <>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.CO3}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.CO4}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.CO5}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{playerStats.CO6}</div>
                        </TableCell>
                        <TableCell className="text-center py-8 border-l border-slate-300">
                          <div className="font-black text-xl text-emerald-700">
                            {playerStats.highestCheckout > 0 ? playerStats.highestCheckout : '-'}
                          </div>
                        </TableCell>
                      </>
                    )}

                    {/* HSL Index */}
                    <TableCell className="text-center py-8 border-l-2 border-primary bg-gradient-to-r from-rose-50/50 to-transparent">
                      <div className="font-black text-2xl text-primary">
                        {playerStats.hslIndex.toFixed(1)}
                      </div>
                    </TableCell>

                    <TableCell className="text-center py-8">
                      <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-semibold px-4 py-2">
                        <Link href={`/player/${player.id}`}>
                          Profil
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}