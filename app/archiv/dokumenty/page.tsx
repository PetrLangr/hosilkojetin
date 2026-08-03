"use client";

import Link from "next/link";
import { FileText, FileSpreadsheet, FileType, Download, ArrowLeft, Globe, ExternalLink, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  ARCHIVE_DOCS,
  ARCHIVE_PAGES,
  ARCHIVE_SEASON_PAGES,
  fileUrl,
  formatBytes,
} from "@/lib/archive-files";

const ICON = { xls: FileSpreadsheet, doc: FileText, odt: FileText, pdf: FileType } as const;
const COLOR = {
  xls: "text-emerald-600 bg-emerald-50",
  doc: "text-blue-600 bg-blue-50",
  odt: "text-blue-600 bg-blue-50",
  pdf: "text-rose-600 bg-rose-50",
} as const;

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

export default function ArchiveDocumentsPage() {
  const totalBytes = ARCHIVE_DOCS.reduce((a, d) => a + d.bytes, 0);

  return (
    <div>
      <PageHeader
        title="Původní web"
        subtitle={`${ARCHIVE_DOCS.length} dokumentů · ${ARCHIVE_PAGES.length + ARCHIVE_SEASON_PAGES.length} stránek · ${formatBytes(totalBytes)}`}
        actions={
          <Link
            href="/archiv"
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zpět na archiv
          </Link>
        }
      />

      <div className="space-y-4">
        <Panel
          title="Historické dokumenty"
          note="starší znění pravidel a rozlosování z minulých let"
          icon={<Download className="h-4 w-4 text-primary" />}
        >
          <ul className="divide-y divide-border">
            {ARCHIVE_DOCS.map((d) => {
              const Icon = ICON[d.kind];
              return (
                <li key={d.file}>
                  <a
                    href={fileUrl(d.file)}
                    download
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50/50"
                  >
                    <span className={`grid size-7 shrink-0 place-items-center rounded ${COLOR[d.kind]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-900">
                      {d.title}
                    </span>
                    <span className="hidden min-w-0 flex-1 truncate text-xs text-muted-foreground sm:block">
                      {d.note}
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
        </Panel>

        <Panel
          title="Stránky starého webu"
          note="v původní podobě, jen převedené do UTF-8 a bez reklam"
          icon={<Globe className="h-4 w-4 text-primary" />}
        >
          <ul className="divide-y divide-border">
            {ARCHIVE_PAGES.map((p) => (
              <li key={p.file}>
                <a
                  href={fileUrl(p.file)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50/50"
                >
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-900">
                    {p.title}
                  </span>
                  <span className="hidden min-w-0 flex-1 truncate text-xs text-muted-foreground sm:block">
                    {p.note}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2">
            <span className="label-muted mr-1">Sezónní stránky</span>
            {ARCHIVE_SEASON_PAGES.map((s) => (
              <a
                key={s.file}
                href={fileUrl(s.file)}
                target="_blank"
                rel="noreferrer"
                title={`Sezóna ${s.roman} (${s.season})`}
                className="tnum rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-primary"
              >
                {s.season}
              </a>
            ))}
          </div>
        </Panel>

        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-900">
            Výsledky a tabulky z těchto stránek jsou už naimportované v{" "}
            <Link href="/archiv" className="font-semibold underline hover:text-primary">
              archivu sezón
            </Link>
            . Tenhle snapshot je tu jako původní zdroj — obsahuje i věci, které se do databáze
            nepřenášejí, třeba znění pravidel nebo kontakty. Platnou přihlášku, zápis utkání
            a aktuální pravidla najdete v{" "}
            <Link href="/contact" className="font-semibold underline hover:text-primary">
              kontaktech
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
