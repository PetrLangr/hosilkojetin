"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Calendar, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';
import { useSession } from "next-auth/react";

// Removed unused server function - using API calls instead

export default function Matches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const { data: session } = useSession();

  // Get unique rounds from matches
  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);

  // Filter matches by selected round
  const filteredMatches = selectedRound
    ? matches.filter(m => m.round === selectedRound)
    : matches;

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch('/api/matches');
        if (response.ok) {
          const matchesData = await response.json();
          setMatches(matchesData);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Načítám zápasy...</p>
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
            VŠECHNY <span className="text-primary">ZÁPASY</span>
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Kompletní přehled všech utkání sezóny 2025/2026
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-primary text-white px-4 py-2 font-bold">
              {matches.length} ZÁPASŮ V SEZÓNĚ
            </Badge>
          </div>
        </div>
      </div>

      {/* Round Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-600 mr-2">Filtr kola:</span>
        <Button
          variant={selectedRound === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedRound(null)}
          className={`rounded-lg ${selectedRound === null ? 'bg-primary text-white' : ''}`}
        >
          Všechna
        </Button>
        {rounds.map((round) => (
          <Button
            key={round}
            variant={selectedRound === round ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRound(round)}
            className={`rounded-lg ${selectedRound === round ? 'bg-primary text-white' : ''}`}
          >
            {round}. kolo
          </Button>
        ))}
      </div>

      {/* Matches List */}
      <div className="space-y-6">
        {filteredMatches.map((match: any, index: number) => {
          const prevMatch = index > 0 ? filteredMatches[index - 1] : null;
          const showRoundDivider = !prevMatch || prevMatch.round !== match.round;

          return (
            <div key={match.id}>
              {/* Round Divider */}
              {showRoundDivider && (
                <div className="relative my-8 first:mt-0">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-full font-black text-lg shadow-lg">
                      <Trophy className="inline h-4 w-4 mr-2" />
                      {match.round}. KOLO
                    </div>
                  </div>
                </div>
              )}
          <Card key={match.id} className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <CardContent className="p-0">
              {/* Match Header - Single Row */}
              <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6">
                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-xl bg-white shadow-sm border border-slate-200 p-1">
                      <img 
                        src={getTeamLogo(match.homeTeam.name)}
                        alt={match.homeTeam.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement;
                          if (fallback) {
                            fallback.className = `size-14 rounded-xl bg-gradient-to-br ${getTeamGradient(match.homeTeam.name)} grid place-items-center text-white shadow-sm`;
                            fallback.innerHTML = `<span class="font-black text-sm">${match.homeTeam.shortName || 'HOM'}</span>`;
                          }
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-black text-xl text-slate-900">{match.homeTeam.name}</div>
                      <div className="text-sm text-muted-foreground">DOMÁCÍ • {match.round}. kolo</div>
                    </div>
                  </div>
                  
                  {/* VS or Score */}
                  <div className="text-center">
                    {match.result ? (
                      <div className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-2xl shadow-lg">
                        {typeof match.result === 'object' && (match.result?.homeWins !== undefined || match.result?.homeScore !== undefined)
                          ? `${match.result.homeWins ?? match.result.homeScore} : ${match.result.awayWins ?? match.result.awayScore}`
                          : 'TBD'
                        }
                      </div>
                    ) : (
                      <div className="text-3xl font-black text-slate-400">VS</div>
                    )}
                  </div>
                  
                  {/* Away Team */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-black text-xl text-slate-900">{match.awayTeam.name}</div>
                      <div className="text-sm text-muted-foreground">HOSTÉ</div>
                    </div>
                    <div className="size-14 rounded-xl bg-white shadow-sm border border-slate-200 p-1">
                      <img 
                        src={getTeamLogo(match.awayTeam.name)}
                        alt={match.awayTeam.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement;
                          if (fallback) {
                            fallback.className = `size-14 rounded-xl bg-gradient-to-br ${getTeamGradient(match.awayTeam.name)} grid place-items-center text-white shadow-sm`;
                            fallback.innerHTML = `<span class="font-black text-sm">${match.awayTeam.shortName || 'AWY'}</span>`;
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Match Details */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold text-slate-600">
                        {match.startTime ? new Date(match.startTime).toLocaleDateString('cs-CZ', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Datum neuvedek'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={match.endTime ? "default" : "outline"} 
                        className={`font-bold ${match.endTime ? "bg-emerald-600 text-white" : "border-amber-400 text-amber-600"}`}
                      >
                        {match.endTime ? "OVĚŘENÝ VÝSLEDEK" : "NAPLÁNOVÁNO"}
                      </Badge>
                      {match.endTime && (
                        <Badge variant="outline" className="text-xs">
                          OVĚŘENO {new Date(match.endTime).toLocaleDateString('cs-CZ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {match.endTime ? (
                      // Completed match - only show button for admins
                      session?.user?.role === 'admin' && (
                        <Button asChild size="lg" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-6">
                          <Link href={`/match/${match.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Upravit výsledek
                          </Link>
                        </Button>
                      )
                    ) : (
                      // Scheduled match - show for admins
                      session?.user?.role === 'admin' && (
                        <Button asChild size="lg" className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold px-6">
                          <Link href={`/match/${match.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Zadat výsledek
                          </Link>
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
              </Card>
            </div>
          );
        })}
        
        {filteredMatches.length === 0 && (
          <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-6 size-20 rounded-full bg-slate-100 grid place-items-center">
                <Calendar className="size-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {selectedRound ? `Žádné zápasy v ${selectedRound}. kole` : 'Žádné zápasy'}
              </h3>
              <p className="text-slate-600">
                {selectedRound ? 'Zvolte jiné kolo' : 'Zápasy budou dostupné po vytvoření rozlosování'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}