/**
 * Přidá tým se soupiskou do už existující sezóny (seed skript zakládá jen novou).
 *
 *   npx tsx scripts/add-team.ts "Bochořský koblihy"            # náhled
 *   npx tsx scripts/add-team.ts "Bochořský koblihy" --commit   # zápis
 *
 * Data bere ze scripts/data/season-2026-2027.json — tým se tam nejdřív dopíše
 * do pole "teams". Zapisuje do ostré databáze, proto je výchozí režim nasucho.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const commit = process.argv.includes('--commit');
const wanted = process.argv[2];

async function main() {
  if (!wanted || wanted.startsWith('--')) {
    throw new Error('Chybí název týmu. Např: npx tsx scripts/add-team.ts "Bochořský koblihy"');
  }

  const file = JSON.parse(
    readFileSync(join(__dirname, 'data', 'season-2026-2027.json'), 'utf-8')
  );

  const team = file.teams.find((t: any) => t.name === wanted);
  if (!team) {
    throw new Error(
      `Tým "${wanted}" není v datovém souboru. Dostupné: ${file.teams.map((t: any) => t.name).join(', ')}`
    );
  }

  if (team._verify) {
    console.log(`\n⚠️  ${team._verify}\n`);
  }

  const season = await prisma.season.findFirst({ where: { name: file.season.name } });
  if (!season) {
    throw new Error(`Sezóna ${file.season.name} v databázi není — nejdřív spusť seed skript.`);
  }

  const existing = await prisma.team.findFirst({
    where: { name: team.name, seasonId: season.id },
  });
  if (existing) {
    console.log(`Tým "${team.name}" už v sezóně ${season.name} je. Nic se nemění.\n`);
    return;
  }

  const captain = team.players.find((p: any) => p.role === 'kapitán');
  console.log(`${commit ? 'ZÁPIS' : 'NÁHLED (bez zápisu)'} — ${season.name}\n`);
  console.log(`  ${team.name} (${team.shortName}, ${team.city})`);
  console.log(`      ${team.venue ?? '— hrací místo neuvedeno —'}`);
  console.log(`      kapitán: ${captain?.name ?? '— NEURČEN —'}  ${team.captainPhone ?? ''} ${team.captainEmail ?? ''}`);
  console.log(`      hráčů: ${team.players.length}`);
  for (const p of team.players) {
    console.log(`        ${p.role === 'kapitán' ? '©' : ' '} ${p.name.padEnd(24)} ${p.dateOfBirth ?? '— bez data narození —'}`);
  }

  if (!commit) {
    console.log('\nNasucho — nic se nezapsalo. Pro zápis přidej --commit\n');
    return;
  }

  const created = await prisma.team.create({
    data: {
      name: team.name,
      shortName: team.shortName,
      city: team.city,
      venue: team.venue ?? null,
      seasonId: season.id,
      players: {
        create: team.players.map((p: any) => ({
          name: p.name,
          role: p.role,
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
        })),
      },
    },
    include: { players: true },
  });

  // captainId jde nastavit až po vytvoření hráčů — vede na Player, který neexistoval
  const captainRow = created.players.find((p) => p.role === 'kapitán');
  if (captainRow) {
    await prisma.team.update({ where: { id: created.id }, data: { captainId: captainRow.id } });
  }

  const total = await prisma.team.count({ where: { seasonId: season.id } });
  console.log(`\n✓ ${team.name} přidán — ${created.players.length} hráčů, kapitán ${captainRow?.name ?? '—'}`);
  console.log(`  Sezóna ${season.name} má nyní ${total} týmů.\n`);
}

main()
  .catch((e) => {
    console.error('\nChyba:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
