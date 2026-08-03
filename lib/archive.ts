import { type TeamRecord } from '@/lib/standings';

/**
 * Převod oficiální tabulky archivní sezóny (Season.finalStandings) na TeamRecord[],
 * aby ji /standings zobrazila stejně jako dopočítanou tabulku živé sezóny.
 *
 * Tabulka pochází ze starého webu HŠL a ukládá se doslovně. Sloupce se mezi ročníky liší:
 * do 2016/17 "Výhry | Prohry" bez VP/PP a 2014/15 i bez legů, od 2017/18 "V | VP | P | PP".
 * Názvy sloupců obsahují i překlepy původního webu ("Výsledeky", "Tými").
 */

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');

const COLUMN: Record<string, string> = {
  poradi: 'rank', tym: 'team', tymi: 'team', kolo: 'played',
  vyhry: 'won', v: 'won', vp: 'wonPenalty', prohry: 'lost', p: 'lost', pp: 'lostPenalty',
  vysledky: 'games', vysledeky: 'games', legy: 'legs', body: 'points',
};

// Buňky bývají zapsané jako "_57:18_" nebo "128 : 147"
function pair(raw: string | undefined): [number, number] {
  const m = (raw ?? '').match(/(\d+)\s*:\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : [0, 0];
}

const int = (raw: string | undefined) => Number((raw ?? '').replace(/\D/g, '')) || 0;

export function officialStandings(season: {
  finalStandings: any;
  pointsSystem: string;
}): (TeamRecord & { official: true })[] {
  const { header, rows } = season.finalStandings as { header: string[]; rows: string[][] };
  const idx: Record<string, number> = {};
  header.forEach((h, i) => {
    const key = COLUMN[norm(h)];
    if (key && !(key in idx)) idx[key] = i;
  });

  return rows
    .map((row) => {
      const name = (row[idx.team] ?? '').trim();
      const [legsFor, legsAgainst] = pair(row[idx.legs]);
      return {
        teamId: name,
        teamName: name,
        shortName: name,
        played: int(row[idx.played]),
        won: int(row[idx.won]),
        wonPenalty: 'wonPenalty' in idx ? int(row[idx.wonPenalty]) : 0,
        lostPenalty: 'lostPenalty' in idx ? int(row[idx.lostPenalty]) : 0,
        lost: int(row[idx.lost]),
        legsFor,
        legsAgainst,
        legDifference: legsFor - legsAgainst,
        points: int(row[idx.points]),
        form: [],
        official: true as const,
      };
    })
    .filter((r) => r.teamName && r.teamName !== '0');
}
