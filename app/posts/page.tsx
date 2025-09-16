import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Pin, Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock data - same as homepage for consistency
function getPostsData() {
  const posts = [
    {
      id: '1',
      title: 'Máme nové webové stránky!',
      excerpt: 'Spuštění nových webových stránek s online zápisy a elektronickým podepisováním.',
      content: 'S radostí oznamujeme spuštění nových webových stránek HŠL! Nový systém umožňuje kapitánům zadávat výsledky zápasů online, automaticky počítá statistiky hráčů a BPI indexy. Webové stránky jsou plně responzivní a fungují i jako PWA aplikace pro mobilní zařízení. Kapitáni mohou nyní podepisovat zápisy elektronicky pomocí PIN kódů, což značně zrychlí celý proces.',
      author: { name: 'HŠL Administrátor', role: 'admin', player: null },
      type: 'announcement',
      pinned: true,
      createdAt: new Date('2025-01-15')
    },
    {
      id: '2', 
      title: 'Mobilní aplikace je na cestě!',
      excerpt: 'Připravujeme mobilní aplikaci pro ještě pohodlnější přístup k lize.',
      content: 'Pracujeme na vývoji mobilní aplikace pro iOS a Android, která přinese ještě lepší uživatelský zážitek. Aplikace bude obsahovat push notifikace pro nové výsledky, offline režim pro prohlížení statistik a rychlý přístup k nejdůležitějším funkcím. Očekáváme vydání v průběhu března 2025.',
      author: { name: 'HŠL Administrátor', role: 'admin', player: null },
      type: 'news',
      pinned: false,
      createdAt: new Date('2025-01-10')
    }
  ];

  return posts;
}

export default function PostsPage() {
  const posts = getPostsData();
  
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="text-center py-12">
        <div className="mb-6">
          <Badge className="bg-primary text-white px-4 py-2 text-sm font-semibold">
            NOVINKY A OZNÁMENÍ
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          VŠECHNY
          <br />
          <span className="text-primary">PŘÍSPĚVKY</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
          Sledujte nejnovější zprávy, oznámení a novinky z Hospodské Šipkové Ligy
        </p>
      </section>

      {/* Posts Grid */}
      <section className="max-w-6xl mx-auto">
        {posts && posts.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {posts.map((post, index) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="block group">
                <article className={`relative overflow-hidden rounded-2xl bg-white border border-gray-100 card-shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer h-full ${post.pinned ? 'ring-2 ring-primary/20 bg-gradient-to-br from-rose-50/50 to-white' : ''}`}>
                  
                  {/* Hero Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={index === 0 ? '/hero-dartboard.webp' : '/mobile-app.webp'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Pinned indicator */}
                    {post.pinned && (
                      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm shadow-lg">
                        <Pin className="h-3 w-3" />
                        PŘIPNUTO
                      </div>
                    )}
                    
                    {/* Type badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge 
                        className={`font-bold backdrop-blur-sm shadow-lg ${post.type === 'announcement' ? 'bg-primary/90 text-white' : 'bg-accent/90 text-white'}`}
                      >
                        {post.type === 'announcement' ? 'OZNÁMENÍ' : 'NOVINKA'}
                      </Badge>
                    </div>

                    {/* Read more overlay */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        Číst více
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-primary transition-colors mb-3 leading-tight">
                      {post.title}
                    </h2>
                    
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                    
                    {/* Meta information */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-sm">
                          {post.author.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{post.author.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.createdAt).toLocaleDateString('cs-CZ', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold">
                        {post.type === 'announcement' ? 'OZNÁMENÍ' : 'AKTUALITY'}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl bg-white card-shadow max-w-2xl mx-auto">
            <CardContent className="py-20 text-center">
              <div className="mx-auto mb-8 size-20 rounded-full bg-muted grid place-items-center">
                <MessageSquare className="size-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Zatím žádné příspěvky</h3>
              <p className="text-slate-600 text-lg mb-8">
                Kapitáni a administrátoři můžou přidávat oznámení o turnajích a novinkách
              </p>
              <Button asChild className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold">
                <Link href="/">
                  Zpět na domovskou stránku
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Call to Action */}
      {posts.length > 0 && (
        <section className="text-center py-16 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-gray-100">
          <h3 className="text-2xl font-black text-slate-900 mb-4">Nechcete propást žádnou novinku?</h3>
          <p className="text-slate-600 mb-8 text-lg">
            Sledujte naše sociální sítě pro nejnovější informace o lize
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-semibold">
              <Link href="/">
                <User className="h-4 w-4 mr-2" />
                Domovská stránka
              </Link>
            </Button>
            <Button asChild className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold">
              <Link href="/teams">
                <MessageSquare className="h-4 w-4 mr-2" />
                Prozkoumat týmy
              </Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}