import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const posts = [
  {
    title: 'Máme nové webové stránky!',
    content: `S radostí oznamujeme spuštění nových webových stránek Hospodské šipkové ligy.

Nový systém přináší možnost vyplňovat zápisy z utkání online včetně elektronického podepisování, takže odpadá papírování.

Najdete zde všechny výsledky, tabulky, týmy a hráče přehledně na jednom místě.

Věříme, že vám nový web zpříjemní sledování celé sezóny! 🎯`,
    excerpt: 'Spuštění nových webových stránek s online zápisy a elektronickým podepisováním.',
    type: 'announcement',
    published: true,
    pinned: true
  },
  {
    title: 'Mobilní aplikace je na cestě!',
    content: `Pracujeme na vývoji mobilní aplikace HŠL, abyste měli ligu vždy doslova po ruce.

Aplikace vám umožní sledovat zápasy, výsledky a statistiky přímo v telefonu, ať už budete doma, v hospodě nebo na cestách.

Brzy se dozvíte více – těšte se na ještě pohodlnější přístup k vaší oblíbené lize! 📱⚡`,
    excerpt: 'Připravujeme mobilní aplikaci pro ještě pohodlnější přístup k lize.',
    type: 'news',
    published: true,
    pinned: false
  }
];

async function main() {
  console.log('Creating news posts...');

  // Find admin user (first user with admin role, or create one)
  let adminUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (!adminUser) {
    // Create admin user if none exists
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@hsl.cz',
        name: 'HŠL Administrátor',
        role: 'admin',
        password: '$2a$10$dummy.hash.for.admin' // Dummy hash for now
      }
    });
    console.log('Created admin user:', adminUser.email);
  }

  for (const postData of posts) {
    const existingPost = await prisma.post.findFirst({
      where: { title: postData.title }
    });

    if (!existingPost) {
      const post = await prisma.post.create({
        data: {
          ...postData,
          authorId: adminUser.id
        }
      });
      console.log('Created post:', post.title);
    } else {
      console.log('Post already exists:', postData.title);
    }
  }

  console.log('Posts created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });