import Link from 'next/link';
import { Target } from 'lucide-react';

/** Odkazy odpovídají hlavní navigaci — dřív mířily i na zrušený žebříček hráčů
    a dvakrát na rozpis pod různými názvy. */
const LINKS = [
  { href: '/', label: 'Domů' },
  { href: '/schedule', label: 'Zápasy' },
  { href: '/standings', label: 'Tabulka' },
  { href: '/teams', label: 'Týmy' },
  { href: '/archiv', label: 'Archiv' },
  { href: '/contact', label: 'Kontakt' },
];

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="tnum text-3xl font-bold text-slate-900">404</span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-900">Stránka nenalezena</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Asfalt. Adresa možná zanikla nebo se překlepla — zkuste některou z hlavních sekcí.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-primary hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
