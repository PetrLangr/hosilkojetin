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

  // Sort rounds and determine current/previous/upcoming based on date
  const sortedRounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const now = new Date();

  // Find current round (first round with date >= today, or last completed if all past)
  let currentRound = sortedRounds[0];
  for (const round of sortedRounds) {
    const roundMatches = matchesByRound[round];
    const firstMatch = roundMatches[0];
    if (firstMatch?.startTime) {
      const matchDate = new Date(firstMatch.startTime);
      // If match date is today or in future, this is current/upcoming
      if (matchDate >= new Date(now.toDateString())) {
        currentRound = round;
        break;
      }
      // Otherwise keep checking, last one before today becomes current
      currentRound = round;
    }
  }

  // Check if current round is fully completed (all matches have results)
  const currentRoundMatches = matchesByRound[currentRound] || [];
  const allCompleted = currentRoundMatches.every((m: any) => m.result);

  // If current round is completed and there's a next round, move to next
  if (allCompleted && sortedRounds.indexOf(currentRound) < sortedRounds.length - 1) {
    currentRound = sortedRounds[sortedRounds.indexOf(currentRound) + 1];
  }

  const previousRounds = sortedRounds.filter(round => round < currentRound);
  const upcomingRounds = sortedRounds.filter(round => round > currentRound);

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
    <div className="space-y-6 md:space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8 md:py-12 bg-gradient-to-br from-slate-50 to-white rounded-xl md:rounded-2xl border border-gray-100 card-shadow px-4">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 mb-1 md:mb-2 tracking-tight">
          ROZPIS <span className="text-primary">KOL</span>
        </h1>
        <p className="text-sm md:text-lg text-slate-600">
          Harmonogram sezóny 2025/2026
        </p>
      </div>

      {/* Current Round - Full Width */}
      {matchesByRound[currentRound] && (
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary grid place-items-center text-white font-black text-lg md:text-xl">
              {currentRound}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">AKTUÁLNÍ KOLO</h2>
              <p className="text-slate-600 text-sm md:text-base">
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

          <div className="grid md:grid-cols-2 gap-3 md:gap-6">
            {matchesByRound[currentRound].map((match: any) => (
              <Card key={match.id} className="rounded-xl md:rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-0">
                  {/* Score on top */}
                  {match.result && (
                    <div className="bg-primary text-white text-center py-2 md:py-3 rounded-t-xl md:rounded-t-2xl">
                      <div className="font-black text-xl md:text-2xl">
                        {typeof match.result === 'object' && (match.result?.homeWins !== undefined || match.result?.homeScore !== undefined)
                          ? `${match.result.homeWins ?? match.result.homeScore} : ${match.result.awayWins ?? match.result.awayScore}`
                          : 'TBD'
                        }
                      </div>
                    </div>
                  )}
                  <div className="relative bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 p-3 md:p-6">
                    {/* Mobile: Vertical layout */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                      {/* Home Team */}
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="size-10 md:size-12 rounded-lg bg-white shadow-sm border border-slate-200 p-1 shrink-0">
                          <img
                            src={getTeamLogo(match.homeTeam.name)}
                            alt={match.homeTeam.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement;
                              if (fallback) {
                                fallback.className = `size-10 md:size-12 rounded-lg bg-gradient-to-br ${getTeamGradient(match.homeTeam.name)} grid place-items-center text-white shadow-sm`;
                                fallback.innerHTML = `<span class="font-black text-xs md:text-sm">${match.homeTeam.shortName || 'HOM'}</span>`;
                              }
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-black text-sm md:text-lg text-slate-900 truncate">{match.homeTeam.name}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">DOMÁCÍ</div>
                        </div>
                      </div>

                      {/* VS - only when no result (hidden on mobile, shown inline on desktop) */}
                      {!match.result && (
                        <div className="hidden md:block text-3xl font-black text-slate-400">VS</div>
                      )}

                      {/* Away Team */}
                      <div className="flex items-center gap-3 md:gap-4 md:flex-row-reverse">
                        <div className="size-10 md:size-12 rounded-lg bg-white shadow-sm border border-slate-200 p-1 shrink-0">
                          <img
                            src={getTeamLogo(match.awayTeam.name)}
                            alt={match.awayTeam.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement;
                              if (fallback) {
                                fallback.className = `size-10 md:size-12 rounded-lg bg-gradient-to-br ${getTeamGradient(match.awayTeam.name)} grid place-items-center text-white shadow-sm`;
                                fallback.innerHTML = `<span class="font-black text-xs md:text-sm">${match.awayTeam.shortName || 'AWY'}</span>`;
                              }
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1 md:text-right">
                          <div className="font-black text-sm md:text-lg text-slate-900 truncate">{match.awayTeam.name}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">HOSTÉ</div>
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
      {upcomingRounds.length > 0 && (
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
            <h2 className="text-lg md:text-xl font-black text-slate-900">NADCHÁZEJÍCÍ KOLA</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {upcomingRounds.map((round) => {
              const roundMatches = matchesByRound[round];
              const firstMatch = roundMatches[0];
              const roundDate = firstMatch?.startTime ? 
                new Date(firstMatch.startTime).toLocaleDateString('cs-CZ', {
                  day: 'numeric',
                  month: 'short'
                }) : 'TBD';

              return (
                <Card key={round} className="rounded-lg md:rounded-xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all">
                  <CardHeader className="bg-slate-50 border-b border-gray-100 py-2 md:py-3 px-3 md:px-6">
                    <CardTitle className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
                      <span className="size-5 md:size-6 rounded-full bg-accent grid place-items-center text-white font-bold text-xs">
                        {round}
                      </span>
                      {round}. KOLO • {roundDate}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 md:p-3 space-y-1.5 md:space-y-2">
                    {roundMatches.map((match: any) => (
                      <div key={match.id} className="flex items-center justify-between text-xs md:text-sm hover:bg-slate-50 p-1.5 md:p-2 rounded transition-colors">
                        <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
                          <div className="size-5 md:size-6 rounded bg-white shadow-sm border border-slate-200 p-0.5 shrink-0">
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
                        {match.result ? (
                          <div className="bg-primary/10 text-primary font-bold px-1.5 md:px-2 py-0.5 rounded text-xs mx-1 md:mx-2 shrink-0">
                            {match.result.homeWins ?? match.result.homeScore}:{match.result.awayWins ?? match.result.awayScore}
                          </div>
                        ) : (
                          <div className="text-slate-400 font-bold mx-1 md:mx-2 text-xs shrink-0">vs</div>
                        )}
                        <div className="flex items-center gap-1.5 md:gap-2 flex-1 justify-end min-w-0">
                          <span className="font-semibold text-slate-700 truncate text-xs text-right">
                            {match.awayTeam.name}
                          </span>
                          <div className="size-5 md:size-6 rounded bg-white shadow-sm border border-slate-200 p-0.5 shrink-0">
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

      {/* Previous Rounds - Compact List */}
      {previousRounds.length > 0 && (
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Clock className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
            <h2 className="text-lg md:text-xl font-black text-slate-900">ODEHRANÁ KOLA</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {previousRounds.slice().reverse().map((round) => {
              const roundMatches = matchesByRound[round];
              const firstMatch = roundMatches[0];
              const roundDate = firstMatch?.startTime ?
                new Date(firstMatch.startTime).toLocaleDateString('cs-CZ', {
                  day: 'numeric',
                  month: 'short'
                }) : 'TBD';

              return (
                <Card key={round} className="rounded-lg md:rounded-xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all opacity-75">
                  <CardHeader className="bg-slate-100 border-b border-gray-100 py-2 md:py-3 px-3 md:px-6">
                    <CardTitle className="text-sm md:text-base font-black text-slate-700 flex items-center gap-2">
                      <span className="size-5 md:size-6 rounded-full bg-slate-400 grid place-items-center text-white font-bold text-xs">
                        {round}
                      </span>
                      {round}. KOLO • {roundDate}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 md:p-3 space-y-1.5 md:space-y-2">
                    {roundMatches.map((match: any) => (
                      <div key={match.id} className="flex items-center justify-between text-xs md:text-sm hover:bg-slate-50 p-1.5 md:p-2 rounded transition-colors">
                        <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
                          <div className="size-5 md:size-6 rounded bg-white shadow-sm border border-slate-200 p-0.5 shrink-0">
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
                        {match.result ? (
                          <div className="bg-slate-200 text-slate-700 font-bold px-1.5 md:px-2 py-0.5 rounded text-xs mx-1 md:mx-2 shrink-0">
                            {match.result.homeWins ?? match.result.homeScore}:{match.result.awayWins ?? match.result.awayScore}
                          </div>
                        ) : (
                          <div className="text-slate-400 font-bold mx-1 md:mx-2 text-xs shrink-0">vs</div>
                        )}
                        <div className="flex items-center gap-1.5 md:gap-2 flex-1 justify-end min-w-0">
                          <span className="font-semibold text-slate-700 truncate text-xs text-right">
                            {match.awayTeam.name}
                          </span>
                          <div className="size-5 md:size-6 rounded bg-white shadow-sm border border-slate-200 p-0.5 shrink-0">
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