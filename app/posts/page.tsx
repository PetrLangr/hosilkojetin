import Link from "next/link";
import { Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const czDate = (d: Date) =>
  new Date(d).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });

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
        <div className="rounded-lg border border-border bg-white px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">Zatím žádné příspěvky.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Oznámení o turnajích a novinkách přidávají kapitáni a administrátoři.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <ul className="divide-y divide-border">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/posts/${post.id}`} className="group flex gap-3 p-3 hover:bg-rose-50/50">
                  {/* Náhled jen když ho příspěvek opravdu má — dřív se sem dosazovala
                      hero fotka, takže každý článek vypadal, že obrázek má */}
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="size-16 shrink-0 rounded object-cover" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className={`px-1.5 py-0 text-[10px] font-semibold ${
                          post.type === "announcement"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {post.type === "announcement" ? "OZNÁMENÍ" : "NOVINKA"}
                      </Badge>
                      {post.pinned && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 bg-amber-100 px-1.5 py-0 text-[10px] font-semibold text-amber-800"
                        >
                          <Pin className="h-2.5 w-2.5" />
                          PŘIPNUTO
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {post.author.name ?? "Neznámý autor"} · {czDate(post.createdAt)}
                      </span>
                    </div>

                    <h2 className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-primary">
                      {post.title}
                    </h2>

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
        </div>
      )}
    </div>
  );
}
