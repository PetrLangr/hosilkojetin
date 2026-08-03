/**
 * Přepne, kterou sezónu web ukazuje jako aktuální.
 *
 *   npx tsx scripts/set-active-season.ts                 # vypíše sezóny a která je aktivní
 *   npx tsx scripts/set-active-season.ts "2025/2026"     # přepne zpátky
 *   npx tsx scripts/set-active-season.ts "2026/2027"
 *
 * Aktivní smí být vždy jen jedna — resolveSeason() bere findFirst({isActive:true}),
 * takže při dvou aktivních by web ukazoval náhodně jednu z nich.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const wanted = process.argv[2];
  const seasons = await prisma.season.findMany({ orderBy: { startDate: 'desc' } });

  if (!wanted) {
    console.log('\nSezóny v databázi:\n');
    for (const s of seasons) {
      console.log(`  ${s.isActive ? '→' : ' '} ${s.name}${s.isActive ? '  (aktivní)' : ''}`);
    }
    console.log('\nPřepnutí: npx tsx scripts/set-active-season.ts "2025/2026"\n');
    return;
  }

  const target = seasons.find((s) => s.name === wanted);
  if (!target) {
    throw new Error(`Sezóna "${wanted}" v databázi není. Dostupné: ${seasons.map((s) => s.name).join(', ')}`);
  }

  await prisma.season.updateMany({ where: { isActive: true }, data: { isActive: false } });
  await prisma.season.update({ where: { id: target.id }, data: { isActive: true } });

  console.log(`\n✓ Aktivní sezóna je nyní ${target.name}\n`);
}

main()
  .catch((e) => {
    console.error('\nChyba:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
