import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { prisma } from "@/lib/prisma";

// Výpis příspěvků se čte z databáze při každém požadavku. Staticky předgenerovaný
// by ukazoval jen ty, které existovaly v době buildu, a nový příspěvek by se
// objevil až po dalším nasazení.
export const dynamic = 'force-dynamic';

/**
 * Příspěvky z databáze. Dřív tu byla natvrdo zapsaná dvojice smyšlených novinek
 * s odkazy na id "1" a "2", která v databázi neexistují — proklik z výpisu tedy
 * končil na 404, zatímco homepage četla ta skutečná.
 */
async function getPosts() {
  try {
    return await prisma.post.findMany({
      where: { published: true },
      include: { author: true },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

const shortDate = (d: Date) =>
  new Date(d).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <PageHeader
        title="Novinky"
        subtitle={
          posts.length
            ? `${posts.length} ${posts.length === 1 ? "příspěvek" : posts.length < 5 ? "příspěvky" : "příspěvků"}`
            : undefined
        }
      />

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Zatím žádné příspěvky.</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`} className="group flex gap-3 px-3 py-2.5 hover:bg-muted/60">
                {/* Datum ve vlastním sloupci, ať se výpis čte jako zpravodajský feed */}
                <span className="tnum w-20 shrink-0 pt-px text-xs text-muted-foreground">
                  {shortDate(post.createdAt)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className="min-w-0 text-sm font-semibold leading-snug text-slate-900 group-hover:text-primary">
                      {post.title}
                    </h2>
                    {post.pinned && (
                      <span className="shrink-0 text-[11px] font-semibold text-primary">Připnuto</span>
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {post.type === "announcement" ? "Oznámení" : "Novinka"} · {post.author.name ?? "Neznámý autor"}
                  </p>
                </div>

                {/* Náhled jen když ho příspěvek opravdu má — dřív se sem dosazovala
                    hero fotka, takže každý článek vypadal, že obrázek má */}
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
