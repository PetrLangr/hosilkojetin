"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Trophy, Users, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';

export default function Players() {
  const [expandedSections, setExpandedSections] = useState({
    matches: false,
    legs: false,
    throws: false,
    checkouts: false
  });
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/players');
        if (response.ok) {
          const playersData = await response.json();
          setPlayers(playersData);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Načítám hráče...</p>
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
              {players.length} AKTIVNÍCH HRÁČŮ
            </Badge>
          </div>
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
                  <TableHead className="text-center font-black text-slate-700 py-6 w-16 sticky left-0 bg-slate-50 z-10">#</TableHead>
                  <TableHead className="font-black text-slate-700 py-6 w-64 sticky left-16 bg-slate-50 z-10">HRÁČ</TableHead>
                  
                  {/* Zápasy */}
                  <TableHead className="text-center font-black text-slate-700 py-6 w-32 cursor-pointer hover:text-primary transition-colors">
                    <div className="flex items-center justify-center gap-2">
                      ZÁPASY %
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
                  
                  {/* Legy */}
                  <TableHead className="text-center font-black text-slate-700 py-6 w-32 cursor-pointer hover:text-accent transition-colors border-l border-slate-300">
                    <div className="flex items-center justify-center gap-2">
                      LEGY %
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
                    </>
                  )}
                  
                  <TableHead className="text-center font-black text-slate-700 py-6 w-24 border-l border-slate-300">PROFIL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player: any, index: number) => (
                  <TableRow 
                    key={player.id}
                    className={`border-gray-100 transition-all duration-200 hover:bg-rose-50/60 hover:shadow-sm ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    } ${index === 0 ? 'bg-gradient-to-r from-rose-50/50 to-white' : ''}`}
                  >
                    <TableCell className="text-center py-8 sticky left-0 bg-inherit z-10">
                      <div className={`size-10 rounded-full mx-auto font-black text-lg grid place-items-center ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md' :
                        'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700'
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-8 sticky left-16 bg-inherit z-10">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-white shadow-sm border border-slate-200 p-1 shrink-0 overflow-hidden">
                          <img 
                            src={getTeamLogo(player.teamName)}
                            alt={player.teamName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement;
                              if (fallback) {
                                fallback.className = `size-12 rounded-xl bg-gradient-to-br ${getTeamGradient(player.teamName)} grid place-items-center shrink-0 text-white shadow-sm`;
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
                            {player.teamName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Zápasy */}
                    <TableCell className="text-center py-8">
                      <div className="font-black text-xl text-slate-900">{player.winRate}%</div>
                    </TableCell>
                    
                    {expandedSections.matches && (
                      <>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{player.played}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{player.won}</div>
                        </TableCell>
                      </>
                    )}
                    
                    {/* Legy */}
                    <TableCell className="text-center py-8">
                      <div className="font-black text-xl text-slate-900">
                        {Math.round(((player.won * 2) / (player.played * 3 || 1)) * 100)}%
                      </div>
                    </TableCell>
                    
                    {expandedSections.legs && (
                      <>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{player.played * 3}</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">{player.won * 2}</div>
                        </TableCell>
                      </>
                    )}
                    
                    {/* Náhozy */}
                    <TableCell className="text-center py-8">
                      <div className="font-black text-xl text-slate-900">0</div>
                    </TableCell>
                    
                    {expandedSections.throws && (
                      <>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">0</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">0</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">0</div>
                        </TableCell>
                      </>
                    )}
                    
                    {/* Checkouty */}
                    <TableCell className="text-center py-8">
                      <div className="font-black text-xl text-slate-900">0</div>
                    </TableCell>
                    
                    {expandedSections.checkouts && (
                      <>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">0</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">0</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">0</div>
                        </TableCell>
                        <TableCell className="text-center py-8">
                          <div className="font-bold text-slate-600 text-lg">0</div>
                        </TableCell>
                      </>
                    )}
                    
                    <TableCell className="text-center py-8">
                      <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-semibold px-4 py-2">
                        <Link href={`/player/${player.id}`}>
                          Profil
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}