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
import { prisma } from "@/lib/prisma";

// Get post by ID from database
async function getPostById(id: string) {
  try {
    const post = await prisma.post.findFirst({
      where: { 
        id: id,
        published: true 
      },
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
      }
    });

    if (!post) return null;

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      imageUrl: post.imageUrl,
      author: {
        name: post.author.name || 'Unknown Author',
        role: post.author.role,
        player: post.author.player
      },
      type: post.type,
      pinned: post.pinned,
      createdAt: post.createdAt,
      readTime: estimateReadTime(post.content)
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Get related posts from database
async function getRelatedPosts(currentId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { 
        published: true,
        id: { not: currentId }
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        type: true,
        createdAt: true
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 2
    });

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || '',
      type: post.type,
      createdAt: post.createdAt
    }));
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

// Helper function to estimate reading time
function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);
  
  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(id);

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
              src={post.imageUrl || '/hero-dartboard.webp'}
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