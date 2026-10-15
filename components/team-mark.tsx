"use client";

import * as React from "react";

/** Malé logo týmu v řádku. Při chybě obrázku ukáže zkratku. */
export function TeamMark({ name, shortName, logoUrl }: { name: string; shortName?: string; logoUrl: string }) {
  const [failed, setFailed] = React.useState(false);
  return (
    <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded border border-border bg-white">
      {failed ? (
        <span className="text-[9px] font-bold text-slate-500">
          {(shortName || name.split(" ").map((w) => w[0]).join("")).slice(0, 3).toUpperCase()}
        </span>
      ) : (
        <img src={logoUrl} alt="" className="h-full w-full object-contain" onError={() => setFailed(true)} />
      )}
    </span>
  );
}
