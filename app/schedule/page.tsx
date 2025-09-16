"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Clock } from "lucide-react";
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';

export default function Schedule() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Group matches by round
  const matchesByRound = matches.reduce((acc: any, match: any) => {
    const round = match.round || 1;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {});

  // Sort rounds and determine current round
  const sortedRounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);
    
  const currentRound = 1; // Later: calculate based on current date/completed matches
  const upcomingRounds = sortedRounds.filter(round => round >= currentRound);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Načítám rozpis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-gray-100 card-shadow">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
          ROZPIS <span className="text-primary">KOL</span>
        </h1>
        <p className="text-lg text-slate-600">
          Kompletní harmonogram sezóny 2025/2026
        </p>
      </div>

      {/* Current Round - Full Width */}
      {matchesByRound[currentRound] && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary grid place-items-center text-white font-black text-xl">
              {currentRound}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">AKTUÁLNÍ KOLO</h2>
              <p className="text-slate-600">
                {matchesByRound[currentRound][0]?.startTime 
                  ? new Date(matchesByRound[currentRound][0].startTime).toLocaleDateString('cs-CZ', {
                      day: 'numeric',
                      month: 'long'
                    })
                  : 'Datum bude upřesněn'
                }
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {matchesByRound[currentRound].map((match: any) => (
              <Card key={match.id} className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="relative bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 p-6">
                    <div className="flex items-center justify-between">
                      {/* Home Team */}
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-white shadow-sm border border-slate-200 p-1">
                          <img 
                            src={getTeamLogo(match.homeTeam.name)}
                            alt={match.homeTeam.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement;
                              if (fallback) {
                                fallback.className = `size-12 rounded-lg bg-gradient-to-br ${getTeamGradient(match.homeTeam.name)} grid place-items-center text-white shadow-sm`;
                                fallback.innerHTML = `<span class="font-black text-sm">${match.homeTeam.shortName || 'HOM'}</span>`;
                              }
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-black text-lg text-slate-900">{match.homeTeam.name}</div>
                          <div className="text-sm text-muted-foreground">DOMÁCÍ</div>
                        </div>
                      </div>
                      
                      {/* VS or Score */}
                      <div className="text-center">
                        {match.result ? (
                          <div className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-2xl shadow-lg">
                            {typeof match.result === 'object' && match.result?.homeScore !== undefined 
                              ? `${match.result.homeScore} : ${match.result.awayScore}` 
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
                          <div className="font-black text-lg text-slate-900">{match.awayTeam.name}</div>
                          <div className="text-sm text-muted-foreground">HOSTÉ</div>
                        </div>
                        <div className="size-12 rounded-lg bg-white shadow-sm border border-slate-200 p-1">
                          <img 
                            src={getTeamLogo(match.awayTeam.name)}
                            alt={match.awayTeam.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement;
                              if (fallback) {
                                fallback.className = `size-12 rounded-lg bg-gradient-to-br ${getTeamGradient(match.awayTeam.name)} grid place-items-center text-white shadow-sm`;
                                fallback.innerHTML = `<span class="font-black text-sm">${match.awayTeam.shortName || 'AWY'}</span>`;
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Rounds - Compact List */}
      {upcomingRounds.length > 1 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-slate-400" />
            <h2 className="text-xl font-black text-slate-900">NADCHÁZEJÍCÍ KOLA</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingRounds.slice(1).map((round) => {
              const roundMatches = matchesByRound[round];
              const firstMatch = roundMatches[0];
              const roundDate = firstMatch?.startTime ? 
                new Date(firstMatch.startTime).toLocaleDateString('cs-CZ', {
                  day: 'numeric',
                  month: 'short'
                }) : 'TBD';

              return (
                <Card key={round} className="rounded-xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all">
                  <CardHeader className="bg-slate-50 border-b border-gray-100 py-3">
                    <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span className="size-6 rounded-full bg-accent grid place-items-center text-white font-bold text-xs">
                        {round}
                      </span>
                      {round}. KOLO • {roundDate}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {roundMatches.map((match: any) => (
                      <div key={match.id} className="flex items-center justify-between text-sm hover:bg-slate-50 p-2 rounded transition-colors">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="size-6 rounded bg-white shadow-sm border border-slate-200 p-0.5">
                            <img 
                              src={getTeamLogo(match.homeTeam.name)}
                              alt={match.homeTeam.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="font-semibold text-slate-700 truncate text-xs">
                            {match.homeTeam.name}
                          </span>
                        </div>
                        <div className="text-slate-400 font-bold mx-2">vs</div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-semibold text-slate-700 truncate text-xs text-right">
                            {match.awayTeam.name}
                          </span>
                          <div className="size-6 rounded bg-white shadow-sm border border-slate-200 p-0.5">
                            <img 
                              src={getTeamLogo(match.awayTeam.name)}
                              alt={match.awayTeam.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}