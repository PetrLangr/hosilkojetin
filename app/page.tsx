import { Calendar, Trophy, MessageSquare, Pin, ClipboardList, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamLogo } from "@/components/team-logo";
import { PWAQRCode } from "@/components/pwa-qr-code";
import { PartnersMarquee } from "@/components/partners-marquee";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateStandings, sortStandings, readResult } from "@/lib/standings";

// Homepage čte přihlášení (getServerSession → headers()) a živá data ze sezóny.
// Bez tohohle ji Next zkouší předgenerovat staticky: build hlásí DYNAMIC_SERVER_USAGE,
// try/catch kolem session to spolkne a na webu pak zůstane natrvalo verze z okamžiku
// buildu — odhlášená a se starými výsledky.
export const dynamic = 'force-dynamic';

async function getHomepageData() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const season = await prisma.season.findFirst({
      where: { isActive: true }
    });

    if (!season) {
      return {
        seasonName: null,
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
      take: 6
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
      take: 6
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
      take: 4 // Kompaktní seznam unese víc položek než dřívější mřížka karet
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
    const sortedStandings = sortStandings(standings, allMatches);
    const topTeams = sortedStandings.slice(0, 5);

    const result = {
      seasonName: season.name,
      stats: {
        teamsCount,
        playersCount,
        matchesProgress: `${completedMatches}/${totalMatches}`,
        roundsProgress: `0/${totalRounds}`
      },
      standings: topTeams,
      recentResults: recentResults.map(match => {
        const score = match.result ? readResult(match.result) : null;
        return {
          id: match.id,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          homeShort: match.homeTeam.shortName,
          awayShort: match.awayTeam.shortName,
          round: match.round,
          homeGames: score?.homeGamesWon ?? null,
          awayGames: score?.awayGamesWon ?? null,
          endTime: match.endTime,
        };
      }),
      upcomingMatches: upcomingMatches.map(match => ({
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeShort: match.homeTeam.shortName,
        awayShort: match.awayTeam.shortName,
        round: match.round,
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
      seasonName: null,
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
  } finally {
    await prisma.$disconnect();
  }
}

/** Rámeček sekce: titulek s odkazem na plný výpis, pod ním obsah. */
function Panel({
  title,
  icon,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted px-3 py-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          {icon}
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            {hrefLabel ?? 'Vše'}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

const EmptyRow = ({ children }: { children: React.ReactNode }) => (
  <p className="px-3 py-6 text-center text-xs text-muted-foreground">{children}</p>
);

const dayMonth = (d: Date | string) =>
  new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });

export default async function Homepage() {
  const data = await getHomepageData();

  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    // Ignore JWT session errors (invalid/expired tokens)
    console.error('Session error:', error);
  }

  const [playedMatches, allMatches] = data.stats.matchesProgress.split('/');
  // Na konci sezóny už žádné zápasy nezbývají — místo prázdného panelu
  // dostanou výsledky dvojnásobnou šířku a zobrazí se ve dvou sloupcích.
  const hasUpcoming = data.upcomingMatches.length > 0;

  return (
    <div className="space-y-5">
      {/* Hero — vizuální ukotvení ligy, ale jen pruh: obsah pod ním musí zůstat
          nad okrajem obrazovky, jinak si ho nikdo nevšimne */}
      <section className="relative overflow-hidden rounded-lg">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-dartboard.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30" />

        <div className="relative z-10 px-4 py-6 md:px-8 md:py-8">
          <Badge className="mb-2 bg-primary/90 px-2 py-0.5 text-[11px] font-semibold tracking-wide">
            SEZÓNA {data.seasonName ?? '—'}
          </Badge>

          <h1 className="text-2xl font-black leading-tight tracking-tight text-white md:text-3xl">
            HOSPODSKÁ <span className="text-primary">ŠIPKOVÁ</span> LIGA
          </h1>

          <p className="mt-1 max-w-xl text-sm text-slate-300">
            Výsledky, tabulka a statistiky hráčů — kolo po kole.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="h-8 rounded-md bg-primary font-semibold hover:bg-[#9F1239]">
              <Link href="/standings">
                <Trophy className="mr-1.5 h-3.5 w-3.5" />
                Tabulka
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="h-8 rounded-md border border-white/25 bg-white/10 font-semibold text-white hover:bg-white hover:text-slate-900">
              <Link href="/schedule">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                Rozpis kol
              </Link>
            </Button>
            {/* Zadání výsledku má smysl nabízet jen tomu, kdo na něj má práva */}
            {session && (
              <Button asChild size="sm" variant="secondary" className="h-8 rounded-md border border-white/25 bg-white/10 font-semibold text-white hover:bg-white hover:text-slate-900">
                <Link href="/schedule">
                  <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                  Zapsat výsledek
                </Link>
              </Button>
            )}

            <div className="tnum ml-auto flex items-center gap-4 text-xs text-slate-300">
              <span><strong className="text-white">{data.stats.teamsCount}</strong> týmů</span>
              <span><strong className="text-white">{data.stats.playersCount}</strong> hráčů</span>
              <span><strong className="text-white">{playedMatches}</strong>/{allMatches} zápasů</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vlevo dění v lize (výsledky, zápasy, novinky), vpravo úzký pruh
          s tabulkou a QR kódem */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
        <div className={hasUpcoming ? 'grid gap-4 sm:grid-cols-2' : undefined}>
        <Panel title="Poslední výsledky" icon={<Trophy className="h-4 w-4 text-warning" />} href="/schedule">
          {data.recentResults.length === 0 ? (
            <EmptyRow>Zatím nebyl odehrán žádný zápas.</EmptyRow>
          ) : (
            <ul className={`divide-border ${hasUpcoming ? 'divide-y' : 'divide-y sm:grid sm:grid-cols-2 sm:divide-y-0'}`}>
              {data.recentResults.map((m: any) => (
                <li key={m.id} className={hasUpcoming ? undefined : 'border-b border-border sm:odd:border-r'}>
                  <Link
                    href={`/match/${m.id}`}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-rose-50/50"
                  >
                    <span className="tnum w-8 shrink-0 text-[11px] text-muted-foreground">
                      {m.round ? `${m.round}. k.` : ''}
                    </span>
                    <span className={`flex-1 truncate text-xs ${m.homeGames > m.awayGames ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                      {m.homeTeam}
                    </span>
                    <span className="tnum shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-900">
                      {m.homeGames ?? '–'}:{m.awayGames ?? '–'}
                    </span>
                    <span className={`flex-1 truncate text-right text-xs ${m.awayGames > m.homeGames ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                      {m.awayTeam}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {hasUpcoming && (
        <Panel title="Nejbližší zápasy" icon={<Calendar className="h-4 w-4 text-primary" />} href="/schedule">
            <ul className="divide-y divide-border">
              {/* Detail nezadaného zápasu je jen pro kapitány, návštěvníka by odkaz
                  poslal na přihlášení — celý tenhle panel jsou zápasy před termínem. */}
              {data.upcomingMatches.map((m: any) => (
                <li key={m.id} className="flex items-center gap-2 px-3 py-2">
                  <span className="tnum w-10 shrink-0 text-[11px] text-muted-foreground">
                    {m.date ? dayMonth(m.date) : m.round ? `${m.round}. k.` : ''}
                  </span>
                  <span className="flex-1 truncate text-xs text-slate-700">{m.homeTeam}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">vs</span>
                  <span className="flex-1 truncate text-right text-xs text-slate-700">{m.awayTeam}</span>
                </li>
              ))}
            </ul>
        </Panel>
        )}
        </div>

        {/* Novinky vyplňují místo pod výsledky. V užším sloupci se vyplatí
            vodorovné položky s náhledem vlevo místo mřížky karet. */}
        <Panel title="Novinky" icon={<MessageSquare className="h-4 w-4 text-primary" />} href="/posts" hrefLabel="Všechny příspěvky">
          {data.posts.length === 0 ? (
            <EmptyRow>Zatím žádné příspěvky.</EmptyRow>
          ) : (
            <ul className="divide-y divide-border">
              {data.posts.map((post: any) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}`}
                    className="group flex gap-3 p-3 hover:bg-rose-50/50"
                  >
                    {/* Náhled jen když ho příspěvek opravdu má — dekorativní výplň
                        z hero fotky jen předstírala, že je ke článku obrázek */}
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="size-14 shrink-0 rounded object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={`px-1.5 py-0 text-[10px] font-semibold ${
                            post.type === 'announcement'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-accent/10 text-accent'
                          }`}
                        >
                          {post.type === 'announcement' ? 'OZNÁMENÍ' : 'NOVINKA'}
                        </Badge>
                        {post.pinned && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 px-1.5 py-0 text-[10px] font-semibold text-amber-800">
                            <Pin className="h-2.5 w-2.5" />
                            PŘIPNUTO
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {post.authorName} · {new Date(post.createdAt).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-primary">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Tabulka" icon={<Trophy className="h-4 w-4 text-warning" />} href="/standings" hrefLabel="Celá tabulka">
            {data.standings.length === 0 ? (
              <EmptyRow>Zatím žádné výsledky.</EmptyRow>
            ) : (
              <ul className="divide-y divide-border">
                {data.standings.map((team: any, index: number) => (
                  <li key={team.teamId} className="flex items-center gap-2 px-3 py-2">
                    <span className="tnum w-4 shrink-0 text-xs font-semibold text-slate-500">
                      {index + 1}
                    </span>
                    <span className="size-5 shrink-0 overflow-hidden rounded border border-border bg-white">
                      <TeamLogo
                        teamName={team.teamName}
                        className="h-full w-full object-contain"
                        fallbackText={team.shortName}
                      />
                    </span>
                    <span className="flex-1 truncate text-xs font-medium text-slate-900">
                      {team.teamName}
                    </span>
                    <span className="tnum shrink-0 text-sm font-bold text-slate-900">
                      {team.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <PWAQRCode />
        </div>
      </div>

      <PartnersMarquee />
    </div>
  );
}
