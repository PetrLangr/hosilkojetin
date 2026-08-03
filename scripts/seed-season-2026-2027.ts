/**
 * Založí sezónu 2026/2027 a nahraje týmy se soupiskami ze scripts/data/season-2026-2027.json.
 *
 * Zapisuje do ostré databáze, ze které čte veřejný web, proto:
 *   - výchozí je nasucho (jen vypíše, co by udělal)
 *   - zápis se spustí až s --commit
 *   - sezóna vzniká s isActive podle datového souboru (výchozí false), takže se web
 *     sám nepřepne; aktivaci je potřeba udělat vědomě zvlášť
 *
 *   npx tsx scripts/seed-season-2026-2027.ts            # náhled
 *   npx tsx scripts/seed-season-2026-2027.ts --commit   # zápis
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const commit = process.argv.includes('--commit');

interface PlayerInput {
  name: string;
  role: string;
  dateOfBirth?: string;
}

interface TeamInput {
  name: string;
  shortName: string;
  city: string;
  venue: string;
  captainPhone?: string;
  captainEmail?: string;
  players: PlayerInput[];
}

interface SeasonFile {
  season: {
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    pointsSystem: string;
  };
  teams: TeamInput[];
}

const EXPECTED_TEAMS = 12;

async function main() {
  const file: SeasonFile = JSON.parse(
    readFileSync(join(__dirname, 'data', 'season-2026-2027.json'), 'utf-8')
  );
  const { season, teams } = file;

  console.log(`\n${commit ? 'ZÁPIS' : 'NÁHLED (bez zápisu)'} — sezóna ${season.name}\n`);

  if (teams.length !== EXPECTED_TEAMS) {
    console.log(
      `⚠️  V datech je ${teams.length} týmů, očekáváno ${EXPECTED_TEAMS}. ` +
        `Sezóna půjde založit, ale rozlosování na neúplný počet nedělej.\n`
    );
  }

  // Kolize jmen řešíme předem: @@unique([name, seasonId]) by jinak spadlo až v půlce zápisu
  const names = teams.map((t) => t.name);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length) {
    throw new Error(`Duplicitní názvy týmů v datech: ${[...new Set(dupes)].join(', ')}`);
  }

  const existing = await prisma.season.findFirst({ where: { name: season.name } });
  if (existing) {
    console.log(`Sezóna ${season.name} už v databázi je (id ${existing.id}).`);
    const teamCount = await prisma.team.count({ where: { seasonId: existing.id } });
    console.log(`Má ${teamCount} týmů. Skript ji znovu nezakládá — nejdřív ji smaž nebo uprav ručně.\n`);
    return;
  }

  let playerTotal = 0;
  for (const t of teams) {
    const captain = t.players.find((p) => p.role === 'kapitán');
    console.log(`  ${t.name} (${t.shortName}, ${t.city})`);
    console.log(`      ${t.venue}`);
    console.log(`      kapitán: ${captain?.name ?? '— chybí —'}  ${t.captainPhone ?? ''} ${t.captainEmail ?? ''}`);
    console.log(`      hráčů: ${t.players.length}`);
    playerTotal += t.players.length;
    if (!captain) {
      throw new Error(`Tým ${t.name} nemá v soupisce nikoho s rolí "kapitán".`);
    }
  }
  console.log(`\n  celkem ${teams.length} týmů, ${playerTotal} hráčů`);
  console.log(`  isActive: ${season.isActive}\n`);

  if (!commit) {
    console.log('Nasucho — nic se nezapsalo. Pro zápis přidej --commit\n');
    return;
  }

  // Aktivní smí být jen jedna sezóna — resolveSeason() bere findFirst({isActive:true}),
  // takže při dvou aktivních by web ukazoval náhodně jednu z nich.
  if (season.isActive) {
    const deactivated = await prisma.season.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    if (deactivated.count) {
      console.log(`✓ deaktivováno předchozích sezón: ${deactivated.count}`);
    }
  }

  const created = await prisma.season.create({
    data: {
      name: season.name,
      startDate: new Date(season.startDate),
      endDate: new Date(season.endDate),
      isActive: season.isActive,
      pointsSystem: season.pointsSystem,
    },
  });
  console.log(`✓ sezóna ${created.name} (${created.id})`);

  for (const t of teams) {
    const team = await prisma.team.create({
      data: {
        name: t.name,
        shortName: t.shortName,
        city: t.city,
        venue: t.venue,
        seasonId: created.id,
        players: {
          create: t.players.map((p) => ({
            name: p.name,
            role: p.role,
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
          })),
        },
      },
      include: { players: true },
    });

    // captainId jde nastavit až po vytvoření hráčů — vede na Player, který ještě neexistoval
    const captain = team.players.find((p) => p.role === 'kapitán');
    if (captain) {
      await prisma.team.update({
        where: { id: team.id },
        data: { captainId: captain.id },
      });
    }

    console.log(`✓ ${t.name} — ${team.players.length} hráčů, kapitán ${captain?.name}`);
  }

  console.log(`\nHotovo. Sezóna je založená s isActive=${season.isActive}.`);
  if (!season.isActive) {
    console.log('Web dál ukazuje předchozí sezónu, dokud novou nepřepneš.\n');
  }
}

main()
  .catch((e) => {
    console.error('\nChyba:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
