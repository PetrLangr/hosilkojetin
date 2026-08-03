"use client";

import { useEffect, useState } from "react";
import { CalendarRange, History } from "lucide-react";

export interface SeasonOption {
  id: string;
  name: string;
  isActive: boolean;
  isArchived: boolean;
  pointsSystem: string;
  archiveNote: string | null;
}

interface Props {
  value: string | null;
  onChange: (season: SeasonOption) => void;
}

export function SeasonSwitcher({ value, onChange }: Props) {
  const [seasons, setSeasons] = useState<SeasonOption[]>([]);

  useEffect(() => {
    fetch("/api/seasons")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SeasonOption[]) => {
        setSeasons(data);
        if (value) return;
        // ?season= v URL má přednost, aby prokliky z /archiv otevřely správnou sezónu;
        // jinak startujeme na aktivní — stejně jako se chovají API bez parametru
        const wanted = new URLSearchParams(window.location.search).get("season");
        const picked =
          (wanted && data.find((s) => s.id === wanted || s.name === wanted)) ||
          data.find((s) => s.isActive) ||
          data[0];
        if (picked) onChange(picked);
      })
      .catch(() => setSeasons([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (seasons.length === 0) return null;

  // Jedenáct sezón jako pilulky se lámalo do dvou řad a zabíralo víc místa než
  // samotná tabulka. Rozbalovací pole má konstantní výšku a vejde se do hlavičky.
  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">Sezóna</span>
      <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
      <select
        value={value ?? ""}
        onChange={(e) => {
          const picked = seasons.find((s) => s.id === e.target.value);
          if (picked) onChange(picked);
        }}
        className="h-8 rounded-md border border-border bg-white pl-2 pr-7 text-sm font-medium text-slate-900 tnum hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {seasons.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
            {s.isActive ? " — aktuální" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ArchiveBanner({ season }: { season: SeasonOption }) {
  if (!season.isArchived) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
      <span className="flex items-center gap-1.5 font-semibold">
        <History className="h-3.5 w-3.5" />
        Archiv — konečná tabulka tak, jak ji liga vyhlásila
      </span>
      {season.archiveNote && <span className="text-amber-800/80">{season.archiveNote}</span>}
    </div>
  );
}
