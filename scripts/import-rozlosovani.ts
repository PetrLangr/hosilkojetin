/**
 * Nahraje rozpis kol do sezóny, která už v databázi je.
 *
 *   npx tsx scripts/import-rozlosovani.ts            # náhled
 *   npx tsx scripts/import-rozlosovani.ts --commit   # zápis
 *
 * Data bere ze scripts/data/rozlosovani-2026-2027.json (vygenerováno z rozlosování
 * od vedení ligy). Zakládá jen zápasy, které v sezóně ještě nejsou — dvojici
 * v témže kole považuje za tentýž zápas, takže opakované spuštění nic nezduplikuje
 * a už zadané výsledky nechá být.
 *
 * Zapisuje do ostré databáze, proto je výchozí režim nasucho.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const commit = process.argv.includes('--commit');

interface Fixture {
  round: number;
  date: string;
  startTime: string;
  homeTeam: string;
  awayTeam: string;
}

async function main() {
  const file: { season: string; fixtures: Fixture[] } = JSON.parse(
    readFileSync(join(__dirname, 'data', 'rozlosovani-2026-2027.json'), 'utf-8')
  );

  const season = await prisma.season.findFirst({ where: { name: file.season } });
  if (!season) {
    throw new Error(`Sezóna ${file.season} v databázi není — nejdřív spusť seed skript.`);
  }

  const teams = await prisma.team.findMany({ where: { seasonId: season.id } });
  const byName = new Map(teams.map((t) => [t.name, t]));

  // Chybějící tým by jinak spadl až uprostřed zápisu a nechal rozpis rozpůlený
  const missing = [
    ...new Set(file.fixtures.flatMap((f) => [f.homeTeam, f.awayTeam])),
  ].filter((n) => !byName.has(n));
  if (missing.length) {
    throw new Error(
      `V sezóně ${season.name} chybí týmy: ${missing.join(', ')}.\n` +
        `Databáze má: ${teams.map((t) => t.name).join(', ')}`
    );
  }

  const existing = await prisma.match.findMany({
    where: { seasonId: season.id },
    select: { round: true, homeTeamId: true, awayTeamId: true },
  });
  const key = (round: number, home: string, away: string) => `${round}|${home}|${away}`;
  const known = new Set(existing.map((m) => key(m.round ?? 0, m.homeTeamId, m.awayTeamId)));

  const todo = file.fixtures.filter(
    (f) => !known.has(key(f.round, byName.get(f.homeTeam)!.id, byName.get(f.awayTeam)!.id))
  );

  console.log(`\n${commit ? 'ZÁPIS' : 'NÁHLED (bez zápisu)'} — sezóna ${season.name}`);
  console.log(`V souboru ${file.fixtures.length} zápasů, v databázi už ${existing.length}.`);

  if (!todo.length) {
    console.log('Rozpis je kompletní, nic k doplnění.\n');
    return;
  }

  const rounds = [...new Set(todo.map((f) => f.round))].sort((a, b) => a - b);
  console.log(`Doplnit ${todo.length} zápasů v ${rounds.length} kolech:\n`);
  for (const r of rounds) {
    const inRound = todo.filter((f) => f.round === r);
    const date = new Date(inRound[0].startTime).toLocaleDateString('cs-CZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    console.log(`  ${String(r).padStart(2)}. kolo  ${date}`);
    for (const f of inRound) console.log(`        ${f.homeTeam} – ${f.awayTeam}`);
  }

  if (!commit) {
    console.log('\nNasucho — nic se nezapsalo. Pro zápis přidej --commit\n');
    return;
  }

  await prisma.match.createMany({
    data: todo.map((f) => ({
      seasonId: season.id,
      round: f.round,
      homeTeamId: byName.get(f.homeTeam)!.id,
      awayTeamId: byName.get(f.awayTeam)!.id,
      startTime: new Date(f.startTime),
      status: 'scheduled',
    })),
  });

  console.log(`\nHotovo — založeno ${todo.length} zápasů.\n`);
}

main()
  .catch((e) => {
    console.error('\nChyba:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
