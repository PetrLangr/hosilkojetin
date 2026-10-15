/**
 * Nastaví přihlašovací údaje administrátora.
 *
 * Heslo se nikdy nepíše do kódu — bere se z prostředí, aby neskončilo
 * ve veřejném repozitáři:
 *
 *   ADMIN_EMAIL=novy@email.cz ADMIN_PASSWORD='...' npx tsx scripts/set-admin.ts
 *   ADMIN_EMAIL=novy@email.cz ADMIN_PASSWORD='...' npx tsx scripts/set-admin.ts --commit
 *
 * Volitelně ADMIN_NAME nastaví zobrazované jméno (jinak "HŠL Administrátor").
 * Volitelně OLD_ADMIN_EMAIL přejmenuje existující účet místo založení nového —
 * tím se zachovají jeho příspěvky a vazby.
 * S --disable EMAIL nastaví účtu náhodné heslo (znepřístupní ho, ale nemaže).
 */
import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const commit = process.argv.includes('--commit');
const disableIdx = process.argv.indexOf('--disable');
const disableEmail = disableIdx !== -1 ? process.argv[disableIdx + 1] : null;

// Stejný počet kol jako používá zbytek projektu
const ROUNDS = 12;

async function disableAccount(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, _count: { select: { posts: true } } },
  });
  if (!user) {
    console.log(`Účet ${email} neexistuje — nic se nemění.`);
    return;
  }

  console.log(`Znepřístupnit: ${user.email} (příspěvků: ${user._count.posts})`);
  console.log('  → náhodné heslo, účet zůstane kvůli vazbám v datech');
  if (!commit) return;

  const random = randomBytes(24).toString('base64url');
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(random, ROUNDS) },
  });
  console.log('  ✓ heslo přepsáno náhodným řetězcem (nikam se neukládá)');
}

async function main() {
  console.log(`\n${commit ? 'ZÁPIS' : 'NÁHLED (bez zápisu)'}\n`);

  if (disableEmail) {
    await disableAccount(disableEmail);
    if (!commit) console.log('\nNasucho — nic se nezapsalo. Pro zápis přidej --commit\n');
    return;
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Chybí ADMIN_EMAIL nebo ADMIN_PASSWORD v prostředí.');
  }
  if (password.length < 10) {
    console.log('⚠️  Heslo je kratší než 10 znaků.\n');
  }

  const name = process.env.ADMIN_NAME?.trim() || undefined;
  const oldEmail = process.env.OLD_ADMIN_EMAIL;
  const existing = oldEmail
    ? await prisma.user.findUnique({ where: { email: oldEmail } })
    : await prisma.user.findUnique({ where: { email } });

  const hashed = await bcrypt.hash(password, ROUNDS);

  if (existing) {
    const posts = await prisma.post.count({ where: { authorId: existing.id } });
    console.log(`Upravit účet: ${existing.email}`);
    if (existing.email !== email) console.log(`  e-mail → ${email}`);
    console.log(`  heslo  → nové (${password.length} znaků)`);
    if (name) console.log(`  jméno  → ${name}`);
    console.log(`  role   → admin`);
    console.log(`  zachová se ${posts} příspěvků a všechny vazby`);

    if (!commit) {
      console.log('\nNasucho — nic se nezapsalo. Pro zápis přidej --commit\n');
      return;
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: { email, password: hashed, role: 'admin', ...(name && { name }) },
    });
    console.log(`\n✓ Účet upraven: ${email}\n`);
    return;
  }

  console.log(`Založit nový admin účet: ${email}${name ? ` (${name})` : ''}`);
  if (!commit) {
    console.log('\nNasucho — nic se nezapsalo. Pro zápis přidej --commit\n');
    return;
  }

  await prisma.user.create({
    data: { email, password: hashed, role: 'admin', name: name ?? 'HŠL Administrátor' },
  });
  console.log(`\n✓ Účet založen: ${email}\n`);
}

main()
  .catch((e) => {
    console.error('\nChyba:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
