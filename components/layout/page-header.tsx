import * as React from "react";

interface PageHeaderProps {
  title: string;
  /** Krátký doplněk za nadpisem — sezóna, počet položek, stav. */
  subtitle?: React.ReactNode;
  /** Ovládání vpravo (přepínač sezóny, filtry, tlačítka). */
  actions?: React.ReactNode;
  /** Pás pod nadpisem — upozornění, legenda, poznámka k archivu. */
  children?: React.ReactNode;
}

/**
 * Hlavička stránky: jeden řádek, nadpis vlevo, ovládání vpravo.
 *
 * Nahrazuje hero bloky, které zabíraly ~400 px na to, aby zopakovaly název
 * položky z navigace. Obsah stránky tak začíná hned pod lištou.
 */
export function PageHeader({ title, subtitle, actions, children }: PageHeaderProps) {
  return (
    <div className="mb-4 border-b border-border pb-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && (
            <span className="text-sm text-muted-foreground truncate">{subtitle}</span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
