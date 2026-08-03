/**
 * Soupis toho, co bylo na původním webu HŠL (webzdarma.cz) k dispozici mimo výsledky.
 * Soubory leží v public/stary-web/ jako snapshot — HTML převedené do UTF-8 a bez reklam,
 * dokumenty a obrázky beze změny.
 */

export interface ArchiveDoc {
  file: string;
  title: string;
  note: string;
  kind: 'xls' | 'doc' | 'pdf' | 'odt';
  bytes: number;
}

// Přihláška, zápis utkání a platná pravidla tu nejsou — jsou to živé formuláře,
// ne historie, a najdeš je na /contact (lib/league-files.ts). Soubory ve
// stary-web/ zůstávají netknuté, aby snapshot starého webu odpovídal originálu.
export const ARCHIVE_DOCS: ArchiveDoc[] = [
  { file: 'pravidla.doc', title: 'Pravidla HŠL (starší verze)', note: 'Dřívější znění pravidel', kind: 'doc', bytes: 60928 },
  { file: 'pravidla.odt', title: 'Pravidla HŠL (ODT)', note: 'Totéž ve formátu OpenDocument', kind: 'odt', bytes: 18913 },
  { file: 'turnaj.doc', title: 'Turnaj', note: 'Dokument k turnaji', kind: 'doc', bytes: 465920 },
  { file: 'rozlosovani2023.pdf', title: 'Rozlosování 2023', note: 'Rozpis kol v PDF', kind: 'pdf', bytes: 416045 },
  { file: 'rozlosovani2022.pdf', title: 'Rozlosování 2022', note: 'Rozpis kol v PDF', kind: 'pdf', bytes: 398995 },
];

export interface ArchivePage {
  file: string;
  title: string;
  note: string;
}

/** Stránky původního webu, jak je nabízela jeho navigace (left.html). */
export const ARCHIVE_PAGES: ArchivePage[] = [
  { file: 'obsah.html', title: 'Hlavní strana', note: 'Úvodní text webu' },
  { file: 'pravidla.html', title: 'Pravidla ligy', note: 'Kompletní znění pravidel' },
  { file: 'tymy.html', title: 'Týmy 2025/2026', note: 'Soupisky, kapitáni a hrací místa' },
  { file: 'tabulka.html', title: 'Tabulka', note: 'Tabulka poslední sezóny' },
  { file: 'dokumentykestazeni.html', title: 'Dokumenty ke stažení', note: 'Původní rozcestník dokumentů' },
  { file: 'kontakty.html', title: 'Kontakty', note: 'Vedoucí ligy' },
];

/** Sezónní stránky starého webu — římské číslo tak, jak je používal. */
export const ARCHIVE_SEASON_PAGES: { file: string; roman: string; season: string }[] = [
  { file: 'sezonaXI.html', roman: 'XI', season: '2025/2026' },
  { file: 'sezonaX.html', roman: 'X', season: '2024/2025' },
  { file: 'sezonaIX.html', roman: 'IX', season: '2023/2024' },
  { file: 'sezonaVIII.html', roman: 'VIII', season: '2022/2023' },
  { file: 'sezonaVII.html', roman: 'VII', season: '2021/2022' },
  { file: 'sezonaVI.html', roman: 'VI', season: '2019/2020' },
  { file: 'sezonaV.html', roman: 'V', season: '2018/2019' },
  { file: 'sezonaIV.html', roman: 'IV', season: '2017/2018' },
  { file: 'sezonaIII.html', roman: 'III', season: '2016/2017' },
  { file: 'sezonaII.html', roman: 'II', season: '2015/2016' },
  { file: 'sezonaI.html', roman: 'I', season: '2014/2015' },
];

export const ARCHIVE_BASE = '/stary-web';

export const fileUrl = (file: string) => `${ARCHIVE_BASE}/${encodeURIComponent(file)}`;

export const formatBytes = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} kB`;
