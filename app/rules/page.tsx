import Link from "next/link";
import { Download, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { docUrl } from "@/lib/league-files";

/**
 * Znění pravidel HŠL platné od 30. 8. 2024 s aktualizací 19. 8. 2026.
 * Přepis dokumentu public/dokumenty/pravidla-hsl-2026.pdf — když vedení ligy
 * vydá nové PDF, patří sem jen to, co v něm skutečně stojí. Stránka je jeho
 * čitelnější podoba, ne vlastní výklad.
 */

/** Oddíl pravidel — kotva pro obsah vlevo a stejný rámeček jako panely jinde. */
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 overflow-hidden rounded-lg border border-border bg-white">
      <h2 className="border-b border-border bg-muted px-3 py-2 text-sm font-semibold text-slate-900">
        {title}
      </h2>
      <div className="space-y-3 px-3 py-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

/** Odrážkový seznam. Pravidla jsou z velké části výčty, ať vypadají stejně. */
function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Podnadpis uvnitř oddílu. */
const Sub = ({ children }: { children: React.ReactNode }) => (
  <h3 className="label-muted pt-1">{children}</h3>
);

/** Dvojice pojem — vysvětlení v šedém rámečku. */
function Terms({ items, cols = "sm:grid-cols-3" }: { items: [string, React.ReactNode][]; cols?: string }) {
  return (
    <dl className={`grid gap-2 ${cols}`}>
      {items.map(([term, def]) => (
        <div key={term} className="rounded border border-border bg-muted px-3 py-2">
          <dt className="text-xs font-semibold text-slate-900">{term}</dt>
          <dd className="mt-0.5 text-xs text-slate-600">{def}</dd>
        </div>
      ))}
    </dl>
  );
}

const SECTIONS = [
  { id: "podminky", label: "Podmínky účasti" },
  { id: "poplatky", label: "Poplatky" },
  { id: "obecna", label: "Obecná ustanovení" },
  { id: "prostor", label: "Hrací prostor" },
  { id: "hod", label: "Pravidla hodu" },
  { id: "utkani", label: "Průběh utkání" },
  { id: "body", label: "Bodování" },
  { id: "kontumace", label: "Kontumace" },
  { id: "prestupy", label: "Přestupy a poplatky" },
  { id: "zaver", label: "Závěrečná ustanovení" },
];

export default function RulesPage() {
  return (
    <div>
      <PageHeader
        title="Pravidla"
        subtitle="Hospodská šipková liga · platná od 30. 8. 2024, aktualizace 19. 8. 2026"
        actions={
          <a
            href={docUrl("pravidla-hsl-2026.pdf")}
            download
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Stáhnout PDF
          </a>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Obsah — u dlouhého dokumentu je rychlejší než rolování */}
        <nav className="lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <p className="label-muted border-b border-border bg-muted px-3 py-2">Obsah</p>
            <ul className="flex flex-wrap gap-x-3 gap-y-0.5 p-2 lg:block">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded px-1 py-1 text-xs text-slate-600 hover:bg-muted hover:text-primary"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="space-y-4 lg:col-span-3">
          <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-slate-700">
            Ligová soutěž klubů Hospodské šipkové ligy je rozdělena do dvou částí:{" "}
            <strong>podzimní a zimní</strong>.
          </p>

          <Section id="podminky" title="Podmínky účasti v soutěži">
            <List
              items={[
                "Soutěže se může zúčastnit každý řádně přihlášený klub na základě vyplněné přihlášky.",
                "Počet klubů na domácí půdě není omezen.",
                <>
                  <strong>Složení týmu:</strong> tým tvoří minimálně 3 hráči. Maximální počet hráčů
                  není omezen.
                </>,
                <>
                  <strong>Dopsání hráče na soupisku:</strong> hráče lze dopsat i po začátku sezóny za
                  poplatek <strong>200 Kč</strong>. Zápis se provádí zprávou ve WhatsApp skupině
                  kapitánů a vyžaduje potvrzení vedením. Hráč může nastoupit k následujícímu zápasu po
                  schválení.
                </>,
                "Osobní údaje hráčů jsou uvedeny na přihlášce. Přihláškou se tým zavazuje respektovat pravidla HŠL.",
                "V případě zániku družstva jsou jeho hráči volní od data ohlášení ukončení činnosti.",
                <>
                  <strong>Přeložení zápasu:</strong> týmy se mohou dohodnout na přeložení zápasu.
                  Vyžaduje se souhlas obou kapitánů a nahlášení nejpozději 3 pracovní dny předem{" "}
                  <strong>(do středy 18:00)</strong> na WhatsApp kapitánů. Nedojde-li k dohodě, platí
                  původní termín dle rozlosování.
                </>,
              ]}
            />

            <p className="text-xs text-muted-foreground">
              Přihlášku ke stažení najdete v{" "}
              <Link href="/contact" className="underline hover:text-primary">
                kontaktech
              </Link>
              , termíny v{" "}
              <Link href="/schedule" className="underline hover:text-primary">
                rozpisu kol
              </Link>
              .
            </p>
          </Section>

          <Section id="poplatky" title="Registrační poplatky">
            <dl className="grid gap-2 sm:grid-cols-2">
              {[
                ["Za družstvo", "1 000 Kč"],
                ["Za každého hráče", "200 Kč"],
              ].map(([label, value]) => (
                <div key={label} className="rounded border border-border bg-muted px-3 py-2">
                  <dt className="label-muted">{label}</dt>
                  <dd className="tnum text-base font-bold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              Dopsání hráče v průběhu sezóny stojí 200 Kč, přestup po podzimní části 100 Kč a změna
              názvu týmu nebo hracího místa v sezóně 500 Kč — podrobnosti v oddílu{" "}
              <a href="#prestupy" className="underline hover:text-primary">
                Přestupy a poplatky
              </a>
              .
            </p>
          </Section>

          <Section id="obecna" title="Obecná ustanovení a pojmy">
            <List
              items={[
                "Soutěže družstev se hrají podle předem stanovených sportovních pravidel a soutěžního řádu HŠL schválených pro danou sezónu.",
                <>
                  <strong>Místa k sezení:</strong> domácí družstvo musí zajistit hostujícímu týmu
                  minimálně <strong>6 míst k sezení</strong> s přímým výhledem na terč.
                </>,
                <>
                  <strong>Trénink:</strong> domácí tým musí umožnit hostům přístup k terči alespoň{" "}
                  <strong>15 minut</strong> před utkáním. Při zpoždění hostů se tato lhůta úměrně
                  zkracuje či ruší.
                </>,
                <>
                  <strong>Čekací doba:</strong> nestanoví-li HŠL jinak, čekací doba na tým je{" "}
                  <strong>30 minut</strong>.
                </>,
              ]}
            />

            <Sub>Základní pojmy</Sub>
            <Terms
              items={[
                ["Leg", "Jedna konkrétní hra složená z několika kol. V jednom kole má hráč max. 3 hody šipkou."],
                ["Zápas", "Odehrání předem stanoveného počtu legů mezi hráči."],
                ["Utkání", "Odehrání předem stanoveného počtu zápasů mezi dvěma družstvy."],
                ["Zdravotní zóna", "Území hracího prostoru a okruh 2 metry od něj, ve kterém je platný zákaz kouření."],
                ["DO (Double Out)", "Ukončení hry dvojnásobným polem příslušné hodnoty."],
                ["DIN (Double In)", "Zahájení hry dvojnásobným polem příslušné hodnoty."],
              ]}
            />
          </Section>

          <Section id="prostor" title="Technické parametry a hrací prostor">
            <p>
              <strong>Šipkové přístroje:</strong> používají se výhradně přístroje schválené HŠL.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Sub>Rozměry hracího prostoru</Sub>
                <dl className="mt-1 space-y-1">
                  {[
                    ["Hloubka od zadní stěny", "min. 3,60 m"],
                    ["Za odhodovou čárou", "min. 80 cm"],
                    ["Šířka hracího prostoru", "min. 1,2 m"],
                    ["Bok přístroje od pevné stěny", "min. 80 cm"],
                    ["Výška stropu", "min. 2,30 m"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-border pb-1 text-xs last:border-0">
                      <dt className="text-slate-600">{k}</dt>
                      <dd className="tnum shrink-0 font-semibold text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <Sub>Terč a čára hodu</Sub>
                <dl className="mt-1 space-y-1">
                  {[
                    ["Výška středu terče", "1,73 m (±15 mm)"],
                    ["Úhlopříčná vzdálenost", "2,935 m"],
                    ["Kolmá vzdálenost", "2,37 m"],
                    ["Šířka čáry na obě strany", "min. 25 cm"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-border pb-1 text-xs last:border-0">
                      <dt className="text-slate-600">{k}</dt>
                      <dd className="tnum shrink-0 font-semibold text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <List
              items={[
                "Po vhození první šipky nelze hrací prostor reklamovat.",
                "Hráč na odhodové čáře nesmí stát — přešlapy si hlídají kapitáni.",
                <>
                  <strong>Zdravotní zóna:</strong> v průběhu zápasu je v hracím prostoru zakázáno
                  kouřit, konzumovat nápoje a jídlo. Na žádost kteréhokoliv účastníka je
                  rozhodčí/pořadatel povinen vyhlásit zdravotní zónu minimálně pro zápasy daného
                  hráče.
                </>,
              ]}
            />
          </Section>

          <Section id="hod" title="Pravidla hodu a rozhoz na střed">
            <Sub>Pravidla hodu</Sub>
            <List
              items={[
                <>
                  Každé kolo má hráč <strong>maximálně 3 šipky</strong>. Hází se postupně jednu po
                  druhé vlastní rukou vstoje (výjimkou je zdravotní handicap).
                </>,
                "Hod mimo terč nebo mimo přístroj se považuje za uskutečněný a odečítá se.",
                "Před sérií hodů je hráč povinen zkontrolovat správné nastavení přístroje. Odhodí-li šipku dříve nebo nezaznamená-li přístroj hod, lze ho zapsat jen se souhlasem soupeře nebo rozhodčího.",
                <>
                  Zapíše-li přístroj v jednom legu <strong>3× chybně</strong>, jde o poruchu a leg se
                  opakuje.
                </>,
                <>
                  Neoprávněná změna stavu na displeji (např. ruční odepsání), kterou nelze vrátit,
                  znamená <strong>prohru legu</strong>.
                </>,
                "Při záměně pořadí hráčů: upozorní-li se před odhozením hráče č. 2, nakredituje se nová hra a leg se opakuje. Pokud až po odhození hráče č. 2, leg se dohraje a k nápravě dojde v dalším legu.",
              ]}
            />

            <Sub>Rozhoz na střed (1 šipka)</Sub>
            <List
              items={[
                <>
                  Platí <strong>první zabodnutá šipka</strong> (max. 3 pokusy na zabodnutí). Vítězí
                  šipka bližší středu.
                </>,
                "Zasáhnou-li oba červený/modrý střed nebo jsou ve stejné vzdálenosti, rozhoz se opakuje v opačném pořadí.",
                "Nezabodne-li se hráči ani jedna ze 3 šipek, vyhrává soupeř, kterému se zabodne alespoň jedna. Nezabodne-li se ani druhému, rozhoz se opakuje.",
                "Vyražení zabodnuté šipky soupeře znamená opakování rozhozu. Šipky se vytahují až po vzájemné dohodě.",
                "Ve dvojicích a týmech hází vždy jeden zástupce; nerozhodne-li se, střídají je další hráči v opačném pořadí.",
              ]}
            />
          </Section>

          <Section id="utkani" title="Organizace a průběh ligového utkání">
            <Sub>Sestava</Sub>
            <List
              items={[
                <>
                  K utkání nastupují <strong>3 hráči základní sestavy a až 3 náhradníci</strong>.
                </>,
                <>
                  Výjimečně lze nastoupit ve <strong>2 hráčích</strong> — pozice č. 3 zůstane
                  neobsazena a její zápasy tým prohrává kontumačně{" "}
                  <strong>0:2 na legy / 0:1 na body</strong>.
                </>,
              ]}
            />

            <Sub>Skladba utkání — 17 zápasů</Sub>
            {/* Rozpis odpovídá formuláři zápisu (public/dokumenty/zapis-utkani-2026-1-strana.pdf).
                PDF pravidel uvádí 4 zápasy dvojic, zápis jich má 3 — platí zápis, podle
                kterého se utkání skutečně hraje. */}
            <Terms
              cols="sm:grid-cols-2"
              items={[
                ["9× jednotlivci", "501 DO na 2 vítězné legy"],
                ["3× dvojice", "501 DO na 2 vítězné legy"],
                ["3× dvojice Cricket Cut Throat", "Na 15 kol, 2 vítězné legy, hraje se na 2 displeje"],
                ["1× trojice 301 DIN/DO", "3 na 3, maximálně 10 kol"],
                ["1× trojice 701 DO „vláček“", "3 na 3 na 1 displej, 1 leg, maximálně 20 kol"],
              ]}
            />
            <p className="text-xs text-muted-foreground">
              Pořadí zápasů a nasazení hráčů (1D–3H, 2D–1H, …) najdete přímo ve formuláři
              zápisu.
            </p>

            <Sub>Kapitáni a střídání</Sub>
            <List
              items={[
                "Kapitáni plní funkci rozhodčích.",
                "Náhradník může střídat hráče i opakovaně, ale střídající hráč se může vrátit pouze na svou původní pozici.",
                "Po zápase oba kapitáni podepíší zápis.",
                <>
                  Domácí kapitán je povinen nahrát <strong>čitelnou fotku zápisu na WhatsApp do
                  neděle 12:00</strong>.
                </>,
              ]}
            />

            <p className="text-xs text-muted-foreground">
              Formulář zápisu (obě strany) je ke stažení v{" "}
              <Link href="/contact" className="underline hover:text-primary">
                kontaktech
              </Link>
              .
            </p>
          </Section>

          <Section id="body" title="Bodování a tabulky">
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["+3", "Vítězství v řádném čase", "text-success"],
                ["+2", "Výhra v prodloužení / doplňkové hře", "text-slate-900"],
                ["+1", "Remíza", "text-slate-900"],
                ["0", "Prohra", "text-muted-foreground"],
              ].map(([value, label, tone]) => (
                <div key={label} className="rounded border border-border bg-muted px-2 py-2 text-center">
                  <dt className={`tnum text-lg font-bold ${tone}`}>{value}</dt>
                  <dd className="label-muted">{label}</dd>
                </div>
              ))}
            </dl>

            <Sub>Určení pořadí v tabulce</Sub>
            <ol className="space-y-1 text-sm">
              <li>1. <strong>Počet bodů</strong></li>
              <li>2. <strong>Vzájemný zápas</strong> (minitabulka)</li>
              <li>3. <strong>Celkové skóre</strong></li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Aktuální pořadí najdete v{" "}
              <Link href="/standings" className="underline hover:text-primary">
                tabulce
              </Link>
              .
            </p>
          </Section>

          <Section id="kontumace" title="Kontumace a hrubé porušení pravidel">
            <dl className="grid gap-2 sm:grid-cols-3">
              {[
                ["1. kontumace v sezóně", "−3 body", "skóre 0:18"],
                ["2. kontumace v sezóně", "−6 bodů", "skóre 0:18"],
                ["3. kontumace v sezóně", "Vyloučení", "tým končí v soutěži"],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2">
                  <dt className="label-muted">{label}</dt>
                  <dd className="text-base font-bold text-destructive">{value}</dd>
                  <dd className="text-xs text-muted-foreground">{note}</dd>
                </div>
              ))}
            </dl>

            <Sub>Důvody ke kontumaci</Sub>
            <List
              items={[
                <>
                  <strong>Neoprávněný start:</strong> start neprověřeného či nezapsaného hráče, hráče
                  v trestu, nebo porušení limitu extraligových hráčů.
                </>,
                <>
                  <strong>Nenastoupení nebo opoždění:</strong> nedostavení se do 30 minut od začátku
                  bez dohody, nebo nástup v méně než 2 hráčích.
                </>,
                <>
                  <strong>Zápis z utkání:</strong> nenahrání fotky zápisu na WhatsApp do neděle 12:00
                  nebo svévolná manipulace s výsledky.
                </>,
                <>
                  <strong>Disciplinární přestupky:</strong> fyzické či závažné slovní napadení,
                  úmyslné poškození terče nebo manipulace s přístrojem.
                </>,
                <>
                  <strong>Organizační selhání:</strong> nezajištění hracího prostoru nebo odmítnutí
                  úhrady kreditů domácím týmem.
                </>,
              ]}
            />
          </Section>

          <Section id="prestupy" title="Přestupový řád, poplatky a ustanovení">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded border border-border bg-muted px-3 py-2">
                <p className="label-muted mb-1">Letní přestupní termín</p>
                <ul className="space-y-1 text-xs text-slate-700">
                  <li>
                    <strong>1. 5. – 31. 8.</strong>
                  </li>
                  <li>Zdarma</li>
                </ul>
              </div>
              <div className="rounded border border-border bg-muted px-3 py-2">
                <p className="label-muted mb-1">Po podzimní části</p>
                <ul className="space-y-1 text-xs text-slate-700">
                  <li>
                    Do <strong>31. 12.</strong>
                  </li>
                  <li>
                    Poplatek <strong>100 Kč</strong>
                  </li>
                </ul>
              </div>
            </div>
            <p className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
              Hráč může přestoupit pouze 1× za sezónu. Hostování není povoleno.
            </p>

            <Sub>Správní poplatky</Sub>
            <p>
              Změna názvu týmu nebo hracího místa v průběhu sezóny je zpoplatněna částkou{" "}
              <strong>500 Kč</strong>. Mimo sezónu nebo z důvodu vyšší moci zdarma.
            </p>

            <Sub>Dodatek L</Sub>
            <List
              items={[
                <>
                  Na soupisce může být <strong>maximálně 1 extraligový hráč</strong>, který musí mít
                  odehrány minimálně 2 sezóny v HŠL.
                </>,
                "Kredity a občerstvení (jídlo) chystá domácí tým.",
                <>
                  Každý tým daruje cenu na ukončenou v hodnotě <strong>500 Kč</strong> majiteli
                  hospody.
                </>,
              ]}
            />
          </Section>

          <Section id="zaver" title="Závěrečná ustanovení">
            <List
              items={[
                <>
                  HŠL si vyhrazuje právo v průběhu sezóny{" "}
                  <strong>změnit, upravit či doplnit pravidla</strong>.
                </>,
                <>
                  Doplňující krajská pravidla budou v souladu s{" "}
                  <strong>principem Fair Play</strong>.
                </>,
              ]}
            />

            <p>
              Jakékoliv dotazy nebo nejasnosti v průběhu ligy řešte přímo s ředitelem soutěže.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded border border-border bg-muted px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Phone className="h-3.5 w-3.5 text-primary" />
                Ředitel soutěže
              </span>
              <span className="text-sm font-medium text-slate-900">Michal Baďura</span>
              <a href="tel:+420608755050" className="tnum text-sm text-primary hover:underline">
                608 755 050
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Toto znění pravidel platí od 30. 8. 2024 s aktualizací z 19. 8. 2026. Závazná je{" "}
              <a href={docUrl("pravidla-hsl-2026.pdf")} download className="underline hover:text-primary">
                oficiální verze v PDF
              </a>
              . Další kontakty najdete v{" "}
              <Link href="/contact" className="underline hover:text-primary">
                kontaktech
              </Link>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
