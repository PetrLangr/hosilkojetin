"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target } from "lucide-react";
import { sortStandings, calculatePoints, type TeamRecord } from '@/lib/standings';
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';

async function getStandings() {
  try {
    const season = await prisma.season.findFirst({
      where: { isActive: true }
    });

    if (!season) {
      return [];
    }

    // Get all teams for the season
    const teams = await prisma.team.findMany({
      where: { seasonId: season.id },
      include: {
        homeMatches: {
          where: { 
            seasonId: season.id,
            endTime: { not: null } // Only completed matches
          },
          include: {
            homeTeam: true,
            awayTeam: true
          }
        },
        awayMatches: {
          where: { 
            seasonId: season.id,
            endTime: { not: null } // Only completed matches
          },
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });

    // Calculate standings for each team
    const standings: TeamRecord[] = teams.map(team => {
      let played = 0;
      let won = 0;
      let wonPenalty = 0;
      let lostPenalty = 0;
      let lost = 0;
      let legsFor = 0;
      let legsAgainst = 0;

      // Process home matches
      team.homeMatches.forEach(match => {
        if (match.result && typeof match.result === 'object') {
          played++;
          const result = match.result as any;
          
          // For now, since we don't have actual match results, 
          // we'll show all teams with 0 stats until matches are played
          // This is placeholder logic that can be updated when we have real results
        }
      });

      // Process away matches
      team.awayMatches.forEach(match => {
        if (match.result && typeof match.result === 'object') {
          played++;
          const result = match.result as any;
          
          // Placeholder logic for away matches
        }
      });

      const legDifference = legsFor - legsAgainst;
      const points = calculatePoints(won, wonPenalty, lostPenalty);

      return {
        teamId: team.id,
        teamName: team.name,
        played,
        won,
        wonPenalty,
        lostPenalty,
        lost,
        legsFor,
        legsAgainst,
        legDifference,
        points
      };
    });

    return sortStandings(standings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    return [];
  }
}

export default function Standings() {
  const [standings, setStandings] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      try {
        // For now use mock standings since we don't have real match results yet
        const mockStandings: TeamRecord[] = [
          { teamId: '1', teamName: 'DC Stop Chropyně', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '2', teamName: 'Rychlí šneci Vlkoš', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '3', teamName: 'ŠK Pivní psi Chropyně', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '4', teamName: 'Bochořský koblihy', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '5', teamName: 'Cech křivé šipky', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '6', teamName: 'Hospoda Kanada', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '7', teamName: 'Kohouti Ludslavice', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '8', teamName: 'Stoned Lobo Ponies', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '9', teamName: 'DC Kraken Dřínov', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '10', teamName: 'AK Kojetín', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '11', teamName: 'Draci Počenice', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 },
          { teamId: '12', teamName: 'Dark Horse Moštárna', played: 0, won: 0, wonPenalty: 0, lostPenalty: 0, lost: 0, legsFor: 0, legsAgainst: 0, legDifference: 0, points: 0 }
        ];
        setStandings(mockStandings);
      } catch (error) {
        console.error('Error fetching standings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Načítám tabulku...</p>
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
            LIGOVÁ <span className="text-primary">TABULKA</span>
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Aktuální pořadí týmů - sezóna 2025/2026
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-primary text-white px-4 py-2 font-bold">
              HŠL BODOVÁNÍ: V=3, VP=2, PP=1, P=0
            </Badge>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-white rounded-3xl border border-gray-100 card-shadow overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-warning" />
            POŘADÍ TÝMŮ
          </h2>
          <p className="text-slate-600 mt-1">Seřazeno podle bodů, leg difference a vzájemných zápasů</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-gray-100">
                <TableHead className="text-center font-black text-slate-700 py-4">#</TableHead>
                <TableHead className="font-black text-slate-700 py-4 min-w-[200px]">TÝM</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-4">Z</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-4">V</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-4">VP</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-4">PP</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-4">P</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-4">LZ</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-4">LP</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-4">±</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-4">BODY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((team, index) => (
                <TableRow 
                  key={team.teamId} 
                  className={`border-gray-100 transition-all duration-200 hover:bg-rose-50/80 hover:shadow-sm ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                  } ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200' : ''}`}
                >
                  <TableCell className="text-center py-6">
                    <div className={`size-8 rounded-full mx-auto font-black text-lg grid place-items-center ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                      'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700'
                    }`}>
                      {index + 1}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-white shadow-sm border border-slate-200 p-1 overflow-hidden">
                        <img 
                          src={getTeamLogo(team.teamName)}
                          alt={team.teamName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement;
                            if (fallback) {
                              fallback.className = `size-12 rounded-xl bg-gradient-to-br ${getTeamGradient(team.teamName)} grid place-items-center text-white shadow-sm`;
                              fallback.innerHTML = `<span class="font-black text-sm">${team.teamName.split(' ').map((word: string) => word[0]).join('').slice(0, 3).toUpperCase()}</span>`;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-black text-lg text-slate-900 leading-tight">{team.teamName}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.played} zápasů odehráno
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center py-6">
                    <div className="font-bold text-slate-600 text-lg">{team.played}</div>
                  </TableCell>
                  
                  <TableCell className="text-center py-6">
                    <div className="inline-flex items-center justify-center size-10 rounded-full bg-emerald-100 text-emerald-700 font-black text-lg">
                      {team.won}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center py-6">
                    <div className="font-bold text-slate-600 text-lg">{team.wonPenalty}</div>
                  </TableCell>
                  
                  <TableCell className="text-center py-6">
                    <div className="font-bold text-slate-600 text-lg">{team.lostPenalty}</div>
                  </TableCell>
                  
                  <TableCell className="text-center py-6">
                    <div className="inline-flex items-center justify-center size-10 rounded-full bg-red-100 text-red-700 font-black text-lg">
                      {team.lost}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center py-6">
                    <div className="font-bold text-slate-600 text-lg">{team.legsFor}</div>
                  </TableCell>
                  
                  <TableCell className="text-center py-6">
                    <div className="font-bold text-slate-600 text-lg">{team.legsAgainst}</div>
                  </TableCell>
                  
                  <TableCell className="text-center py-6">
                    <div className={`font-black text-lg ${team.legDifference >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {team.legDifference > 0 ? '+' : ''}{team.legDifference}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center py-6">
                    <div className="inline-flex items-center justify-center min-w-[60px] h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-black text-xl px-4">
                      {team.points}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {standings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-16">
                    <div className="mx-auto mb-6 size-20 rounded-full bg-muted grid place-items-center">
                      <Trophy className="size-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Žádné týmy v tabulce</h3>
                    <p className="text-slate-600">Tabulka bude dostupná po prvních odehraných zápasech</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}