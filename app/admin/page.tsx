import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ChevronRight, Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

// Čte session i živá data — nesmí se předgenerovat při buildu.
export const dynamic = 'force-dynamic';

const dateShort = (d: Date | null) =>
  d ? d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) : '—';

const dateTime = (d: Date | null) =>
  d
    ? d.toLocaleString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'termín neurčen';

async function getAdminData() {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  const now = new Date();
  const teams = { homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } };

  const [teamsCount, playersCount, totalMatches, playedMatches, pending, overdue, upcoming, posts, postCounts] =
    await Promise.all([
      season ? prisma.team.count({ where: { seasonId: season.id } }) : 0,
      season ? prisma.player.count({ where: { team: { seasonId: season.id } } }) : 0,
      season ? prisma.match.count({ where: { seasonId: season.id } }) : 0,
      // Odehraný = má endTime; stejné pravidlo jako titulní stránka a /api/dashboard.
      season ? prisma.match.count({ where: { seasonId: season.id, endTime: { not: null } } }) : 0,
      season
        ? prisma.match.findMany({
            where: { seasonId: season.id, status: 'pending_approval' },
            include: teams,
            orderBy: { startTime: 'asc' },
          })
        : [],
      // Termín minul a výsledek nikdo nezapsal — to je hlavní důvod, proč sem admin chodí.
      season
        ? prisma.match.findMany({
            where: { seasonId: season.id, endTime: null, startTime: { lt: now }, status: { not: 'pending_approval' } },
            include: teams,
            orderBy: { startTime: 'asc' },
          })
        : [],
      season
        ? prisma.match.findMany({
            where: { seasonId: season.id, endTime: null, startTime: { gte: now } },
            include: teams,
            orderBy: { startTime: 'asc' },
            take: 6,
          })
        : [],
      prisma.post.findMany({
        select: { id: true, title: true, published: true, pinned: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.post.groupBy({ by: ['published'], _count: true }),
    ]);

  const publishedPosts = postCounts.find((p) => p.published)?._count ?? 0;
  const draftPosts = postCounts.find((p) => !p.published)?._count ?? 0;

  return {
    season, teamsCount, playersCount, totalMatches, playedMatches,
    pending, overdue, upcoming, posts, publishedPosts, draftPosts,
  };
}

type MatchRow = Awaited<ReturnType<typeof getAdminData>>['upcoming'][number];

function Panel({ title, meta, action, children }: {
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex h-10 items-center justify-between gap-2 border-b border-border bg-muted px-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {meta && <span className="text-xs text-muted-foreground tnum">{meta}</span>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="px-3 py-6 text-center text-xs text-muted-foreground">{children}</p>
);

function MatchList({ matches, when }: { matches: MatchRow[]; when: (m: MatchRow) => string }) {
  return (
    <ul className="divide-y divide-border">
      {matches.map((m) => (
        <li key={m.id}>
          <Link
            href={`/match/${m.id}`}
            className="group flex h-row items-center gap-3 px-3 text-sm hover:bg-muted"
          >
            <span className="w-8 shrink-0 text-xs text-muted-foreground tnum">
              {m.round ? `${m.round}.` : ''}
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium text-slate-900">{m.homeTeam.name}</span>
              <span className="mx-1.5 text-muted-foreground">–</span>
              <span className="font-medium text-slate-900">{m.awayTeam.name}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tnum">{when(m)}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value, sub, href }: { label: string; value: React.ReactNode; sub?: string; href: string }) {
  return (
    <Link href={href} className="block bg-white px-4 py-3 hover:bg-muted">
      <div className="label-muted">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-slate-900 tnum">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/');

  const d = await getAdminData();
  const progress = d.totalMatches ? Math.round((d.playedMatches / d.totalMatches) * 100) : 0;
  const attention = d.overdue.length + d.pending.length;

  return (
    <div className="space-y-4">
      {/* Souhrn sezóny — jeden pruh, každé číslo vede tam, kde se s ním pracuje */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        <Stat
          label="Zápasy"
          value={`${d.playedMatches}/${d.totalMatches}`}
          sub={d.totalMatches ? `${progress} %` : undefined}
          href="/admin/matches"
        />
        <Stat label="Týmy" value={d.teamsCount} href="/admin/teams" />
        <Stat label="Hráči" value={d.playersCount} href="/admin/players" />
        <Stat
          label="Příspěvky"
          value={d.publishedPosts}
          sub={d.draftPosts ? `+ ${d.draftPosts} ${d.draftPosts === 1 ? 'koncept' : d.draftPosts < 5 ? 'koncepty' : 'konceptů'}` : undefined}
          href="/posts"
        />
      </div>

      {!d.season && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <strong>Žádná sezóna není aktivní.</strong> Zápasy, týmy a hráči se počítají jen pro aktivní sezónu.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Čeká na vyřízení"
          meta={d.season ? `${attention}` : undefined}
          action={
            <Link href="/admin/matches" className="text-xs font-medium text-primary hover:underline">
              Všechny zápasy
            </Link>
          }
        >
          {attention === 0 ? (
            <Empty>Všechny odehrané zápasy mají zapsaný výsledek.</Empty>
          ) : (
            <>
              {d.pending.length > 0 && (
                <>
                  <div className="border-b border-border bg-amber-50/60 px-3 py-1.5 label-muted !text-amber-800">
                    Ke schválení · {d.pending.length}
                  </div>
                  <MatchList matches={d.pending} when={(m) => dateShort(m.startTime)} />
                </>
              )}
              {d.overdue.length > 0 && (
                <>
                  <div className={`border-b border-border bg-red-50/60 px-3 py-1.5 label-muted !text-red-800 ${d.pending.length ? 'border-t' : ''}`}>
                    Chybí výsledek · {d.overdue.length}
                  </div>
                  <MatchList matches={d.overdue} when={(m) => dateShort(m.startTime)} />
                </>
              )}
            </>
          )}
        </Panel>

        <Panel title="Nejbližší zápasy">
          {d.upcoming.length === 0 ? (
            <Empty>Žádné naplánované zápasy.</Empty>
          ) : (
            <MatchList matches={d.upcoming} when={(m) => dateTime(m.startTime)} />
          )}
        </Panel>

        <Panel
          title="Příspěvky"
          action={
            <Button asChild size="sm" className="h-7 rounded-md px-2.5 text-xs font-semibold">
              <Link href="/admin/posts/new">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Nový
              </Link>
            </Button>
          }
        >
          {d.posts.length === 0 ? (
            <Empty>Zatím žádné příspěvky.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {d.posts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/posts/${p.id}`}
                    className="group flex h-row items-center gap-3 px-3 text-sm hover:bg-muted"
                  >
                    <span className="w-12 shrink-0 text-xs text-muted-foreground tnum">{dateShort(p.createdAt)}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-900">{p.title}</span>
                    {!p.published && (
                      <span className="shrink-0 rounded border border-border px-1.5 text-[11px] text-muted-foreground">
                        koncept
                      </span>
                    )}
                    {p.pinned && (
                      <span className="shrink-0 text-[11px] font-medium text-primary">připnuto</span>
                    )}
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
