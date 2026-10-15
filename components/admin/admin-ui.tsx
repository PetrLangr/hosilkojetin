"use client";

import * as React from "react";
import { AlertCircle, Loader2, X } from "lucide-react";

/**
 * Stavební kostky podstránek administrace. Hlavička "Správa ligy" a záložky
 * jsou v app/admin/layout.tsx — tady je jen to, co se opakuje uvnitř záložek.
 */

/** Řádek nad tabulkou: název sekce s počtem vlevo, filtry a akce vpravo. */
export function AdminToolbar({ title, meta, children }: {
  title: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {meta != null && <span className="text-sm text-muted-foreground tnum">{meta}</span>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** Rámeček kolem tabulky — stejný obrys jako tabulka ligy. */
export function TableFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">{children}</div>
  );
}

export function LoadingRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {children}
    </div>
  );
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-8 text-center text-xs text-muted-foreground">{children}</p>;
}

/** Chybová hláška z API. Dřív se chyby jen logovaly do konzole a akce tiše selhala. */
export function ErrorBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <div
      role="alert"
      className="mb-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
    >
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Zavřít" className="text-red-700 hover:text-red-900">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** Přepínač filtrů (segmenty) — kompaktnější než řada tlačítek. */
export function Segmented<T extends string>({ value, onChange, options }: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="inline-flex flex-wrap rounded-md border border-border bg-muted p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`h-7 rounded px-2.5 text-xs font-medium transition-colors ${
              active ? "bg-white text-slate-900 shadow-sm ring-1 ring-border" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {o.label}
            {o.count != null && (
              <span className={`ml-1.5 tnum ${active ? "text-muted-foreground" : "text-slate-400"}`}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Ikonové tlačítko v řádku tabulky. Tón "danger" jen pro mazání. */
export function RowAction({ label, onClick, tone = "default", children, disabled }: {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`grid size-7 place-items-center rounded-md text-slate-400 transition-colors disabled:opacity-40 ${
        tone === "danger" ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-muted hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

/** Popisek + pole formuláře v dialogu. */
export function Field({ label, htmlFor, hint, children }: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// Logo týmu se používá i mimo administraci — žije v components/team-mark.tsx.
export { TeamMark } from "@/components/team-mark";
