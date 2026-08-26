/**
 * Doplní hráče do soupisky týmu, který v sezóně už existuje
 * (seed skript zakládá celou sezónu, add-team.ts celý tým).
 *
 *   npx tsx scripts/add-players.ts                          # náhled všech týmů
 *   npx tsx scripts/add-players.ts "Heffron Prostějov"      # náhled jednoho týmu
 *   npx tsx scripts/add-players.ts --commit                 # zápis
 *
 * Data bere ze scripts/data/season-2026-2027.json — hráče tam nejdřív dopiš
 * do pole "players" u příslušného týmu. Skript pak dorovná databázi na soubor:
 * hráče, kteří jsou v souboru a chybí v databázi, založí. Nic nemaže ani nepřepisuje,
 * takže případný rozdíl v datu narození nebo roli je potřeba opravit ručně.
 *
 * Zapisuje do ostré databáze, proto je výchozí režim nasucho.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const commit = args.includes('--commit');
const wanted = args.find((a) => !a.startsWith('--'));

interface PlayerInput {
  name: string;
  role: string;
  dateOfBirth?: string;
}

async function main() {
  const file = JSON.parse(
    readFileSync(join(__dirname, 'data', 'season-2026-2027.json'), 'utf-8')
  );

  const season = await prisma.season.findFirst({ where: { name: file.season.name } });
  if (!season) {
    throw new Error(`Sezóna ${file.season.name} v databázi není — nejdřív spusť seed skript.`);
  }

  const teams = wanted
    ? file.teams.filter((t: any) => t.name === wanted)
    : file.teams;
  if (!teams.length) {
    throw new Error(
      `Tým "${wanted}" není v datovém souboru. Dostupné: ${file.teams.map((t: any) => t.name).join(', ')}`
    );
  }

  console.log(`\n${commit ? 'ZÁPIS' : 'NÁHLED (bez zápisu)'} — sezóna ${season.name}\n`);

  let added = 0;
  for (const t of teams) {
    const team = await prisma.team.findFirst({
      where: { name: t.name, seasonId: season.id },
      include: { players: true },
    });
    if (!team) {
      console.log(`⚠️  ${t.name} — tým v sezóně není, přeskakuji (založ ho přes add-team.ts)`);
      continue;
    }

    const known = new Set(team.players.map((p) => p.name));
    const missing: PlayerInput[] = t.players.filter((p: PlayerInput) => !known.has(p.name));
    if (!missing.length) continue;

    console.log(`${t.name} — doplnit ${missing.length}:`);
    for (const p of missing) {
      console.log(`   + ${p.name} (${p.role}, nar. ${p.dateOfBirth ?? '—'})`);
      if (commit) {
        await prisma.player.create({
          data: {
            name: p.name,
            role: p.role,
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
            teamId: team.id,
          },
        });
      }
    }
    added += missing.length;
  }

  if (!added) {
    console.log('Soupisky v databázi souhlasí s datovým souborem. Nic k doplnění.\n');
    return;
  }

  console.log(
    commit
      ? `\nHotovo — přidáno ${added} hráčů.\n`
      : `\nNasucho — nic se nezapsalo. Pro zápis přidej --commit\n`
  );
}

main()
  .catch((e) => {
    console.error('\nChyba:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
