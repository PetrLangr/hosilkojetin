"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Target } from "lucide-react";
import Link from "next/link";
import { getTeamLogo, getTeamGradient, getTeamBackgroundGradient } from '@/lib/team-logos';


export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch('/api/teams');
        if (response.ok) {
          const teamsData = await response.json();
          setTeams(teamsData);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Načítám týmy...</p>
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
            TÝMY <span className="text-primary">HŠL</span>
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            12 týmů bojuje o titul v sezóně 2025/2026
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-primary text-white px-4 py-2 font-bold">
              {teams.length} TÝMŮ V LIZE
            </Badge>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teams.map((team: any, index: number) => (
          <Link key={team.id} href={`/team/${team.id}`}>
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full group overflow-hidden">
              {/* Team Header with Logo */}
              <div className="relative">
                <div className={`h-32 bg-gradient-to-br ${getTeamBackgroundGradient(team.name)} relative overflow-hidden`}>
                  {/* Team Pattern/Background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 size-20 rounded-full border-4 border-white/30" />
                    <div className="absolute bottom-4 left-4 size-12 rounded-full border-2 border-white/20" />
                  </div>
                  
                  {/* Team Logo */}
                  <div className="absolute bottom-4 left-4">
                    <div className="size-16 rounded-2xl bg-white shadow-lg border-2 border-white/50 p-2 overflow-hidden">
                      <img 
                        src={getTeamLogo(team.name)}
                        alt={team.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback to gradient with initials if image fails
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement;
                          if (fallback) {
                            fallback.className = `size-16 rounded-2xl bg-gradient-to-br ${getTeamGradient(team.name)} grid place-items-center text-white shadow-lg border-2 border-white/20`;
                            fallback.innerHTML = `<span class="font-black text-xl">${team.shortName || team.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()}</span>`;
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Position Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`font-black text-sm px-3 py-1 ${
                      index < 3 ? 'bg-primary text-white' : 'bg-white/90 text-slate-700'
                    }`}>
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Team Info */}
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight mb-1">
                      {team.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {team.city || 'Město neuvedeno'}
                    </p>
                  </div>
                  
                  {/* Team Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center bg-slate-50 rounded-xl p-3">
                      <div className="font-black text-2xl text-slate-900">{team._count.players}</div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Hráčů</div>
                    </div>
                    <div className="text-center bg-slate-50 rounded-xl p-3">
                      <div className="font-black text-2xl text-slate-900">0</div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Bodů</div>
                    </div>
                  </div>
                  
                  {/* Performance Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">VÝKONNOST</span>
                      <span className="text-slate-600">0%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500" 
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                  
                  {/* View Team Button */}
                  <Button className="w-full rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold group-hover:bg-[#9F1239] transition-all">
                    <Users className="h-4 w-4 mr-2" />
                    Zobrazit tým
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}