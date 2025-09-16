"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Target, Users, Calendar, Settings, Crown, MapPin, Mail, Shield } from 'lucide-react';
import { TeamLogo } from '@/components/team-logo';
import Link from 'next/link';

export default function Profile() {
  const { data: session, status } = useSession();
  const [teamData, setTeamData] = useState<any>(null);
  const [teamMatches, setTeamMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user;
  const player = user?.player;
  const team = player?.team;

  // Fetch team data when session is ready
  useEffect(() => {
    async function fetchTeamData() {
      if (!team?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch team details
        const [teamResponse, matchesResponse] = await Promise.all([
          fetch(`/api/teams/${team.id}`),
          fetch(`/api/teams/${team.id}/matches`)
        ]);

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamData(teamData);
        }

        if (matchesResponse.ok) {
          const matches = await matchesResponse.json();
          setTeamMatches(matches);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session && team) {
      fetchTeamData();
    }
  }, [session, team]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Načítám profil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="text-center py-12 bg-gradient-to-br from-slate-50 via-white to-rose-50 rounded-3xl border border-gray-100">
        <div className="mb-6">
          <Badge className="bg-primary text-white px-4 py-2 text-sm font-semibold">
            OSOBNÍ PROFIL
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
          MŮJ <span className="text-primary">PROFIL</span>
        </h1>
        <p className="text-xl text-slate-600 font-medium">
          Osobní dashboard a statistiky
        </p>
      </section>

      <div className="flex flex-col lg:flex-row lg:items-start gap-8">
        {/* User Info - Enhanced */}
        <div className="lg:w-1/3">
          <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
            <CardHeader className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white shadow-lg border border-gray-100 p-2">
                {user?.image ? (
                  <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-accent rounded-xl grid place-items-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl font-black text-slate-900">{user?.name}</CardTitle>
              <CardDescription className="space-y-3">
                {user?.email && (
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-2">
                  {user?.role === 'kapitán' ? (
                    <div className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1 rounded-full font-bold text-sm">
                      <Crown className="h-4 w-4" />
                      {user.role}
                    </div>
                  ) : (
                    <Badge variant="outline" className="font-bold">
                      {user?.role}
                    </Badge>
                  )}
                </div>

                {team && (
                  <div className="pt-2">
                    <Link href={`/team/${team.id}`} className="hover:underline">
                      <div className="inline-flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors">
                        <div className="size-5">
                          <TeamLogo teamName={team.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{team.name}</span>
                      </div>
                    </Link>
                  </div>
                )}
              </CardDescription>
            </CardHeader>

            {player && (
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4">
                    <div className="text-3xl font-black text-primary mb-2">
                      {'0.0'}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold uppercase tracking-wide">BPI Index</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xl font-black text-accent">0</div>
                      <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Singlů</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xl font-black text-green-600">0</div>
                      <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Výher</div>
                    </div>
                  </div>

                  <div className="text-center bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1">Úspěšnost</div>
                    <div className="text-2xl font-black text-warning">
                      0%
                    </div>
                  </div>

                  <Button asChild className="w-full rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold">
                    <Link href={`/player/${player.id}`}>
                      <Target className="h-4 w-4 mr-2" />
                      Zobrazit veřejný profil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Main Content - Enhanced */}
        <div className="lg:w-2/3">
          {player && team ? (
            <Tabs defaultValue="team" className="space-y-6">
              <TabsList className="bg-slate-100 p-2 rounded-2xl w-full">
                <TabsTrigger value="team" className="rounded-xl px-6 py-3 font-bold flex-1">Můj tým</TabsTrigger>
                <TabsTrigger value="matches" className="rounded-xl px-6 py-3 font-bold flex-1">Moje zápasy</TabsTrigger>
                {user?.role === 'kapitán' && (
                  <TabsTrigger value="captain" className="rounded-xl px-6 py-3 font-bold flex-1">Kapitánské</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="team" className="space-y-6">
                <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {team.name} - Soupiska
                    </CardTitle>
                    <CardDescription>
                      Kompletní soupiska vašeho týmu s BPI žebříčkem
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <Target className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Načítám soupisku...</p>
                      </div>
                    ) : teamData ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Hráč</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-center">BPI</TableHead>
                            <TableHead className="text-center">Singlů</TableHead>
                            <TableHead className="text-center">Úspěšnost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamData.players.map((teamPlayer: any, index: number) => (
                            <TableRow key={teamPlayer.id} className={teamPlayer.id === player?.id ? 'bg-blue-50' : ''}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {teamPlayer.id === player?.id && (
                                    <Badge variant="outline" className="text-xs">TY</Badge>
                                  )}
                                  <div>
                                    <div className="font-medium">{teamPlayer.name}</div>
                                    {teamPlayer.nickname && (
                                      <div className="text-xs text-muted-foreground">
                                        "{teamPlayer.nickname}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {teamPlayer.role === 'kapitán' ? (
                                  <div className="inline-flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-full font-bold text-xs">
                                    <Crown className="h-3 w-3" />
                                    {teamPlayer.role}
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="font-semibold">
                                    {teamPlayer.role}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-primary/10 text-primary font-bold">{teamPlayer.bpi.toFixed(1)}</Badge>
                              </TableCell>
                              <TableCell className="text-center">{teamPlayer.stats.singlesPlayed}</TableCell>
                              <TableCell className="text-center">
                                {teamPlayer.stats.singlesPlayed > 0 
                                  ? Math.round((teamPlayer.stats.singlesWon / teamPlayer.stats.singlesPlayed) * 100)
                                  : 0}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nepodařilo se načíst soupisku týmu
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="matches" className="space-y-6">
                <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Rozpis týmu {team.name}
                    </CardTitle>
                    <CardDescription>
                      Všechny zápasy vašeho týmu v této sezóně
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <Target className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Načítám zápasy...</p>
                      </div>
                    ) : teamMatches.length > 0 ? (
                      <div className="space-y-4">
                        {teamMatches.map((match: any) => {
                          const isHome = match.homeTeamId === team.id;
                          const opponent = isHome ? match.awayTeam : match.homeTeam;
                          
                          return (
                            <div key={match.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-slate-50 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="size-8">
                                    <TeamLogo teamName={opponent.name} className="w-full h-full object-contain" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-primary/10 text-primary font-bold text-xs">
                                        {match.round}. kolo
                                      </Badge>
                                      {isHome && (
                                        <Badge className="bg-accent/10 text-accent font-bold text-xs">DOMÁCÍ</Badge>
                                      )}
                                    </div>
                                    <div className="font-bold text-slate-900">
                                      {isHome ? 'vs' : '@'} {opponent.name}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm text-slate-600 font-medium mt-1">
                                  {new Date(match.startTime).toLocaleDateString('cs-CZ', {
                                    day: 'numeric',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={match.endTime ? "default" : "outline"}
                                  className={match.endTime ? 'bg-green-100 text-green-800 font-bold' : 'bg-gray-100 text-gray-800 font-bold'}
                                >
                                  {match.endTime ? "Odehráno" : "Naplánováno"}
                                </Badge>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-semibold"
                                  asChild
                                >
                                  <Link href={`/match/${match.id}`}>
                                    {match.endTime ? "Detail" : user?.role === 'kapitán' ? "Zadat" : "Zobrazit"}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Žádné zápasy nenalezeny
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {user?.role === 'kapitán' && (
                <TabsContent value="captain" className="space-y-6">
                  <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        Kapitánské pravomoci
                      </CardTitle>
                      <CardDescription>
                        Funkce dostupné pouze kapitánům
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
                              <Crown className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-black text-slate-900">Vaše pravomoci:</h4>
                          </div>
                          <ul className="text-sm text-slate-700 space-y-2 font-medium">
                            <li className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-primary"></div>
                              Zadávání výsledků zápasů vašeho týmu
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-primary"></div>
                              Podepisování zápisu zápasu
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-primary"></div>
                              Správa sestavy týmu
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-primary"></div>
                              Přístup k týmovým statistikám
                            </li>
                          </ul>
                        </div>

                        <Button asChild className="w-full rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold">
                          <Link href="/matches">
                            <Target className="h-4 w-4 mr-2" />
                            Zadat výsledky zápasů
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
              <CardContent className="py-20 text-center">
                <div className="mx-auto mb-8 size-20 rounded-full bg-slate-100 grid place-items-center">
                  <User className="size-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Nejste přiřazen k hráči</h3>
                <p className="text-slate-600 text-lg mb-6">
                  Váš účet není propojen s žádným hráčem v lize.
                </p>
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-bold text-slate-900">Co dělat?</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    Kontaktujte administrátora pro přiřazení k vašemu hráčskému profilu.
                  </p>
                </div>
                <Button asChild className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold">
                  <Link href="/contact">
                    <Mail className="h-4 w-4 mr-2" />
                    Kontaktovat administrátora
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}