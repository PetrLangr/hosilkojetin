import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePosts() {
  console.log('Updating posts with imageUrl...');

  // Update first post
  await prisma.post.updateMany({
    where: { title: 'Máme nové webové stránky!' },
    data: { imageUrl: '/hero-dartboard.webp' }
  });

  // Update second post  
  await prisma.post.updateMany({
    where: { title: 'Mobilní aplikace je na cestě!' },
    data: { imageUrl: '/mobile-app.webp' }
  });

  console.log('Posts updated successfully!');
  
  // Verify
  const posts = await prisma.post.findMany({
    select: { title: true, imageUrl: true }
  });
  
  console.log('Current posts:');
  posts.forEach(post => {
    console.log(`- ${post.title}: ${post.imageUrl}`);
  });
}

updatePosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());