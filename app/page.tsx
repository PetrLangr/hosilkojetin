import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Users, Calendar, Trophy, MessageSquare, Pin, TrendingUp, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamLogo } from "@/components/team-logo";
import { PWAQRCode } from "@/components/pwa-qr-code";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateStandings, sortStandings } from "@/lib/standings";

async function getHomepageData() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    console.log('Getting homepage data...');
    
    const season = await prisma.season.findFirst({
      where: { isActive: true }
    });

    if (!season) {
      return {
        stats: {
          teamsCount: 0,
          playersCount: 0,
          matchesProgress: '0/0',
          roundsProgress: '0/0'
        },
        standings: [],
        recentResults: [],
        upcomingMatches: [],
        posts: []
      };
    }

    // Get counts - simplified to avoid JSON field issues
    const [teamsCount, playersCount, totalMatches] = await Promise.all([
      prisma.team.count({ where: { seasonId: season.id } }),
      prisma.player.count({ 
        where: { team: { seasonId: season.id } }
      }),
      prisma.match.count({ where: { seasonId: season.id } })
    ]);

    // Get completed matches count by checking endTime instead
    const completedMatches = await prisma.match.count({
      where: {
        seasonId: season.id,
        endTime: { not: null }
      }
    });

    // Get unique rounds to calculate progress
    const rounds = await prisma.match.findMany({
      where: { seasonId: season.id },
      select: { round: true },
      distinct: ['round']
    });

    const totalRounds = rounds.length;

    // Get recent results (completed matches) - use endTime instead of result
    const recentResults = await prisma.match.findMany({
      where: {
        seasonId: season.id,
        endTime: { not: null }
      },
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: { endTime: 'desc' },
      take: 5
    });

    // Get upcoming matches - use endTime instead of result
    const upcomingMatches = await prisma.match.findMany({
      where: {
        seasonId: season.id,
        endTime: null
      },
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: { startTime: 'asc' },
      take: 5
    });

    // Get recent posts from database
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          include: {
            player: {
              include: {
                team: true
              }
            }
          }
        }
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 4 // Limit to 4 posts for homepage
    });

    // Get standings for Top 5 teams
    const teams = await prisma.team.findMany({
      where: { seasonId: season.id }
    });

    const allMatches = await prisma.match.findMany({
      where: { seasonId: season.id },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });

    const standings = calculateStandings(teams, allMatches);
    const sortedStandings = sortStandings(standings);
    const topTeams = sortedStandings.slice(0, 5);

    const result = {
      stats: {
        teamsCount,
        playersCount,
        matchesProgress: `${completedMatches}/${totalMatches}`,
        roundsProgress: `0/${totalRounds}`
      },
      standings: topTeams,
      recentResults: recentResults.map(match => ({
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        result: match.result || 'TBD'
      })),
      upcomingMatches: upcomingMatches.map(match => ({
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        date: match.startTime
      })),
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        imageUrl: post.imageUrl,
        authorName: post.author.name || 'Unknown Author',
        authorRole: post.author.role,
        authorTeam: post.author.player?.team?.name || null,
        type: post.type,
        pinned: post.pinned,
        createdAt: post.createdAt
      }))
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      stats: {
        teamsCount: 12,
        playersCount: 86,
        matchesProgress: '0/66',
        roundsProgress: '0/11'
      },
      standings: [],
      recentResults: [],
      upcomingMatches: [],
      posts: []
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default async function Homepage() {
  const data = await getHomepageData();

  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    // Ignore JWT session errors (invalid/expired tokens)
    console.error('Session error:', error);
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative min-h-[450px] md:min-h-[600px] lg:min-h-[700px] overflow-hidden rounded-2xl md:rounded-3xl">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-dartboard.webp')"
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center min-h-[450px] md:min-h-[600px] lg:min-h-[700px] py-8 md:py-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="mb-6">
                <Badge className="bg-primary/90 text-white px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                  SEZÓNA 2025/2026
                </Badge>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 md:mb-6 leading-[1.1] tracking-tight">
                HOSPODSKÁ
                <br />
                <span className="text-primary">ŠIPKOVÁ</span>
                <br />
                LIGA
              </h1>

              <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-6 md:mb-8 max-w-2xl font-medium">
                Sledujte výsledky, statistiky hráčů a nejnovější zprávy z naší ligy.
                Přidejte se k tradici hospodského šipkování.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold px-8 py-4 text-lg">
                  <Link href="/standings">
                    <Trophy className="h-5 w-5 mr-2" />
                    Zobrazit tabulku
                  </Link>
                </Button>
                
                <Button asChild variant="secondary" size="lg" className="rounded-xl border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-900 font-bold px-8 py-4 text-lg backdrop-blur-md transition-all">
                  <Link href="/teams">
                    <Users className="h-5 w-5 mr-2" />
                    Prozkoumat týmy
                  </Link>
                </Button>
              </div>
              
              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-3 sm:gap-8 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 md:mb-2">
                    {data.stats.teamsCount}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-300 uppercase tracking-wider font-semibold">
                    Týmů
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 md:mb-2">
                    {data.stats.playersCount}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-300 uppercase tracking-wider font-semibold">
                    Hráčů
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 md:mb-2">
                    {data.stats.matchesProgress.split('/')[1]}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-300 uppercase tracking-wider font-semibold">
                    Zápasů
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
      </section>


      {/* Main Content */}
      <div className="space-y-12">
        {/* News & Posts */}
        <div className="space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-1 md:mb-2">NOVINKY</h2>
              <p className="text-slate-600 font-medium text-sm md:text-base">Nejnovější zprávy z ligy</p>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white w-fit">
              <Link href="/posts">
                <MessageSquare className="h-4 w-4 mr-2" />
                Všechny příspěvky
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {data.posts && data.posts.length > 0 ? (
              data.posts.map((post: any, index: number) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="block">
                  <article className={`group relative overflow-hidden rounded-xl md:rounded-2xl bg-white border border-gray-100 card-shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${post.pinned ? 'ring-2 ring-primary/20 bg-gradient-to-br from-rose-50/50 to-white' : ''}`}>
                  {/* Image */}
                  <div className="relative h-40 md:h-48 overflow-hidden">
                    <img 
                      src={post.imageUrl || (index === 0 ? '/hero-dartboard.webp' : '/mobile-app.webp')}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Pinned indicator */}
                    {post.pinned && (
                      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                        <Pin className="h-3 w-3" />
                        PŘIPNUTO
                      </div>
                    )}
                    
                    {/* Type badge on image */}
                    <div className="absolute bottom-4 left-4">
                      <Badge 
                        className={`font-bold backdrop-blur-sm ${post.type === 'announcement' ? 'bg-primary/90 text-white' : 'bg-accent/90 text-white'}`}
                      >
                        {post.type === 'announcement' ? 'OZNÁMENÍ' : 'NOVINKA'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 group-hover:text-primary transition-colors mb-2 md:mb-3 leading-tight">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 leading-relaxed mb-3 md:mb-4 text-sm md:text-base line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Author and Date */}
                    <div className="flex items-center gap-3 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-border">
                      <div className="size-7 md:size-8 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-xs">
                        {post.authorName.charAt(0)}
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-slate-900">{post.authorName}</div>
                        <div className="text-muted-foreground text-xs md:text-sm">
                          {new Date(post.createdAt).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Read more button */}
                    <div className="w-full rounded-xl bg-primary text-white py-2.5 md:py-3 px-4 text-center font-semibold text-sm md:text-base transition-all hover:bg-[#9F1239] flex items-center justify-center gap-2">
                      Číst více
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                </article>
                </Link>
              ))
            ) : (
              <Card className="rounded-2xl bg-white card-shadow">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto mb-6 size-16 rounded-full bg-muted grid place-items-center">
                    <MessageSquare className="size-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Zatím žádné příspěvky</h3>
                  <p className="text-slate-600">
                    Kapitáni a administrátoři můžou přidávat oznámení o turnajích a novinkách
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Top Players & Standings Section */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Top Players */}
          <div className="lg:col-span-2">
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-1 md:mb-2">TOP HRÁČI</h2>
              <p className="text-slate-600 font-medium text-sm md:text-base">Nejlepší výkony sezóny</p>
            </div>

            {!session ? (
              // Under construction for non-logged-in users
              <Card className="rounded-xl md:rounded-2xl bg-white border border-gray-100 card-shadow">
                <CardContent className="py-10 md:py-16 px-4 md:px-8 text-center">
                  <div className="size-16 md:size-24 mx-auto mb-4 md:mb-6 rounded-full border-4 md:border-8 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 grid place-items-center">
                    <Construction className="h-8 w-8 md:h-12 md:w-12 text-amber-600" />
                  </div>

                  <Badge className="bg-amber-600 text-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold mb-3 md:mb-4">
                    VE VÝVOJI
                  </Badge>

                  <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 md:mb-3">
                    DETAILNÍ STATISTIKY HRÁČŮ
                  </h3>

                  <p className="text-slate-600 mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base">
                    Připravujeme komplexní žebříček hráčů s detailními statistikami výkonnosti.
                  </p>

                  <div className="bg-slate-50 rounded-xl p-3 md:p-4 max-w-md mx-auto mb-4 md:mb-6">
                    <p className="text-xs md:text-sm text-slate-600 mb-2"><strong>Co můžete očekávat:</strong></p>
                    <ul className="text-xs md:text-sm text-slate-600 space-y-1 text-left">
                      <li>• HSL Index - žebříček hráčů</li>
                      <li>• Vysoké náhozy (95+, 133+, 170+)</li>
                      <li>• Rychlá zavření (CO3-6)</li>
                      <li>• Historie výsledků</li>
                    </ul>
                  </div>

                  <Button asChild className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold text-sm md:text-base">
                    <Link href="/teams">
                      <Target className="h-4 w-4 mr-2" />
                      Zobrazit týmy
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Full stats for logged-in users
              <Card className="rounded-xl md:rounded-2xl bg-white border border-gray-100 card-shadow">
                <CardContent className="p-3 md:p-6">
                  <Tabs defaultValue="matches" className="space-y-4 md:space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
                      <TabsTrigger value="matches" className="rounded-lg font-semibold text-xs md:text-sm">Zápasy</TabsTrigger>
                      <TabsTrigger value="legs" className="rounded-lg font-semibold text-xs md:text-sm">Legy</TabsTrigger>
                      <TabsTrigger value="throws" className="rounded-lg font-semibold text-xs md:text-sm">Náhozy</TabsTrigger>
                      <TabsTrigger value="checkouts" className="rounded-lg font-semibold text-xs md:text-sm">Zavření</TabsTrigger>
                    </TabsList>

                  <TabsContent value="matches" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: "Langr Petr", team: "DC Stop Chropyně", played: 0, won: 0, percentage: 0 },
                        { name: "Dohnal Michal", team: "Rychlí šneci Vlkoš", played: 0, won: 0, percentage: 0 },
                        { name: "Vítík Adam", team: "ŠK Pivní psi Chropyně", played: 0, won: 0, percentage: 0 }
                      ].map((player, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4 hover:shadow-lg transition-all hover:-translate-y-0.5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="size-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-black text-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-lg text-slate-900">{player.name}</div>
                              <div className="text-sm text-muted-foreground">{player.team}</div>
                            </div>
                          </div>
                          <div className="text-center mb-2">
                            <div className="text-2xl md:text-3xl font-black text-primary mb-1">{player.percentage}%</div>
                            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Úspěšnost</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-center mb-3">
                            <div>
                              <div className="font-bold text-slate-700">{player.played}</div>
                              <div className="text-xs text-muted-foreground">Odehráno</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-700">{player.won}</div>
                              <div className="text-xs text-muted-foreground">Vyhráno</div>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3 rounded-xl bg-primary hover:bg-[#9F1239] text-white font-semibold">
                            Zobrazit profil
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="legs" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: "Kroupa Radek", team: "DC Stop Chropyně", played: 0, won: 0, percentage: 0 },
                        { name: "Miklik Miroslav", team: "Bochořský koblihy", played: 0, won: 0, percentage: 0 },
                        { name: "Ošťádal Michal", team: "Cech křivé šipky", played: 0, won: 0, percentage: 0 }
                      ].map((player, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4 hover:shadow-lg transition-all hover:-translate-y-0.5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="size-12 rounded-full bg-gradient-to-br from-accent to-primary grid place-items-center text-white font-black text-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-lg text-slate-900">{player.name}</div>
                              <div className="text-sm text-muted-foreground">{player.team}</div>
                            </div>
                          </div>
                          <div className="text-center mb-2">
                            <div className="text-2xl md:text-3xl font-black text-accent mb-1">{player.percentage}%</div>
                            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Úspěšnost legů</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-center mb-3">
                            <div>
                              <div className="font-bold text-slate-700">{player.played}</div>
                              <div className="text-xs text-muted-foreground">Odehráno</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-700">{player.won}</div>
                              <div className="text-xs text-muted-foreground">Vyhráno</div>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3 rounded-xl bg-primary hover:bg-[#9F1239] text-white font-semibold">
                            Zobrazit profil
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="throws" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: "Ferenc Michal", team: "DC Stop Chropyně", s95: 0, s133: 0, s170: 0, best: "170+" },
                        { name: "Prokeš Jaroslav", team: "Rychlí šneci Vlkoš", s95: 0, s133: 0, s170: 0, best: "133+" },
                        { name: "Bosák Michal", team: "ŠK Pivní psi Chropyně", s95: 0, s133: 0, s170: 0, best: "95+" }
                      ].map((player, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4 hover:shadow-lg transition-all hover:-translate-y-0.5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="size-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 grid place-items-center text-white font-black text-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-lg text-slate-900">{player.name}</div>
                              <div className="text-sm text-muted-foreground">{player.team}</div>
                            </div>
                          </div>
                          <div className="text-center mb-2">
                            <div className="text-2xl md:text-3xl font-black text-purple-600 mb-1">{player.s170}</div>
                            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Nejlepší nához</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center mb-3">
                            <div>
                              <div className="font-bold text-slate-700 text-sm">{player.s95}</div>
                              <div className="text-xs text-muted-foreground">95+</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-700 text-sm">{player.s133}</div>
                              <div className="text-xs text-muted-foreground">133+</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-700 text-sm">{player.s170}</div>
                              <div className="text-xs text-muted-foreground">170+</div>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3 rounded-xl bg-primary hover:bg-[#9F1239] text-white font-semibold">
                            Zobrazit profil
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="checkouts" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: "Topič Jakub", team: "DC Stop Chropyně", co3: 0, co4: 0, co5: 0, co6: 0, total: 0 },
                        { name: "Zatloukal Pavel", team: "Bochořský koblihy", co3: 0, co4: 0, co5: 0, co6: 0, total: 0 },
                        { name: "Kučera Patrik", team: "Hospoda Kanada", co3: 0, co4: 0, co5: 0, co6: 0, total: 0 }
                      ].map((player, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4 hover:shadow-lg transition-all hover:-translate-y-0.5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="size-12 rounded-full bg-gradient-to-br from-warning to-primary grid place-items-center text-white font-black text-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-lg text-slate-900">{player.name}</div>
                              <div className="text-sm text-muted-foreground">{player.team}</div>
                            </div>
                          </div>
                          <div className="text-center mb-2">
                            <div className="text-2xl md:text-3xl font-black text-warning mb-1">{player.total}</div>
                            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Celkem zavření</div>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-center mb-3">
                            <div>
                              <div className="font-bold text-slate-700 text-sm">{player.co3}</div>
                              <div className="text-xs text-muted-foreground">3. kolo</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-700 text-sm">{player.co4}</div>
                              <div className="text-xs text-muted-foreground">4. kolo</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-700 text-sm">{player.co5}</div>
                              <div className="text-xs text-muted-foreground">5. kolo</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-700 text-sm">{player.co6}</div>
                              <div className="text-xs text-muted-foreground">6. kolo</div>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3 rounded-xl bg-primary hover:bg-[#9F1239] text-white font-semibold">
                            Zobrazit profil
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Mini Standings */}
          <div>
            <div className="mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-1 md:mb-2">TABULKA</h3>
              <p className="text-slate-600 font-medium text-sm md:text-base">Aktuální pořadí</p>
            </div>

            <Card className="rounded-xl md:rounded-2xl bg-white border border-gray-100 card-shadow">
              <CardHeader className="pb-2 md:pb-3 px-3 md:px-6">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-warning" />
                  Top 5 týmů
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3 px-3 md:px-6">
                {data.standings && data.standings.length > 0 ? (
                  data.standings.map((team: any, index: number) => (
                    <div key={team.teamId} className="flex items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl border border-gray-50 hover:bg-rose-50/60 hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <div className={`size-6 md:size-8 rounded-full grid place-items-center font-black text-xs shrink-0 ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                          'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="size-6 md:size-8 rounded-lg bg-white shadow-sm border border-slate-200 p-0.5 md:p-1 shrink-0">
                          <TeamLogo
                            teamName={team.teamName}
                            className="w-full h-full object-contain rounded"
                            fallbackText={team.shortName}
                          />
                        </div>
                        <div className="text-xs md:text-sm font-semibold text-slate-900 truncate">
                          {team.teamName}
                        </div>
                      </div>
                      <Badge className="bg-primary text-white font-bold text-xs md:text-sm shrink-0 ml-2">
                        {team.points}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">
                    Zatím žádné výsledky
                  </div>
                )}

                <Button asChild className="w-full mt-3 md:mt-4 rounded-xl bg-primary hover:bg-[#9F1239] text-white font-semibold text-sm md:text-base">
                  <Link href="/standings">
                    <Trophy className="h-4 w-4 mr-2" />
                    Celá tabulka
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* PWA QR Code */}
            <div className="mt-4 md:mt-6">
              <PWAQRCode />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
