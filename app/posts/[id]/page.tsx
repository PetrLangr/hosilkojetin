import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Share2, 
  Pin, 
  Clock,
  Quote,
  Target
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Mock data - same as homepage for consistency
function getPostById(id: string) {
  const posts = [
    {
      id: '1',
      title: 'Máme nové webové stránky!',
      excerpt: 'Spuštění nových webových stránek s online zápisy a elektronickým podepisováním.',
      content: `
        <p>S radostí oznamujeme spuštění nových webových stránek HŠL! Nový systém přináší řadu vylepšení a nových funkcí, které usnadní správu ligy jak kapitánům, tak hráčům.</p>
        
        <h3>Hlavní novinky:</h3>
        <ul>
          <li><strong>Online zadávání výsledků</strong> - Kapitáni mohou zadávat výsledky zápasů přímo přes web</li>
          <li><strong>Automatické statistiky</strong> - Systém automaticky počítá BPI indexy a další statistiky hráčů</li>
          <li><strong>Elektronické podpisy</strong> - Zápisy lze podepisovat elektronicky pomocí PIN kódů</li>
          <li><strong>PWA podpora</strong> - Webové stránky fungují i jako mobilní aplikace</li>
          <li><strong>Responzivní design</strong> - Perfektní zobrazení na všech zařízeních</li>
        </ul>
        
        <p>Nové webové stránky jsou navrženy s důrazem na jednoduchost použití a moderní design. Kapitáni týmů obdrží své PIN kódy v nejbližších dnech.</p>
        
        <p>Pro případné dotazy nebo problémy s novým systémem nás kontaktujte na <strong>info@hsl-liga.cz</strong>.</p>
      `,
      author: { name: 'HŠL Administrátor', role: 'admin', player: null },
      type: 'announcement',
      pinned: true,
      createdAt: new Date('2025-01-15'),
      readTime: '3 min'
    },
    {
      id: '2', 
      title: 'Mobilní aplikace je na cestě!',
      excerpt: 'Připravujeme mobilní aplikaci pro ještě pohodlnější přístup k lize.',
      content: `
        <p>Pracujeme na vývoji mobilní aplikace pro iOS a Android, která přinese ještě lepší uživatelský zážitek pro všechny příznivce HŠL.</p>
        
        <h3>Co přinese mobilní aplikace:</h3>
        <ul>
          <li><strong>Push notifikace</strong> - Okamžité informace o nových výsledcích a zápasech</li>
          <li><strong>Offline režim</strong> - Prohlížení statistik i bez internetového připojení</li>
          <li><strong>Rychlý přístup</strong> - Nejdůležitější funkce na dosah ruky</li>
          <li><strong>Optimalizace pro mobily</strong> - Ještě lepší výkon na mobilních zařízeních</li>
          <li><strong>Tmavý režim</strong> - Možnost přepnutí na tmavé téma</li>
        </ul>
        
        <p>Aplikace bude dostupná zdarma na Google Play Store i Apple App Store. Očekáváme vydání v průběhu března 2025.</p>
        
        <p>Zatím si můžete přidat naše webové stránky na domovskou obrazovku svého telefonu - fungují jako plnohodnotná PWA aplikace!</p>
      `,
      author: { name: 'HŠL Administrátor', role: 'admin', player: null },
      type: 'news',
      pinned: false,
      createdAt: new Date('2025-01-10'),
      readTime: '2 min'
    }
  ];

  return posts.find(post => post.id === id) || null;
}

function getRelatedPosts(currentId: string) {
  const posts = [
    {
      id: '1',
      title: 'Máme nové webové stránky!',
      excerpt: 'Spuštění nových webových stránek s online zápisy a elektronickým podepisováním.',
      type: 'announcement',
      createdAt: new Date('2025-01-15')
    },
    {
      id: '2', 
      title: 'Mobilní aplikace je na cestě!',
      excerpt: 'Připravujeme mobilní aplikaci pro ještě pohodlnější přístup k lize.',
      type: 'news',
      createdAt: new Date('2025-01-10')
    }
  ];

  return posts.filter(post => post.id !== currentId);
}

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = getPostById(id);
  
  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(id);

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white">
          <Link href="/posts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na příspěvky
          </Link>
        </Button>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl mb-8">
          <div className="relative h-80 md:h-96">
            <img 
              src={id === '1' ? '/hero-dartboard.webp' : '/mobile-app.webp'}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            
            {/* Content over image */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <Badge 
                    className={`font-bold ${post.type === 'announcement' ? 'bg-primary' : 'bg-accent'}`}
                  >
                    {post.type === 'announcement' ? 'OZNÁMENÍ' : 'NOVINKA'}
                  </Badge>
                  
                  {post.pinned && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-bold">
                      <Pin className="h-3 w-3 mr-1" />
                      PŘIPNUTO
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                  {post.title}
                </h1>
                
                <p className="text-xl text-white/90 mb-6 max-w-2xl">
                  {post.excerpt}
                </p>
                
                {/* Meta info */}
                <div className="flex items-center gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">{post.author.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString('cs-CZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime} čtení</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content - Single Enhanced Block */}
        <Card className="rounded-2xl bg-white card-shadow overflow-hidden">
          <CardContent className="p-0">
            {/* Content Header */}
            <div className="bg-gradient-to-r from-primary/5 via-white to-accent/5 p-8 md:p-10 border-b border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">OBSAH ČLÁNKU</h2>
                    <p className="text-slate-600 font-medium">Podrobné informace a všechny důležité detaily</p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white">
                  <Share2 className="h-4 w-4 mr-2" />
                  Sdílet
                </Button>
              </div>
              
              <p className="text-lg text-slate-700 leading-relaxed font-medium">
                {post.excerpt}
              </p>
            </div>
            
            {/* Rich Content */}
            <div className="p-8 md:p-10">
              <div 
                className="prose prose-xl max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-6 prose-h3:text-primary prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6 prose-strong:text-slate-900 prose-strong:font-bold prose-ul:space-y-3 prose-li:text-slate-700 prose-li:text-lg prose-li:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
            
            {/* Article Footer */}
            <div className="bg-slate-50 p-8 md:p-10 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-lg">
                    {post.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{post.author.name}</div>
                    <div className="text-sm text-slate-600">
                      Publikováno {new Date(post.createdAt).toLocaleDateString('cs-CZ', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <Badge className="bg-primary/10 text-primary font-bold">
                  {post.readTime} čtení
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">DALŠÍ PŘÍSPĚVKY</h2>
            <p className="text-slate-600 font-medium">Prozkoumejte další novinky z ligy</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/posts/${relatedPost.id}`} className="block group">
                <Card className="rounded-2xl bg-white border border-gray-100 card-shadow transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge 
                        className={`font-bold text-xs ${relatedPost.type === 'announcement' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}
                      >
                        {relatedPost.type === 'announcement' ? 'OZNÁMENÍ' : 'NOVINKA'}
                      </Badge>
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(relatedPost.createdAt).toLocaleDateString('cs-CZ')}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors mb-3 leading-tight">
                      {relatedPost.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {relatedPost.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contact Form */}
      <ContactForm 
        title="Máte dotaz nebo nápad?"
        description="Kontaktujte nás s vašimi připomínkami nebo nápady na vylepšení ligy"
        compact={false}
      />
    </div>
  );
}