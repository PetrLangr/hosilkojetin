/**
 * Nekonečný pás partnerů ligy.
 *
 * Loga jedou pořád dokola a jsou trvale přitlumená (odbarvená a průhlednější),
 * aby nepřetahovala pozornost z výsledků. Žádná reakce na myš — pás jede pořád
 * stejně. Celé je to čisté CSS, žádný stav ani klientský kód.
 */

const partners = [
  { name: "Pizza Markýz", src: "/sponzor-pizza-markyz.png" },
  { name: "Opprimendi", src: "/partners/opprimendi.png" },
  { name: "Stavitelství Vymlátil", src: "/partners/vymlatil.png" },
  { name: "Adam velkoobchod Šternberk", src: "/partners/adam.png" },
  { name: "Koli", src: "/partners/koli.png" },
  { name: "Sportbar Baďa", src: "/partners/bada.png" },
  { name: "Pronájem šipkových terčů — Roman Šmudla", src: "/partners/pronajem-tercu.png" },
  { name: "Pohřební služba Makový Pavel", src: "/partners/makovy-pavel.png" },
];

export function PartnersMarquee() {
  return (
    <section
      aria-label="Partneři ligy"
      className="overflow-hidden rounded-lg border border-border bg-white"
    >
      <div className="flex items-center gap-4 px-4 pt-3">
        <span className="label-muted shrink-0">Partneři ligy</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* marquee = maska okrajů, track = samotná animace */}
      <div className="marquee py-3">
        <div
          className="marquee-track flex w-max items-center"
          style={{ ["--marquee-duration" as string]: "45s" }}
        >
          {/* Dvě totožné kopie za sebou; posun o polovinu šířky navazuje beze švu.
              Druhá je pro čtečky skrytá, ať partnery nehlásí dvakrát. */}
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="flex items-center"
              aria-hidden={copy === 1 ? true : undefined}
            >
              {partners.map((partner) => (
                <li key={partner.name} className="px-6 sm:px-8">
                  <img
                    src={partner.src}
                    alt={copy === 0 ? partner.name : ""}
                    className="h-9 w-auto max-w-[160px] object-contain opacity-55 grayscale-[0.45] sm:h-10"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
