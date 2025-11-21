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
    <div className="space-y-4 md:space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8 md:py-16 px-4 bg-gradient-to-br from-slate-50 to-white rounded-xl md:rounded-3xl border border-gray-100 card-shadow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-900 mb-2 md:mb-4 tracking-tight">
            VŠECHNY <span className="text-primary">ZÁPASY</span>
          </h1>
          <p className="text-sm md:text-xl text-slate-600 mb-4 md:mb-6">
            Kompletní přehled všech utkání sezóny 2025/2026
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-primary text-white px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs md:text-sm">
              {matches.length} ZÁPASŮ V SEZÓNĚ
            </Badge>
          </div>
        </div>
      </div>

      {/* Round Filter */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs md:text-sm font-semibold text-slate-600 mr-1 md:mr-2 shrink-0">Kolo:</span>
          <Button
            variant={selectedRound === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRound(null)}
            className={`rounded-lg text-xs md:text-sm px-2 md:px-3 ${selectedRound === null ? 'bg-primary text-white' : ''}`}
          >
            Vše
          </Button>
          {rounds.map((round) => (
            <Button
              key={round}
              variant={selectedRound === round ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRound(round)}
              className={`rounded-lg text-xs md:text-sm px-2 md:px-3 ${selectedRound === round ? 'bg-primary text-white' : ''}`}
            >
              {round}
            </Button>
          ))}
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4 md:space-y-6">
        {filteredMatches.map((match: any, index: number) => {
          const prevMatch = index > 0 ? filteredMatches[index - 1] : null;
          const showRoundDivider = !prevMatch || prevMatch.round !== match.round;

          return (
            <div key={match.id}>
              {/* Round Divider */}
              {showRoundDivider && (
                <div className="relative my-4 md:my-8 first:mt-0">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-gradient-to-r from-primary to-accent text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-sm md:text-lg shadow-lg">
                      <Trophy className="inline h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                      {match.round}. KOLO
                    </div>
                  </div>
                </div>
              )}
          <Card key={match.id} className="rounded-xl md:rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-0">
              {/* Match Header */}
              <div className="relative overflow-hidden rounded-t-xl md:rounded-t-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 p-3 md:p-6">
                {/* Score on top for mobile */}
                <div className="flex justify-center mb-3 md:hidden">
                  {match.result ? (
                    <div className="bg-primary text-white px-4 py-1.5 rounded-xl font-black text-lg shadow-lg">
                      {typeof match.result === 'object' && (match.result?.homeWins !== undefined || match.result?.homeScore !== undefined)
                        ? `${match.result.homeWins ?? match.result.homeScore} : ${match.result.awayWins ?? match.result.awayScore}`
                        : 'TBD'
                      }
                    </div>
                  ) : (
                    <div className="text-xl font-black text-slate-400">VS</div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                  {/* Home Team */}
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="size-10 md:size-14 rounded-lg md:rounded-xl bg-white shadow-sm border border-slate-200 p-1 shrink-0">
                      <img
                        src={getTeamLogo(match.homeTeam.name)}
                        alt={match.homeTeam.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement;
                          if (fallback) {
                            fallback.className = `size-10 md:size-14 rounded-lg md:rounded-xl bg-gradient-to-br ${getTeamGradient(match.homeTeam.name)} grid place-items-center text-white shadow-sm`;
                            fallback.innerHTML = `<span class="font-black text-xs md:text-sm">${match.homeTeam.shortName || 'HOM'}</span>`;
                          }
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-sm md:text-xl text-slate-900 truncate">{match.homeTeam.name}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">DOMÁCÍ</div>
                    </div>
                  </div>

                  {/* VS or Score - Desktop only */}
                  <div className="text-center hidden md:block">
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
                  <div className="flex items-center gap-3 md:gap-4 md:flex-row-reverse">
                    <div className="size-10 md:size-14 rounded-lg md:rounded-xl bg-white shadow-sm border border-slate-200 p-1 shrink-0">
                      <img
                        src={getTeamLogo(match.awayTeam.name)}
                        alt={match.awayTeam.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement;
                          if (fallback) {
                            fallback.className = `size-10 md:size-14 rounded-lg md:rounded-xl bg-gradient-to-br ${getTeamGradient(match.awayTeam.name)} grid place-items-center text-white shadow-sm`;
                            fallback.innerHTML = `<span class="font-black text-xs md:text-sm">${match.awayTeam.shortName || 'AWY'}</span>`;
                          }
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1 md:text-right">
                      <div className="font-black text-sm md:text-xl text-slate-900 truncate">{match.awayTeam.name}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">HOSTÉ</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Match Details */}
              <div className="p-3 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1.5 md:space-y-1">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-600 text-xs md:text-sm">
                        {match.startTime ? new Date(match.startTime).toLocaleDateString('cs-CZ', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        }) : 'Datum neuvedeno'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={match.endTime ? "default" : "outline"}
                        className={`font-bold text-xs ${match.endTime ? "bg-emerald-600 text-white" : "border-amber-400 text-amber-600"}`}
                      >
                        {match.endTime ? "ODEHRÁNO" : "NAPLÁNOVÁNO"}
                      </Badge>
                    </div>
                  </div>

                  {session?.user?.role === 'admin' && (
                    <div className="flex items-center">
                      {match.endTime ? (
                        <Button asChild size="sm" className="rounded-lg md:rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 md:px-6 text-xs md:text-sm">
                          <Link href={`/match/${match.id}`}>
                            <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                            Upravit
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" className="rounded-lg md:rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold px-3 md:px-6 text-xs md:text-sm">
                          <Link href={`/match/${match.id}`}>
                            <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                            Zadat
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
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