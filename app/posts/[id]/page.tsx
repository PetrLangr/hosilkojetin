import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { prisma } from "@/lib/prisma";

async function getPostById(id: string) {
  try {
    const post = await prisma.post.findFirst({
      where: { id, published: true },
      include: { author: true },
    });
    if (!post) return null;

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      imageUrl: post.imageUrl,
      authorName: post.author.name || "Neznámý autor",
      type: post.type,
      pinned: post.pinned,
      createdAt: post.createdAt,
      readTime: estimateReadTime(post.content),
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

async function getRelatedPosts(currentId: string) {
  try {
    return await prisma.post.findMany({
      where: { published: true, id: { not: currentId } },
      select: { id: true, title: true, excerpt: true, type: true, createdAt: true },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 3,
    });
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  return `${Math.ceil(words / 200)} min`;
}

const czDate = (d: Date) =>
  new Date(d).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(id);

  return (
    <div>
      <PageHeader
        title={post.title}
        actions={
          <Link
            href="/posts"
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Všechny novinky
          </Link>
        }
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="secondary"
            className={`px-1.5 py-0 text-[10px] font-semibold ${
              post.type === "announcement" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
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
          <span className="text-xs text-muted-foreground">
            {post.authorName} · {czDate(post.createdAt)} · {post.readTime} čtení
          </span>
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            {/* Obrázek jen když ho příspěvek má — dřív se dosazovala hero fotka
                dartboardu, takže i článek bez obrázku měl přes celou šířku fotku */}
            {post.imageUrl && (
              <img src={post.imageUrl} alt="" className="max-h-64 w-full object-cover" />
            )}

            <div className="space-y-3 p-4">
              {post.excerpt && (
                <p className="border-l-2 border-primary/40 pl-3 text-sm font-medium text-slate-700">
                  {post.excerpt}
                </p>
              )}

              <div
                className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900 prose-li:text-slate-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <aside>
            <section className="overflow-hidden rounded-lg border border-border bg-white">
              <h2 className="border-b border-border bg-muted px-3 py-2 text-sm font-semibold text-slate-900">
                Další novinky
              </h2>
              <ul className="divide-y divide-border">
                {relatedPosts.map((r) => (
                  <li key={r.id}>
                    <Link href={`/posts/${r.id}`} className="group block px-3 py-2 hover:bg-rose-50/50">
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={`px-1.5 py-0 text-[10px] font-semibold ${
                            r.type === "announcement"
                              ? "bg-primary/10 text-primary"
                              : "bg-accent/10 text-accent"
                          }`}
                        >
                          {r.type === "announcement" ? "OZNÁMENÍ" : "NOVINKA"}
                        </Badge>
                        <span className="tnum text-[11px] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("cs-CZ")}
                        </span>
                      </div>
                      <p className="text-xs font-medium leading-snug text-slate-900 group-hover:text-primary">
                        {r.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        )}
      </div>
    </div>
  );
}
