/**
 * Doplní archivní sezónu 2014/2015 — kompletní výsledky všech 18 kol a konečnou tabulku.
 *
 *   npx tsx scripts/import-sezona-2014-2015.ts            # náhled
 *   npx tsx scripts/import-sezona-2014-2015.ts --commit   # zápis
 *
 * V databázi dosud byly jen týmy a soupisky a tabulka po 3. kole — starý web víc
 * nenabízel. Ročník se tím tvářil jako nedohraný, přitom se dohrál celý.
 *
 * Data: scripts/data/sezona-2014-2015.json (rozparsované ze starého webu, každý
 * tým v nich sedí na vyhlášenou tabulku na zápas přesně).
 *
 * Tabulka se ukládá doslovně do Season.finalStandings — tehdy se hrálo 15 her na
 * utkání za V=3/P=0 a bez rozstřelu, takže dopočítat ji dnešním pravidlem by dalo
 * jiná čísla než ta vyhlášená.
 *
 * Zapisuje do ostré databáze, proto je výchozí režim nasucho.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const commit = process.argv.includes('--commit');

interface ArchiveMatch {
  round: number;
  no: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeWins: number;
  awayWins: number;
  homeLegs?: number;
  awayLegs?: number;
}

/** Starý web psal klub s dvěma "n", databáze s jedním. */
const TEAM_ALIAS: Record<string, string> = {
  'ŠK Hannibal Lecter': 'ŠK Hanibal Lecter',
};

const ARCHIVE_NOTE =
  'Kompletní ročník ze starého webu HŠL. Hrálo se 15 her na utkání za V=3 / P=0, ' +
  'rozstřel se nehrál. Sloupec „Výsledky“ v tabulce je poměr vyhraných a prohraných ' +
  'her, ne legů — legy se tehdy do tabulky nepočítaly.';

// Přesný čas utkání starý web neuvádí, jen datum. 15:00 je od té doby standardní
// začátek ligového kola, takže je to nejmenší možná domněnka.
const startOf = (date: string) => new Date(`${date}T15:00:00+01:00`);

async function main() {
  const file: {
    season: string;
    finalStandings: { header: string[]; rows: string[][]; source: string };
    matches: ArchiveMatch[];
  } = JSON.parse(readFileSync(join(__dirname, 'data', 'sezona-2014-2015.json'), 'utf-8'));

  const season = await prisma.season.findFirst({ where: { name: file.season } });
  if (!season) throw new Error(`Sezóna ${file.season} v databázi není.`);

  const teams = await prisma.team.findMany({ where: { seasonId: season.id } });
  const byName = new Map(teams.map((t) => [t.name, t]));
  const resolve = (n: string) => byName.get(TEAM_ALIAS[n] ?? n);

  const missing = [
    ...new Set(file.matches.flatMap((m) => [m.homeTeam, m.awayTeam])),
  ].filter((n) => !resolve(n));
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
  const key = (r: number, h: string, a: string) => `${r}|${h}|${a}`;
  const known = new Set(existing.map((m) => key(m.round ?? 0, m.homeTeamId, m.awayTeamId)));
  const todo = file.matches.filter(
    (m) => !known.has(key(m.round, resolve(m.homeTeam)!.id, resolve(m.awayTeam)!.id))
  );

  const noLegs = file.matches.filter((m) => m.homeLegs === undefined);

  console.log(`\n${commit ? 'ZÁPIS' : 'NÁHLED (bez zápisu)'} — sezóna ${season.name}\n`);
  console.log(`Zápasů v souboru: ${file.matches.length}, v databázi už: ${existing.length}`);
  console.log(`K založení: ${todo.length}`);
  console.log(`Bez legů (starý web je neuvádí): ${noLegs.map((m) => `#${m.no}`).join(', ') || '—'}`);
  console.log(`\nKonečná tabulka (${file.finalStandings.rows.length} týmů):`);
  for (const r of file.finalStandings.rows) {
    console.log(`  ${r[0].padStart(3)} ${r[1].padEnd(22)} ${r[3]}v ${r[5]}p  ${r[6].padStart(9)}  ${r[7].padStart(2)}b`);
  }
  console.log(`\nSeason.archiveNote se přepíše na:\n  „${ARCHIVE_NOTE}“`);
  console.log(`  (dosud: „${season.archiveNote ?? '—'}“)`);

  if (!commit) {
    console.log('\nNasucho — nic se nezapsalo. Pro zápis přidej --commit\n');
    return;
  }

  if (todo.length) {
    await prisma.match.createMany({
      data: todo.map((m) => {
        const start = startOf(m.date);
        return {
          seasonId: season.id,
          round: m.round,
          homeTeamId: resolve(m.homeTeam)!.id,
          awayTeamId: resolve(m.awayTeam)!.id,
          startTime: start,
          // endTime odlišuje odehraný zápas od naplánovaného, na hodině nezáleží
          endTime: new Date(start.getTime() + 3 * 60 * 60 * 1000),
          status: 'completed',
          isQuickResult: true,
          result: {
            homeWins: m.homeWins,
            awayWins: m.awayWins,
            homeLegs: m.homeLegs ?? null,
            awayLegs: m.awayLegs ?? null,
            homePoints: m.homeWins > m.awayWins ? 3 : 0,
            awayPoints: m.awayWins > m.homeWins ? 3 : 0,
            isQuickResult: true,
            source: 'starý web HŠL',
          },
        };
      }),
    });
    console.log(`\n✓ založeno ${todo.length} zápasů`);
  }

  await prisma.season.update({
    where: { id: season.id },
    data: {
      isArchived: true,
      finalStandings: file.finalStandings,
      archiveNote: ARCHIVE_NOTE,
    },
  });
  console.log('✓ konečná tabulka a poznámka uloženy\n');
}

main()
  .catch((e) => {
    console.error('\nChyba:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
