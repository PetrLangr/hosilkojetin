import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Target, Trophy, Calendar, TrendingUp, Crown, MapPin } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { calculateBPI } from '@/lib/bpi';
import { TeamLogo } from '@/components/team-logo';

async function getTeamDetail(id: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            stats: true
          }
        },
        captain: true,
        homeMatches: {
          include: {
            awayTeam: true
          },
          orderBy: [
            { round: 'asc' },
            { startTime: 'asc' }
          ]
        },
        awayMatches: {
          include: {
            homeTeam: true
          },
          orderBy: [
            { round: 'asc' },
            { startTime: 'asc' }
          ]
        },
        season: true
      }
    });

    return team;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
}

function calculateTeamStats(team: any) {
  let played = 0;
  let won = 0;
  let lost = 0;
  let legsFor = 0;
  let legsAgainst = 0;

  // Process completed matches only
  const completedMatches = [
    ...team.homeMatches.filter((m: any) => m.endTime),
    ...team.awayMatches.filter((m: any) => m.endTime)
  ];

  // For now, since we don't have real results yet, return zeros
  // TODO: Calculate from actual match results when available

  return {
    played,
    won,
    lost,
    legsFor,
    legsAgainst,
    legDifference: legsFor - legsAgainst,
    winPercentage: played > 0 ? Math.round((won / played) * 100) : 0
  };
}

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const team = await getTeamDetail(id);

  if (!team) {
    notFound();
  }

  const teamStats = calculateTeamStats(team);
  const allMatches = [...team.homeMatches, ...team.awayMatches]
    .sort((a, b) => {
      // Sort by round first, then by startTime
      if (a.round !== b.round) return a.round - b.round;
      return new Date(a.startTime || '').getTime() - new Date(b.startTime || '').getTime();
    });

  // Calculate player BPIs
  const playersWithBPI = team.players.map((player: any) => {
    const stats = player.stats.find((s: any) => s.seasonId === team.seasonId);
    const bpi = stats ? calculateBPI(stats) : 0;
    
    return {
      ...player,
      bpi,
      stats: stats || {
        singlesPlayed: 0,
        singlesWon: 0,
        S95: 0,
        S133: 0,
        S170: 0,
        CO3: 0,
        CO4: 0,
        CO5: 0,
        CO6: 0
      }
    };
  }).sort((a, b) => b.bpi - a.bpi);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-semibold" asChild>
            <Link href="/teams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na týmy
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Team Info Sidebar - Enhanced */}
          <div className="md:w-1/3">
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white shadow-lg border border-gray-100 p-2">
                  <TeamLogo 
                    teamName={team.name}
                    className="w-full h-full object-contain rounded-xl"
                    showFallbackIcon={true}
                  />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">{team.name}</CardTitle>
                <CardDescription className="space-y-2">
                  <Badge className="bg-primary text-white font-bold">{team.shortName}</Badge>
                  {team.city && (
                    <div className="flex items-center justify-center gap-1 text-slate-600 mt-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{team.city}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-black text-primary">{team.players.length}</div>
                    <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Hráčů</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-black text-accent">{teamStats.played}</div>
                    <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Zápasů</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Výhry:</span>
                    <Badge className="bg-green-100 text-green-800 font-bold">{teamStats.won}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Prohry:</span>
                    <Badge className="bg-red-100 text-red-800 font-bold">{teamStats.lost}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Úspěšnost:</span>
                    <span className="text-sm font-bold text-primary">{teamStats.winPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Legy:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {teamStats.legsFor}:{teamStats.legsAgainst} ({teamStats.legDifference >= 0 ? '+' : ''}{teamStats.legDifference})
                    </span>
                  </div>
                </div>

                {team.captain && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Kapitán</div>
                        <div className="font-black text-slate-900">{team.captain.name}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Enhanced */}
          <div className="md:w-2/3">
            <Tabs defaultValue="roster" className="space-y-6">
              <TabsList className="bg-slate-100 p-2 rounded-2xl w-full">
                <TabsTrigger value="roster" className="rounded-xl px-6 py-3 font-bold flex-1">Soupiska</TabsTrigger>
                <TabsTrigger value="matches" className="rounded-xl px-6 py-3 font-bold flex-1">Zápasy</TabsTrigger>
              </TabsList>

              <TabsContent value="roster" className="space-y-6">
                <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Soupiska hráčů
                    </CardTitle>
                    <CardDescription>
                      Seřazeno podle BPI (nejlepší hráči)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Hráč</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-center">BPI</TableHead>
                          <TableHead className="text-center">Odehráno</TableHead>
                          <TableHead className="text-center">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {playersWithBPI.map((player, index) => (
                          <TableRow key={player.id} className="hover:bg-slate-50">
                            <TableCell>
                              <div className={`size-8 rounded-full grid place-items-center text-white font-bold text-xs ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                                index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                                'bg-gradient-to-br from-slate-400 to-slate-600'
                              }`}>
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link href={`/player/${player.id}`} className="hover:underline">
                                <div>
                                  <div className="font-bold text-primary hover:text-primary/80 flex items-center gap-2">
                                    {player.name}
                                    {player.role === 'kapitán' && <Crown className="h-4 w-4" />}
                                  </div>
                                  {player.nickname && (
                                    <div className="text-xs text-slate-500 font-medium">
                                      "{player.nickname}"
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={player.role === 'kapitán' ? 'default' : 'outline'}
                                className={player.role === 'kapitán' ? 'bg-primary text-white font-bold' : 'font-semibold'}
                              >
                                {player.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-primary/10 text-primary font-bold">{player.bpi.toFixed(1)}</Badge>
                            </TableCell>
                            <TableCell className="text-center font-semibold">{player.stats.singlesPlayed}</TableCell>
                            <TableCell className="text-center">
                              <span className="font-bold text-slate-900">
                                {player.stats.singlesPlayed > 0 
                                  ? Math.round((player.stats.singlesWon / player.stats.singlesPlayed) * 100)
                                  : 0}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="matches" className="space-y-6">
                <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Historie zápasů
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allMatches.length > 0 ? (
                        allMatches.map((match: any) => {
                          const isHome = match.homeTeamId === team.id;
                          const opponent = isHome ? match.awayTeam : match.homeTeam;
                          
                          return (
                            <div key={match.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-xl grid place-items-center text-xs font-bold ${
                                  isHome ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                                }`}>
                                  {isHome ? 'DOM' : 'HOST'}
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-slate-900">
                                    {isHome ? 'vs' : '@'} {opponent.name}
                                  </div>
                                  <div className="text-sm text-slate-600 font-medium">
                                    {match.round}. kolo • {new Date(match.startTime).toLocaleDateString('cs-CZ')}
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
                                    Detail
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
                            Pro tento tým zatím nejsou naplánovány žádné zápasy
                          </p>
                        </div>
                      )}
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