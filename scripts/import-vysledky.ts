/**
 * Zapíše výsledky kol sezóny 2026/2027 ze zápisů jako rychlý výsledek
 * (hry a legy, bez statistik hráčů) — stejně jako formulář „rychlý výsledek“.
 *
 *   npx tsx scripts/import-vysledky.ts            # náhled všech kol v souboru
 *   npx tsx scripts/import-vysledky.ts 1          # náhled jednoho kola
 *   npx tsx scripts/import-vysledky.ts 1 --commit # zápis
 *
 * Data bere ze scripts/data/vysledky-2026-2027.json. Domácí a hosté se tam píšou
 * tak, jak je uvádí zápis; když rozpis vede zápas obráceně, skript výsledek otočí.
 * Zápas hraný mimo termín kola má vlastní "date". Zápas, který už výsledek má,
 * nepřepíše — ani se stejnými čísly.
 *
 * Zapisuje do ostré databáze, proto je výchozí režim nasucho.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const commit = args.includes('--commit');
const wantedRound = args.find((a) => !a.startsWith('--'));

interface MatchInput {
  home: string;
  away: string;
  homeWins: number;
  awayWins: number;
  homeLegs: number;
  awayLegs: number;
  date?: string; // dohrávka nebo předehrávka mimo termín kola
}

function check(m: MatchInput) {
  const problems: string[] = [];
  const games = m.homeWins + m.awayWins;
  // 16 her, při 8:8 rozhoduje 17. hra (701)
  if (games !== 16 && !(games === 17 && Math.min(m.homeWins, m.awayWins) === 8)) {
    problems.push(`počet her ${games}`);
  }
  if (m.homeLegs < 0 || m.awayLegs < 0) problems.push('záporné legy');
  return problems;
}

async function main() {
  const file = JSON.parse(
    readFileSync(join(__dirname, 'data', 'vysledky-2026-2027.json'), 'utf-8')
  );
  const season = await prisma.season.findFirst({ where: { name: file.season } });
  if (!season) throw new Error(`Sezóna ${file.season} v databázi není.`);

  const rounds = file.rounds.filter(
    (r: { round: number }) => !wantedRound || r.round === Number(wantedRound)
  );
  if (rounds.length === 0) throw new Error(`Kolo ${wantedRound} v souboru není.`);

  let written = 0;
  let failed = 0;

  for (const round of rounds) {
    console.log(`\n${round.round}. kolo (${round.date})`);
    const scheduled = await prisma.match.findMany({
      where: { seasonId: season.id, round: round.round },
      include: { homeTeam: true, awayTeam: true },
    });

    for (const m of round.matches as MatchInput[]) {
      const label = `${m.home} – ${m.away}`;
      const problems = check(m);
      const match = scheduled.find(
        (s) =>
          (s.homeTeam.name === m.home && s.awayTeam.name === m.away) ||
          (s.homeTeam.name === m.away && s.awayTeam.name === m.home)
      );
      if (!match) problems.push('zápas v rozpisu kola není');
      if (problems.length > 0) {
        console.log(`  ✗ ${label}: ${problems.join(', ')}`);
        failed++;
        continue;
      }

      const swapped = match!.homeTeam.name !== m.home;
      const r = swapped
        ? { homeWins: m.awayWins, awayWins: m.homeWins, homeLegs: m.awayLegs, awayLegs: m.homeLegs }
        : { homeWins: m.homeWins, awayWins: m.awayWins, homeLegs: m.homeLegs, awayLegs: m.awayLegs };
      const tiebreak = r.homeWins + r.awayWins === 17;
      const homeWon = r.homeWins > r.awayWins;
      const result = {
        ...r,
        homePoints: homeWon ? (tiebreak ? 2 : 3) : tiebreak ? 1 : 0,
        awayPoints: homeWon ? (tiebreak ? 1 : 0) : tiebreak ? 2 : 3,
        legDifference: r.homeLegs - r.awayLegs,
        isQuickResult: true,
      };

      const line =
        `${match!.homeTeam.name} – ${match!.awayTeam.name}  ` +
        `${r.homeWins}:${r.awayWins} (legy ${r.homeLegs}:${r.awayLegs})` +
        (swapped ? '  [zápis má domácí a hosty obráceně než rozpis]' : '') +
        (m.date ? `  [hráno ${m.date}]` : '');

      if (match!.result) {
        console.log(`  – ${line}  už má výsledek ${JSON.stringify(match!.result)}, přeskakuji`);
        continue;
      }
      console.log(`  ${commit ? '✓' : '·'} ${line}`);

      if (commit) {
        await prisma.match.update({
          where: { id: match!.id },
          data: {
            result: result,
            isQuickResult: true,
            status: 'completed',
            endTime: new Date(),
            startTime: m.date
              ? new Date(`${m.date}T13:00:00.000Z`)
              : match!.startTime ?? new Date(round.date),
          },
        });
        written++;
      }
    }
  }

  console.log(
    commit
      ? `\nZapsáno ${written} zápasů, ${failed} chyb.`
      : `\nNanečisto, ${failed} chyb. Zápis: přidej --commit.`
  );
  if (failed > 0) process.exitCode = 1;
}

main().finally(() => prisma.$disconnect());
