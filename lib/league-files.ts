/**
 * Platné dokumenty ligy — přihláška, zápis utkání a aktuální pravidla.
 *
 * Leží v public/dokumenty/ zvlášť od snapshotu starého webu (public/stary-web/).
 * Dřív byly součástí archivu, ale archiv je historie; tohle jsou formuláře, které
 * kapitáni potřebují teď, proto patří ke kontaktům.
 */

export interface LeagueDoc {
  file: string;
  title: string;
  note: string;
  kind: 'xls' | 'doc' | 'pdf' | 'odt';
  bytes: number;
}

export const LEAGUE_DOCS: LeagueDoc[] = [
  {
    file: 'prihlaska-do-ligy.xls',
    title: 'Přihláška do ligy',
    note: 'Formulář pro registraci týmu na novou sezónu',
    kind: 'xls',
    bytes: 181760,
  },
  {
    file: 'zapis-utkani.xls',
    title: 'Zápis utkání',
    note: 'Oficiální formulář zápisu z utkání',
    kind: 'xls',
    bytes: 1052672,
  },
  {
    file: 'pravidla-hsl-2024.doc',
    title: 'Pravidla HŠL',
    note: 'Platná od 30. 8. 2024 — poslední verze',
    kind: 'doc',
    bytes: 65024,
  },
];

export const docUrl = (file: string) => `/dokumenty/${file}`;

export function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} kB`;
}
