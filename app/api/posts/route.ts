import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch posts from database
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
      ]
    });

    // Transform data for frontend compatibility
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl,
      author: {
        name: post.author.name || 'Unknown Author',
        role: post.author.role,
        player: post.author.player
      },
      type: post.type,
      pinned: post.pinned,
      createdAt: post.createdAt.toISOString(),
      readTime: estimateReadTime(post.content)
    }));
    
    return NextResponse.json(transformedPosts, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' }, 
      { status: 500 }
    );
  }
}

// Helper function to estimate reading time
function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}

// POST method for creating new posts (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, imageUrl, type, pinned } = body;

    // Basic validation
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Název a obsah jsou povinné' }, 
        { status: 400 }
      );
    }

    // For now, we'll use the admin user we created earlier
    // In a real app, you'd get this from the session
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' }, 
        { status: 404 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        imageUrl: imageUrl?.trim() || null,
        type: type || 'news',
        pinned: pinned || false,
        published: true,
        authorId: adminUser.id
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

    // Transform for response
    const transformedPost = {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl,
      author: {
        name: post.author.name || 'Unknown Author',
        role: post.author.role,
        player: post.author.player
      },
      type: post.type,
      pinned: post.pinned,
      createdAt: post.createdAt.toISOString(),
      readTime: estimateReadTime(post.content)
    };

    return NextResponse.json(transformedPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' }, 
      { status: 500 }
    );
  }
}