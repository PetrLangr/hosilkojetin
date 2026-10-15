import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    <div className="mx-auto max-w-3xl">
      <Link
        href="/posts"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Novinky
      </Link>

      <article className="mt-2">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900">{post.title}</h1>
        <p className="tnum mt-1.5 text-xs text-muted-foreground">
          {czDate(post.createdAt)} · {post.authorName} ·{" "}
          {post.type === "announcement" ? "Oznámení" : "Novinka"} · {post.readTime} čtení
          {post.pinned && <span className="font-semibold text-primary"> · Připnuto</span>}
        </p>

        {/* Obrázek jen když ho příspěvek má — dřív se dosazovala hero fotka
            dartboardu, takže i článek bez obrázku měl přes celou šířku fotku */}
        {post.imageUrl && (
          <img src={post.imageUrl} alt="" className="mt-4 max-h-80 w-full rounded-lg object-cover" />
        )}

        {post.excerpt && (
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-slate-800">{post.excerpt}</p>
        )}

        {/* Typography plugin v projektu není, takže prose-* třídy nic nedělaly a HTML
            z editoru se vykreslovalo bez odsazení. Styly pro jeho tagy proto přímo. */}
        <div
          className="mt-4 space-y-3 text-[15px] leading-7 text-slate-700 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[#9F1239] [&_h2]:pt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:pt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {relatedPosts.length > 0 && (
        <section className="mt-8 overflow-hidden rounded-lg border border-border bg-white">
          <h2 className="flex h-10 items-center border-b border-border bg-muted px-3 text-sm font-semibold text-slate-900">
            Další novinky
          </h2>
          <ul className="divide-y divide-border">
            {relatedPosts.map((r) => (
              <li key={r.id}>
                <Link href={`/posts/${r.id}`} className="group flex min-h-10 items-baseline gap-3 px-3 py-2 hover:bg-muted/60">
                  <span className="tnum w-20 shrink-0 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString("cs-CZ")}
                  </span>
                  <span className="min-w-0 text-sm font-medium leading-snug text-slate-900 group-hover:text-primary">
                    {r.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
