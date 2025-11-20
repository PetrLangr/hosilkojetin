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

  // Process home matches
  team.homeMatches.forEach((match: any) => {
    if (match.endTime && match.result) {
      played++;
      const homeWins = match.result.homeWins ?? match.result.homeScore ?? 0;
      const awayWins = match.result.awayWins ?? match.result.awayScore ?? 0;
      const homeLegs = match.result.homeLegs ?? 0;
      const awayLegs = match.result.awayLegs ?? 0;

      if (homeWins > awayWins) won++;
      else if (homeWins < awayWins) lost++;

      legsFor += homeLegs;
      legsAgainst += awayLegs;
    }
  });

  // Process away matches
  team.awayMatches.forEach((match: any) => {
    if (match.endTime && match.result) {
      played++;
      const homeWins = match.result.homeWins ?? match.result.homeScore ?? 0;
      const awayWins = match.result.awayWins ?? match.result.awayScore ?? 0;
      const homeLegs = match.result.homeLegs ?? 0;
      const awayLegs = match.result.awayLegs ?? 0;

      if (awayWins > homeWins) won++;
      else if (awayWins < homeWins) lost++;

      legsFor += awayLegs;
      legsAgainst += homeLegs;
    }
  });

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
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" className="rounded-lg md:rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-semibold text-xs md:text-sm" asChild>
          <Link href="/teams">
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            Zpět
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
        {/* Team Info Sidebar - Enhanced */}
        <div className="md:w-1/3">
          <Card className="rounded-xl md:rounded-2xl bg-white border border-gray-100 card-shadow">
            <CardHeader className="text-center p-4 md:p-6">
              <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-white shadow-lg border border-gray-100 p-1.5 md:p-2">
                <TeamLogo
                  teamName={team.name}
                  className="w-full h-full object-contain rounded-lg md:rounded-xl"
                  showFallbackIcon={true}
                />
              </div>
              <CardTitle className="text-lg md:text-2xl font-black text-slate-900">{team.name}</CardTitle>
              <CardDescription className="space-y-2">
                <Badge className="bg-primary text-white font-bold text-xs">{team.shortName}</Badge>
                {team.city && (
                  <div className="flex items-center justify-center gap-1 text-slate-600 mt-2">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="font-medium text-xs md:text-sm">{team.city}</span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-center mb-4 md:mb-6">
                <div className="bg-slate-50 rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="text-xl md:text-2xl font-black text-primary">{team.players.length}</div>
                  <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Hráčů</div>
                </div>
                <div className="bg-slate-50 rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="text-xl md:text-2xl font-black text-accent">{teamStats.played}</div>
                  <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Zápasů</div>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-semibold text-slate-700">Výhry:</span>
                  <Badge className="bg-green-100 text-green-800 font-bold text-xs">{teamStats.won}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-semibold text-slate-700">Prohry:</span>
                  <Badge className="bg-red-100 text-red-800 font-bold text-xs">{teamStats.lost}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-semibold text-slate-700">Úspěšnost:</span>
                  <span className="text-xs md:text-sm font-bold text-primary">{teamStats.winPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-semibold text-slate-700">Legy:</span>
                  <span className="text-xs md:text-sm font-bold text-slate-900">
                    {teamStats.legsFor}:{teamStats.legsAgainst} ({teamStats.legDifference >= 0 ? '+' : ''}{teamStats.legDifference})
                  </span>
                </div>
              </div>

              {team.captain && (
                <div className="pt-3 md:pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg md:rounded-xl">
                    <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shrink-0">
                      <Crown className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Kapitán</div>
                      <div className="font-black text-slate-900 text-sm md:text-base truncate">{team.captain.name}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Enhanced */}
        <div className="md:w-2/3">
          <Tabs defaultValue="roster" className="space-y-4 md:space-y-6">
            <TabsList className="bg-slate-100 p-1.5 md:p-2 rounded-xl md:rounded-2xl w-full">
              <TabsTrigger value="roster" className="rounded-lg md:rounded-xl px-4 md:px-6 py-2 md:py-3 font-bold flex-1 text-sm md:text-base">Soupiska</TabsTrigger>
              <TabsTrigger value="matches" className="rounded-lg md:rounded-xl px-4 md:px-6 py-2 md:py-3 font-bold flex-1 text-sm md:text-base">Zápasy</TabsTrigger>
            </TabsList>

              <TabsContent value="roster" className="space-y-6">
                <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Users className="h-4 w-4 md:h-5 md:w-5" />
                      Soupiska hráčů
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-6 md:pt-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-8 md:w-12 px-2 md:px-4 text-xs md:text-sm">#</TableHead>
                            <TableHead className="px-2 md:px-4 text-xs md:text-sm">Hráč</TableHead>
                            <TableHead className="px-2 md:px-4 text-xs md:text-sm">Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {playersWithBPI.map((player, index) => (
                            <TableRow key={player.id} className="hover:bg-slate-50">
                              <TableCell className="px-2 md:px-4 py-2 md:py-4">
                                <div className={`size-6 md:size-8 rounded-full grid place-items-center text-white font-bold text-xs ${
                                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                                  'bg-gradient-to-br from-slate-400 to-slate-600'
                                }`}>
                                  {index + 1}
                                </div>
                              </TableCell>
                              <TableCell className="px-2 md:px-4 py-2 md:py-4">
                                <Link href={`/player/${player.id}`} className="hover:underline">
                                  <div>
                                    <div className="font-bold text-primary hover:text-primary/80 flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                                      <span className="truncate max-w-[120px] md:max-w-none">{player.name}</span>
                                      {player.role === 'kapitán' && <Crown className="h-3 w-3 md:h-4 md:w-4 shrink-0" />}
                                    </div>
                                    {player.nickname && (
                                      <div className="text-xs text-slate-500 font-medium hidden md:block">
                                        "{player.nickname}"
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              </TableCell>
                              <TableCell className="px-2 md:px-4 py-2 md:py-4">
                                <Badge
                                  variant={player.role === 'kapitán' ? 'default' : 'outline'}
                                  className={`text-xs ${player.role === 'kapitán' ? 'bg-primary text-white font-bold' : 'font-semibold'}`}
                                >
                                  {player.role}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="matches" className="space-y-6">
                <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                      Historie zápasů
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="space-y-3 md:space-y-4">
                      {allMatches.length > 0 ? (
                        allMatches.map((match: any) => {
                          const isHome = match.homeTeamId === team.id;
                          const opponent = isHome ? match.awayTeam : match.homeTeam;
                          const hasResult = match.endTime && match.result;

                          // Get score - handle both field name variants
                          let teamScore = 0;
                          let opponentScore = 0;
                          if (hasResult) {
                            const homeWins = match.result.homeWins ?? match.result.homeScore ?? 0;
                            const awayWins = match.result.awayWins ?? match.result.awayScore ?? 0;
                            teamScore = isHome ? homeWins : awayWins;
                            opponentScore = isHome ? awayWins : homeWins;
                          }

                          return (
                            <div key={match.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-gray-100 rounded-xl hover:bg-slate-50 transition-colors gap-3">
                              <div className="flex items-center gap-3 md:gap-4">
                                {/* Opponent Logo */}
                                <div className="size-10 md:size-12 rounded-lg md:rounded-xl bg-white shadow-sm border border-slate-200 p-1 overflow-hidden shrink-0">
                                  <TeamLogo
                                    teamName={opponent.name}
                                    className="w-full h-full object-contain"
                                    showFallbackIcon={true}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge className={`text-xs px-2 py-0.5 ${
                                      isHome ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                                    }`}>
                                      {isHome ? 'D' : 'V'}
                                    </Badge>
                                    <span className="font-bold text-slate-900 text-sm md:text-base truncate">
                                      {opponent.name}
                                    </span>
                                  </div>
                                  <div className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
                                    {match.round}. kolo • {new Date(match.startTime).toLocaleDateString('cs-CZ')}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-3">
                                {hasResult ? (
                                  <div className={`font-black text-lg md:text-xl px-3 py-1 rounded-lg ${
                                    teamScore > opponentScore
                                      ? 'bg-green-100 text-green-700'
                                      : teamScore < opponentScore
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {teamScore}:{opponentScore}
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="bg-gray-50 text-gray-600 font-semibold text-xs">
                                    TBD
                                  </Badge>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg md:rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-semibold text-xs md:text-sm px-2 md:px-3"
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
                        <div className="text-center py-8 md:py-12">
                          <div className="mx-auto mb-4 size-12 md:size-16 rounded-full bg-slate-100 grid place-items-center">
                            <Calendar className="size-6 md:size-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Žádné zápasy</h3>
                          <p className="text-sm md:text-base text-slate-600">
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
  );
}