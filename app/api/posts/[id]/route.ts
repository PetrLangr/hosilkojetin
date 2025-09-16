import { NextRequest, NextResponse } from 'next/server';

// Mock data - same structure as used in pages
const POSTS_DATA = [
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
    createdAt: new Date('2025-01-15').toISOString(),
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
    createdAt: new Date('2025-01-10').toISOString(),
    readTime: '2 min'
  }
];

interface RouteContext {
  params: { id: string };
}

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find post by ID
    const post = POSTS_DATA.find(p => p.id === id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' }, 
      { status: 500 }
    );
  }
}

// Future: PUT method for updating posts (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // This would require authentication and admin role check
    return NextResponse.json(
      { error: 'Updating posts not implemented yet' }, 
      { status: 501 }
    );
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' }, 
      { status: 500 }
    );
  }
}

// Future: DELETE method for deleting posts (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // This would require authentication and admin role check
    return NextResponse.json(
      { error: 'Deleting posts not implemented yet' }, 
      { status: 501 }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' }, 
      { status: 500 }
    );
  }
}