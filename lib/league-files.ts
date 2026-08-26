/**
 * Platné dokumenty ligy — přihláška, zápis utkání, pravidla a rozlosování.
 *
 * Leží v public/dokumenty/ zvlášť od snapshotu starého webu (public/stary-web/).
 * Dřív byly součástí archivu, ale archiv je historie; tohle jsou formuláře, které
 * kapitáni potřebují teď, proto patří ke kontaktům.
 *
 * Řazeno podle toho, jak často to kapitán hledá: rozpis a zápis každé kolo,
 * pravidla občas, přihláška jednou za sezónu.
 */

export interface LeagueDoc {
  file: string;
  title: string;
  note: string;
  kind: 'xls' | 'xlsx' | 'doc' | 'pdf' | 'odt';
  bytes: number;
}

export const LEAGUE_DOCS: LeagueDoc[] = [
  {
    file: 'rozlosovani-2026-2027.pdf',
    title: 'Rozlosování 2026/2027',
    note: 'Podzimní i zimní část, 22 kol',
    kind: 'pdf',
    bytes: 120909,
  },
  {
    file: 'rozlosovani-2026-2027.xlsx',
    title: 'Rozlosování 2026/2027 (tabulka)',
    note: 'Totéž v Excelu pro vlastní úpravy',
    kind: 'xlsx',
    bytes: 19774,
  },
  {
    file: 'zapis-utkani-2026-1-strana.pdf',
    title: 'Zápis utkání — přední strana',
    note: 'Sestavy, přehled 17 zápasů a skóre',
    kind: 'pdf',
    bytes: 126860,
  },
  {
    file: 'zapis-utkani-2026-2-strana.pdf',
    title: 'Zápis utkání — zadní strana',
    note: 'Nálety 95+/133+/170+, asfalty a zavření',
    kind: 'pdf',
    bytes: 126946,
  },
  {
    file: 'pravidla-hsl-2026.pdf',
    title: 'Pravidla HŠL',
    note: 'Platná od 30. 8. 2024, aktualizace 19. 8. 2026',
    kind: 'pdf',
    bytes: 30423,
  },
  {
    file: 'prihlaska-do-ligy.xls',
    title: 'Přihláška do ligy',
    note: 'Formulář pro registraci týmu na novou sezónu',
    kind: 'xls',
    bytes: 181760,
  },
];

export const docUrl = (file: string) => `/dokumenty/${file}`;

export function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} kB`;
}
