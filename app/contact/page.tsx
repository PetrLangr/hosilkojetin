import Link from "next/link";
import {
  Mail,
  Phone,
  Facebook,
  MessageCircle,
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
  MapPin,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LEAGUE_DOCS, docUrl, formatBytes } from "@/lib/league-files";

const ICON = { xls: FileSpreadsheet, doc: FileText, odt: FileText, pdf: FileType } as const;
const COLOR = {
  xls: "text-emerald-600 bg-emerald-50",
  doc: "text-blue-600 bg-blue-50",
  odt: "text-blue-600 bg-blue-50",
  pdf: "text-rose-600 bg-rose-50",
} as const;

const FAQ = [
  {
    q: "Jak se zapojit do ligy?",
    a: "Vyplňte přihlášku výše a pošlete ji vedoucímu ligy. Rád vás provede zbytkem registrace.",
  },
  {
    q: "Kdy se hrají zápasy?",
    a: "Obvykle v sobotu v 15:00 nebo podle domluvy týmů. Přesné termíny jsou v rozpisu kol.",
  },
  {
    q: "Kde se hraje?",
    a: "V hospodách jednotlivých týmů. Hrací místa najdete u každého týmu v sekci Týmy.",
  },
  { q: "Potřebuji vlastní šipky?", a: "Ano, každý hráč si nosí své vlastní." },
];

/** Rámeček sekce — stejný tvar jako panely na ostatních stránkách. */
function Panel({
  title,
  note,
  icon,
  children,
}: {
  title: string;
  note?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex flex-wrap items-baseline gap-x-2 border-b border-border bg-muted px-3 py-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          {icon}
          {title}
        </h2>
        {note && <span className="text-[11px] text-muted-foreground">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function Person({
  role,
  name,
  value,
  href,
  action,
  icon,
}: {
  role: string;
  name: string;
  value: string;
  href: string;
  action: string;
  icon: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded bg-muted">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="label-muted block">{role}</span>
        <span className="block text-sm font-medium text-slate-900">{name}</span>
      </span>
      <a
        href={href}
        className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
      >
        {action}
      </a>
      <span className="hidden w-44 shrink-0 text-right text-xs text-muted-foreground sm:block">
        {value}
      </span>
    </li>
  );
}

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        title="Kontakt"
        subtitle="Hospodská šipková liga"
        actions={
          <a
            href="https://www.facebook.com/groups/764848670219258"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600"
          >
            <Facebook className="h-3.5 w-3.5" />
            Facebook skupina
          </a>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Panel title="Kdo vám pomůže" icon={<Phone className="h-4 w-4 text-primary" />}>
            <ul className="divide-y divide-border">
              <Person
                role="Vedoucí ligy"
                name="Ladislav Kučírek"
                value="777 852 277"
                href="tel:+420777852277"
                action="Volat"
                icon={<Phone className="h-4 w-4 text-primary" />}
              />
              <Person
                role="Technická podpora webu"
                name="Petr Langr"
                value="peet04@seznam.cz"
                href="mailto:peet04@seznam.cz"
                action="Napsat"
                icon={<Mail className="h-4 w-4 text-accent" />}
              />
              <li className="flex items-center gap-3 px-3 py-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded bg-muted">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="label-muted block">Kde ligu najdete</span>
                  <span className="block text-sm font-medium text-slate-900">
                    Chropyně, Kojetín, Kroměříž a okolí
                  </span>
                </span>
              </li>
            </ul>
          </Panel>

          {/* Živé formuláře — dřív byly schované v archivu mezi historickými soubory */}
          <Panel
            title="Dokumenty ke stažení"
            note="platné formuláře a pravidla"
            icon={<Download className="h-4 w-4 text-primary" />}
          >
            <ul className="divide-y divide-border">
              {LEAGUE_DOCS.map((d) => {
                const Icon = ICON[d.kind];
                return (
                  <li key={d.file}>
                    <a
                      href={docUrl(d.file)}
                      download
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50/50"
                    >
                      <span className={`grid size-7 shrink-0 place-items-center rounded ${COLOR[d.kind]}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-slate-900">
                          {d.title}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {d.note}
                        </span>
                      </span>
                      <span className="label-muted w-8 shrink-0 text-right">{d.kind}</span>
                      <span className="tnum w-14 shrink-0 text-right text-[11px] text-muted-foreground">
                        {formatBytes(d.bytes)}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
              Pravidla si můžete přečíst i{" "}
              <Link href="/rules" className="underline hover:text-primary">
                přímo na webu
              </Link>
              . Starší znění pravidel a rozlosování z minulých let jsou v{" "}
              <Link href="/archiv/dokumenty" className="underline hover:text-primary">
                archivu
              </Link>
              .
            </p>
          </Panel>
        </div>

        <Panel
          title="Časté dotazy"
          icon={<MessageCircle className="h-4 w-4 text-primary" />}
        >
          <dl className="divide-y divide-border">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="px-3 py-2.5">
                <dt className="text-sm font-medium text-slate-900">{q}</dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </div>
  );
}
