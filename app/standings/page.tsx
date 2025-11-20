"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target } from "lucide-react";
import { type TeamRecord } from '@/lib/standings';
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';

export default function Standings() {
  const [standings, setStandings] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      try {
        const response = await fetch('/api/standings');
        if (response.ok) {
          const data = await response.json();
          setStandings(data);
        }
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
    <div className="space-y-4 md:space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8 md:py-16 bg-gradient-to-br from-slate-50 to-white rounded-xl md:rounded-3xl border border-gray-100 card-shadow px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-900 mb-2 md:mb-4 tracking-tight">
            LIGOVÁ <span className="text-primary">TABULKA</span>
          </h1>
          <p className="text-sm md:text-xl text-slate-600 mb-4 md:mb-6">
            Aktuální pořadí týmů - sezóna 2025/2026
          </p>
          <div className="flex justify-center">
            <Badge className="bg-primary text-white px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs md:text-sm">
              V=3, VP=2, PP=1, P=0
            </Badge>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-white rounded-xl md:rounded-3xl border border-gray-100 card-shadow overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-4 md:px-8 py-3 md:py-6 border-b border-gray-100">
          <h2 className="text-lg md:text-2xl font-black text-slate-900 flex items-center gap-2 md:gap-3">
            <Trophy className="h-5 w-5 md:h-8 md:w-8 text-warning" />
            POŘADÍ TÝMŮ
          </h2>
          <p className="text-slate-600 mt-1 text-xs md:text-base hidden sm:block">Seřazeno podle bodů a leg difference</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-gray-100">
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm">#</TableHead>
                <TableHead className="font-black text-slate-700 py-2 md:py-4 px-2 md:px-4 text-xs md:text-sm">TÝM</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm">Z</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm">V</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm hidden md:table-cell">VP</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm hidden md:table-cell">PP</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm">P</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm hidden lg:table-cell">LZ</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm hidden lg:table-cell">LP</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm">±</TableHead>
                <TableHead className="text-center font-black text-slate-700 py-2 md:py-4 px-1 md:px-4 text-xs md:text-sm">B</TableHead>
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
                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4">
                    <div className={`size-6 md:size-8 rounded-full mx-auto font-black text-xs md:text-lg grid place-items-center ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                      'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700'
                    }`}>
                      {index + 1}
                    </div>
                  </TableCell>

                  <TableCell className="py-2 md:py-6 px-2 md:px-4">
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="size-8 md:size-12 rounded-lg md:rounded-xl bg-white shadow-sm border border-slate-200 p-0.5 md:p-1 overflow-hidden shrink-0">
                        <img
                          src={getTeamLogo(team.teamName)}
                          alt={team.teamName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement;
                            if (fallback) {
                              fallback.className = `size-8 md:size-12 rounded-lg md:rounded-xl bg-gradient-to-br ${getTeamGradient(team.teamName)} grid place-items-center text-white shadow-sm`;
                              fallback.innerHTML = `<span class="font-black text-xs">${team.teamName.split(' ').map((word: string) => word[0]).join('').slice(0, 3).toUpperCase()}</span>`;
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-xs md:text-lg text-slate-900 leading-tight truncate">{team.teamName}</div>
                        <div className="text-xs text-muted-foreground hidden md:block">
                          {team.played} zápasů
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4">
                    <div className="font-bold text-slate-600 text-xs md:text-lg">{team.played}</div>
                  </TableCell>

                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4">
                    <div className="inline-flex items-center justify-center size-6 md:size-10 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs md:text-lg">
                      {team.won}
                    </div>
                  </TableCell>

                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4 hidden md:table-cell">
                    <div className="font-bold text-slate-600 text-lg">{team.wonPenalty}</div>
                  </TableCell>

                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4 hidden md:table-cell">
                    <div className="font-bold text-slate-600 text-lg">{team.lostPenalty}</div>
                  </TableCell>

                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4">
                    <div className="inline-flex items-center justify-center size-6 md:size-10 rounded-full bg-red-100 text-red-700 font-black text-xs md:text-lg">
                      {team.lost}
                    </div>
                  </TableCell>

                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4 hidden lg:table-cell">
                    <div className="font-bold text-slate-600 text-lg">{team.legsFor}</div>
                  </TableCell>

                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4 hidden lg:table-cell">
                    <div className="font-bold text-slate-600 text-lg">{team.legsAgainst}</div>
                  </TableCell>

                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4">
                    <div className={`font-black text-xs md:text-lg ${team.legDifference >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {team.legDifference > 0 ? '+' : ''}{team.legDifference}
                    </div>
                  </TableCell>

                  <TableCell className="text-center py-2 md:py-6 px-1 md:px-4">
                    <div className="inline-flex items-center justify-center min-w-[32px] md:min-w-[60px] h-7 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r from-primary to-accent text-white font-black text-sm md:text-xl px-2 md:px-4">
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