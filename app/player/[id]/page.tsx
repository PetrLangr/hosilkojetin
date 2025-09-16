import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Target, Trophy, Calendar, BarChart3, TrendingUp, Crown } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { calculateBPI } from '@/lib/bpi';
import { TeamLogo } from '@/components/team-logo';

async function getPlayerDetail(id: string) {
  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: true,
        stats: true,
        gameEvents: {
          include: {
            game: {
              include: {
                match: {
                  include: {
                    homeTeam: true,
                    awayTeam: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return player;
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

async function getPlayerMatches(playerId: string) {
  try {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { team: true }
    });

    if (!player) return [];

    // Get all team matches (simplified approach)
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: player.teamId },
          { awayTeamId: player.teamId }
        ],
        seasonId: player.team.seasonId
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        games: true // Get all games, we'll filter client-side if needed
      },
      orderBy: [
        { round: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return matches;
  } catch (error) {
    console.error('Error fetching player matches:', error);
    return [];
  }
}

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const player = await getPlayerDetail(id);

  if (!player) {
    notFound();
  }

  const playerMatches = await getPlayerMatches(id);
  const currentSeasonStats = player.stats.find(s => s.seasonId === player.team.seasonId);
  const bpi = currentSeasonStats ? calculateBPI(currentSeasonStats) : 0;

  // Group events by type for statistics
  const eventStats = player.gameEvents.reduce((acc: any, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-semibold" asChild>
            <Link href="/players">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na hráče
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Player Info Sidebar - Enhanced */}
          <div className="md:w-1/3">
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white shadow-lg border border-gray-100 p-2">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-accent rounded-xl grid place-items-center">
                      <User className="h-10 w-10 text-white" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">{player.name}</CardTitle>
                <CardDescription className="space-y-2">
                  {player.nickname && (
                    <Badge className="bg-accent text-white font-bold">"{player.nickname}"</Badge>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Link href={`/team/${player.team.id}`} className="hover:underline">
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1 hover:bg-slate-100 transition-colors">
                        <div className="size-5">
                          <TeamLogo teamName={player.team.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{player.team.name}</span>
                      </div>
                    </Link>
                  </div>
                  {player.role === 'kapitán' ? (
                    <div className="mt-2 inline-flex items-center gap-2 bg-primary text-white px-3 py-1 rounded-full font-bold text-sm">
                      <Crown className="h-4 w-4" />
                      {player.role}
                    </div>
                  ) : (
                    <Badge variant="outline" className="mt-2 font-bold">
                      {player.role}
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* BPI and Performance */}
                <div className="space-y-6">
                  <div className="text-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4">
                    <div className="text-3xl font-black text-primary mb-2">{bpi.toFixed(1)}</div>
                    <div className="text-sm text-slate-600 font-semibold uppercase tracking-wide">BPI Index</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xl font-black text-accent">{currentSeasonStats?.singlesPlayed || 0}</div>
                      <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Odehráno</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xl font-black text-green-600">{currentSeasonStats?.singlesWon || 0}</div>
                      <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Vyhráno</div>
                    </div>
                  </div>

                  <div className="text-center bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1">Úspěšnost</div>
                    <div className="text-2xl font-black text-warning">
                      {currentSeasonStats?.singlesPlayed 
                        ? Math.round((currentSeasonStats.singlesWon / currentSeasonStats.singlesPlayed) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Enhanced */}
          <div className="md:w-2/3">
            <Tabs defaultValue="stats" className="space-y-6">
              <TabsList className="bg-slate-100 p-2 rounded-2xl w-full">
                <TabsTrigger value="stats" className="rounded-xl px-6 py-3 font-bold flex-1">Statistiky</TabsTrigger>
                <TabsTrigger value="matches" className="rounded-xl px-6 py-3 font-bold flex-1">Zápasy</TabsTrigger>
                <TabsTrigger value="performance" className="rounded-xl px-6 py-3 font-bold flex-1">Výkon</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Scoring Stats - Enhanced */}
                  <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Skóre statistiky
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {[
                          { label: '95+ hodů', value: currentSeasonStats?.S95 || 0, color: 'bg-blue-100 text-blue-800' },
                          { label: '133+ hodů', value: currentSeasonStats?.S133 || 0, color: 'bg-purple-100 text-purple-800' },
                          { label: '170+ hodů', value: currentSeasonStats?.S170 || 0, color: 'bg-pink-100 text-pink-800' }
                        ].map((stat) => (
                          <div key={stat.label} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="font-semibold text-slate-900">{stat.label}</span>
                            <Badge className={`text-lg font-bold ${stat.color}`}>
                              {stat.value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Checkout Stats - Enhanced */}
                  <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Checkout statistiky
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {[
                          { label: 'CO3 (3 šipky)', value: currentSeasonStats?.CO3 || 0, color: 'bg-green-100 text-green-800' },
                          { label: 'CO4 (4 šipky)', value: currentSeasonStats?.CO4 || 0, color: 'bg-yellow-100 text-yellow-800' },
                          { label: 'CO5 (5 šipek)', value: currentSeasonStats?.CO5 || 0, color: 'bg-orange-100 text-orange-800' },
                          { label: 'CO6 (6 šipek)', value: currentSeasonStats?.CO6 || 0, color: 'bg-red-100 text-red-800' }
                        ].map((stat) => (
                          <div key={stat.label} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="font-semibold text-slate-900">{stat.label}</span>
                            <Badge className={`text-lg font-bold ${stat.color}`}>
                              {stat.value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="matches" className="space-y-6">
                <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Historie zápasů
                    </CardTitle>
                    <CardDescription>
                      Zápasy týmu {player.team.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {playerMatches.length > 0 ? (
                        playerMatches.map((match: any) => {
                          const isHome = match.homeTeamId === player.teamId;
                          const opponent = isHome ? match.awayTeam : match.homeTeam;
                          
                          return (
                            <div key={match.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="size-8">
                                  <TeamLogo teamName={opponent.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-slate-900">
                                    {match.round}. kolo: {isHome ? 'vs' : '@'} {opponent.name}
                                  </div>
                                  <div className="text-sm text-slate-600 font-medium">
                                    {new Date(match.startTime).toLocaleDateString('cs-CZ')}
                                  </div>
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
                                    {match.endTime ? "Detail" : "Zadat"}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <div className="mx-auto mb-4 size-16 rounded-full bg-slate-100 grid place-items-center">
                            <Calendar className="size-8 text-slate-400" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Žádné zápasy</h3>
                          <p className="text-slate-600">
                            Žádné zápasy nenalezeny
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analýza výkonu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* BPI Breakdown - Enhanced */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4">BPI Rozklad ({bpi.toFixed(1)} bodů)</h4>
                      <div className="space-y-3">
                        {[
                          { 
                            label: 'Úspěšnost singlů (60%)', 
                            value: currentSeasonStats?.singlesPlayed 
                              ? (60 * (currentSeasonStats.singlesWon / currentSeasonStats.singlesPlayed)).toFixed(1)
                              : '0.0',
                            color: 'text-primary'
                          },
                          { 
                            label: '95+ hodů (20%)', 
                            value: (20 * Math.min(1, (currentSeasonStats?.S95 || 0) / 10)).toFixed(1),
                            color: 'text-blue-600'
                          },
                          { 
                            label: '133+ hodů (15%)', 
                            value: (15 * Math.min(1, (currentSeasonStats?.S133 || 0) / 5)).toFixed(1),
                            color: 'text-purple-600'
                          },
                          { 
                            label: '170+ hodů (15%)', 
                            value: (15 * Math.min(1, (currentSeasonStats?.S170 || 0) / 2)).toFixed(1),
                            color: 'text-pink-600'
                          },
                          { 
                            label: 'Checkouty (10%)', 
                            value: currentSeasonStats?.singlesPlayed 
                              ? (10 * (0.5 * (currentSeasonStats.CO3 || 0) + 0.35 * (currentSeasonStats.CO4 || 0) + 0.15 * (currentSeasonStats.CO5 || 0)) / Math.max(1, currentSeasonStats.singlesPlayed)).toFixed(1)
                              : '0.0',
                            color: 'text-orange-600'
                          }
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                            <span className={`text-sm font-bold ${item.color}`}>
                              {item.value} bodů
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Events - Enhanced */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4">Poslední eventy</h4>
                      <div className="space-y-3">
                        {player.gameEvents.slice(0, 10).map((event: any, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">
                                {event.game.match.round}. kolo
                              </div>
                              <div className="text-xs text-slate-600">
                                vs {event.game.match.homeTeamId === player.teamId 
                                  ? event.game.match.awayTeam.name 
                                  : event.game.match.homeTeam.name}
                              </div>
                            </div>
                            <Badge 
                              className={`font-bold text-xs ${
                                event.type.startsWith('S') ? 'bg-purple-100 text-purple-800' :
                                event.type.startsWith('CO') ? 'bg-orange-100 text-orange-800' :
                                'bg-primary/10 text-primary'
                              }`}
                            >
                              {event.type}
                            </Badge>
                          </div>
                        ))}
                        {player.gameEvents.length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            Zatím žádné eventy
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance Metrics - Enhanced */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4">Výkonové metriky</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                          <div className="text-lg font-black text-purple-600">{eventStats.S95 || 0}</div>
                          <div className="text-xs text-slate-600 font-semibold">Celkem 95+ hodů</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                          <div className="text-lg font-black text-orange-600">
                            {(eventStats.CO3 || 0) + (eventStats.CO4 || 0) + (eventStats.CO5 || 0) + (eventStats.CO6 || 0)}
                          </div>
                          <div className="text-xs text-slate-600 font-semibold">Celkem checkoutů</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}