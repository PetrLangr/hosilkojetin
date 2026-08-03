import Link from "next/link";
import { Download, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { docUrl } from "@/lib/league-files";

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

const SECTIONS = [
  { id: "podminky", label: "Podmínky účasti" },
  { id: "poplatky", label: "Poplatky" },
  { id: "sportovni", label: "Sportovní pravidla" },
  { id: "prostor", label: "Hrací prostor" },
  { id: "herni", label: "Herní pravidla" },
  { id: "soutez", label: "Systém soutěže" },
  { id: "body", label: "Bodování" },
  { id: "kapitan", label: "Kapitán" },
  { id: "prestupy", label: "Přestupy" },
  { id: "ostatni", label: "Ostatní podmínky" },
  { id: "zaver", label: "Závěrečná ustanovení" },
];

export default function RulesPage() {
  return (
    <div>
      <PageHeader
        title="Pravidla"
        subtitle="Hospodská šipková liga · platná od 30. 8. 2024"
        actions={
          <a
            href={docUrl("pravidla-hsl-2024.doc")}
            download
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Stáhnout jako DOC
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
            Ligová soutěž Klubů hospodské šipkové ligy je rozdělena do dvou částí:{" "}
            <strong>podzimní a jarní</strong>.
          </p>

          <Section id="podminky" title="Podmínky k účasti v soutěži">
            <List
              items={[
                "Soutěže se může zúčastnit každý řádně přihlášený klub",
                <>
                  Do soutěže bude přihlášen klub na základě řádně vyplněné přihlášky. Spolu s touto
                  přihláškou je nutné uhradit registrační poplatek <strong>2 000 Kč</strong> za družstvo
                </>,
                "Počet klubů na domácí půdě není omezen",
              ]}
            />

            <Sub>Tým</Sub>
            <List
              items={[
                <>
                  Tým tvoří <strong>minimálně 3 hráči, maximálně 10 hráčů</strong>
                </>,
                <>
                  Dopsat hráče po začátku sezóny: poplatek <strong>200 Kč</strong>
                </>,
                "Nový hráč může nastoupit k následujícímu zápasu po zapsání na soupisku",
                "Týmy se můžou dohodnout na přeložení zápasu (3 pracovní dny předem)",
              ]}
            />

            <p className="text-xs text-muted-foreground">
              Přihlášku ke stažení najdete v{" "}
              <Link href="/contact" className="underline hover:text-primary">
                kontaktech
              </Link>
              .
            </p>
          </Section>

          <Section id="poplatky" title="Registrační poplatky">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div className="rounded border border-border bg-muted px-3 py-2">
                <dt className="label-muted">Za klub na sezónu</dt>
                <dd className="tnum text-base font-bold text-slate-900">2 000 Kč</dd>
              </div>
              <div className="rounded border border-border bg-muted px-3 py-2">
                <dt className="label-muted">Za hráče v průběhu sezóny</dt>
                <dd className="tnum text-base font-bold text-slate-900">200 Kč</dd>
              </div>
            </dl>
          </Section>

          <Section id="sportovni" title="Sportovní pravidla HŠL">
            <Sub>A. Obecná ustanovení</Sub>
            <List
              items={[
                "Soutěže družstev se hrají podle předem stanovených sportovních pravidel a soutěžního řádu HŠL",
                <>
                  Domácí družstvo musí zajistit <strong>minimálně 6 míst k sezení</strong> s výhledem na terč
                </>,
                <>
                  Domácí tým musí umožnit hostům <strong>15 minut</strong> před utkáním přístup k terči k tréninku
                </>,
                <>
                  Čekací doba na tým je <strong>30 minut</strong>
                </>,
              ]}
            />

            <Sub>Pojmy</Sub>
            <dl className="grid gap-2 sm:grid-cols-3">
              {[
                ["Leg", "Jedna konkrétní hra, složená z několika kol mezi hráči"],
                ["Zápas", "Odehrání předem stanoveného počtu legů mezi hráči"],
                ["Utkání", "Odehrání předem stanoveného počtu zápasů mezi týmy"],
              ].map(([term, def]) => (
                <div key={term} className="rounded border border-border bg-muted px-3 py-2">
                  <dt className="text-xs font-semibold text-slate-900">{term}</dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{def}</dd>
                </div>
              ))}
            </dl>

            <Sub>Zdravotní zóna</Sub>
            <p>
              <strong>Území, ve kterém je při utkání zakázáno kouření.</strong>
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>DO = double out — ukončování hry dvojnásobným polem</li>
              <li>DIN = double in — zahájení hry dvojnásobným polem</li>
            </ul>
          </Section>

          <Section id="prostor" title="Hrací prostor a technické požadavky">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Sub>Rozměry hracího prostoru</Sub>
                <dl className="mt-1 space-y-1">
                  {[
                    ["Vzdálenost za hrací čárou", "min. 80 cm"],
                    ["Vzdálenost od terče", "3,60 m"],
                    ["Šířka hracího prostoru", "min. 1,2 m"],
                    ["Výška místnosti", "min. 2,30 m"],
                    ["Vzdálenost od boční stěny", "min. 80 cm"],
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
                    ["Výška středu terče", "1,73 m (±1,5 cm)"],
                    ["Úhlopříčná vzdálenost", "2,935 m"],
                    ["Kolmá vzdálenost", "2,37 m"],
                    ["Šířka čáry hodu", "min. 25 cm"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-border pb-1 text-xs last:border-0">
                      <dt className="text-slate-600">{k}</dt>
                      <dd className="tnum shrink-0 font-semibold text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Section>

          <Section id="herni" title="Herní pravidla">
            <Sub>Základní pravidla hodu</Sub>
            <List
              items={[
                <>
                  Pro každé kolo má hráč k dispozici <strong>maximálně 3 šipky</strong>
                </>,
                <>
                  Hod se provádí <strong>vstoje</strong> (výjimka jen při zdravotním handicapu)
                </>,
                <>
                  Šipka mimo terč se považuje za <strong>uskutečněný hod</strong>
                </>,
                <>
                  Hráč si musí před hodem <strong>překontrolovat správné nastavení</strong> přístroje
                </>,
              ]}
            />

            <Sub>Rozhoz na střed</Sub>
            <List
              items={[
                <>
                  Hráč má k dispozici <strong>max. 3 šipky</strong>
                </>,
                <>
                  Platí <strong>první zabodnutá šipka</strong> — další už nesmí házet
                </>,
                <>
                  Vítězí hráč s šipkou <strong>blíže středu terče</strong>
                </>,
                <>
                  Při stejné vzdálenosti nebo oba červený/modrý střed: <strong>rozhazuje se znovu</strong>
                </>,
              ]}
            />
          </Section>

          <Section id="soutez" title="Systém ligové soutěže">
            <Sub>Ligové utkání HŠL</Sub>
            <List
              items={[
                <>
                  K utkání nastupují <strong>3 hráči základní sestavy + až 3 náhradníci</strong>
                </>,
                <>
                  Výjimečně můžou nastoupit jen <strong>2 hráči</strong> (třetí pozice je neobsazena)
                </>,
                <>
                  Utkání se skládá z <strong>9 zápasů jednotlivců + 6 zápasů týmů</strong>
                </>,
                <>
                  Základní hra: <strong>501 Double Out na 2 vítězné legy</strong>
                </>,
              ]}
            />

            <Sub>Speciální hry</Sub>
            <dl className="space-y-2">
              {[
                [
                  "Cricket Cut Throat",
                  <>
                    Hraje se <strong>15 kol</strong> na dva displeje. Vítězem jsou hráči, kteří uzavřou
                    všechna čísla a mají stejně nebo méně bodů než soupeř.
                  </>,
                ],
                [
                  "301 DIN/DO (3v3)",
                  <>
                    Hraje se na <strong>2 vítězné legy</strong>, každý má svůj displej. Maximální počet
                    kol je 10, pak rozhoz na střed.
                  </>,
                ],
                [
                  "701 DO (vláček)",
                  <>
                    Hra na <strong>1 leg</strong>, tři proti třem na 1 displej. Maximální počet kol je
                    20, pak rozhoz na střed.
                  </>,
                ],
              ].map(([term, def], i) => (
                <div key={i} className="rounded border border-border bg-muted px-3 py-2">
                  <dt className="text-xs font-semibold text-slate-900">{term}</dt>
                  <dd className="mt-0.5 text-xs text-slate-600">{def}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="body" title="Bodové hodnocení">
            <dl className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {[
                ["3", "Vítězství", "text-success"],
                ["2", "Výhra v prodl.", "text-slate-900"],
                ["1", "Remíza", "text-slate-900"],
                ["0", "Prohra", "text-muted-foreground"],
                ["−3", "Kontumace", "text-destructive"],
              ].map(([value, label, tone]) => (
                <div key={label} className="rounded border border-border bg-muted px-2 py-2 text-center">
                  <dt className={`tnum text-lg font-bold ${tone}`}>{value}</dt>
                  <dd className="label-muted">{label}</dd>
                </div>
              ))}
            </dl>

            <Sub>Pořadí v tabulce</Sub>
            <ol className="space-y-1 text-sm">
              <li>1. <strong>Body</strong></li>
              <li>2. <strong>Vzájemný zápas</strong></li>
              <li>3. <strong>Skóre (rozdíl legů)</strong></li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Aktuální pořadí najdete v{" "}
              <Link href="/standings" className="underline hover:text-primary">
                tabulce
              </Link>
              .
            </p>
          </Section>

          <Section id="kapitan" title="Kapitán družstva">
            <Sub>Povinnosti kapitána</Sub>
            <List
              items={[
                <>
                  Společně s kapitánem soupeře <strong>řídí ligové utkání a plní funkci rozhodčího</strong>
                </>,
                <>
                  Určuje <strong>nasazení hráčů</strong> svého družstva do zápisu
                </>,
                <>
                  Je <strong>přítomen po celý průběh</strong> utkání nebo určí zástupce
                </>,
                <>
                  <strong>Zodpovídá za správnost</strong> zápisu z utkání
                </>,
                <>
                  Zápis musí <strong>poslat do neděle 12:00</strong> po skončení zápasu
                </>,
              ]}
            />
          </Section>

          <Section id="prestupy" title="Přestupový řád">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded border border-border bg-muted px-3 py-2">
                <p className="label-muted mb-1">Bezplatné přestupy</p>
                <ul className="space-y-1 text-xs text-slate-700">
                  <li>Po skončení kalendářního ročníku</li>
                  <li>
                    Letní termín: <strong>1. 5. – 31. 8.</strong>
                  </li>
                </ul>
              </div>
              <div className="rounded border border-border bg-muted px-3 py-2">
                <p className="label-muted mb-1">Zpoplatněné přestupy</p>
                <ul className="space-y-1 text-xs text-slate-700">
                  <li>
                    Po podzimní části do <strong>31. 12.</strong>
                  </li>
                  <li>
                    Poplatek: <strong>100 Kč</strong>
                  </li>
                  <li>
                    Hráč může přestoupit <strong>pouze jednou za sezónu</strong>
                  </li>
                </ul>
              </div>
            </div>
            <p className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
              Hostování není povoleno.
            </p>
          </Section>

          <Section id="ostatni" title="Ostatní podmínky">
            <Sub>Změny v sezóně</Sub>
            <dl className="grid gap-2 sm:grid-cols-2">
              {["Změna názvu týmu", "Změna hracího místa"].map((label) => (
                <div key={label} className="rounded border border-border bg-muted px-3 py-2">
                  <dt className="text-xs font-semibold text-slate-900">{label}</dt>
                  <dd className="mt-0.5 text-xs text-slate-600">
                    Mimo sezónu <strong>0 Kč</strong> · v sezóně <strong>500 Kč</strong>
                  </dd>
                </div>
              ))}
            </dl>

            <Sub>Dodatečná pravidla</Sub>
            <List
              items={[
                <>
                  Na soupisce může být <strong>maximálně jeden extraligový hráč</strong>
                </>,
                <>
                  Credity na zápas vždy platí <strong>domácí tým</strong>
                </>,
                <>
                  Občerstvení připravuje <strong>domácí tým pro hosty</strong> (netýká se alkoholu)
                </>,
                <>
                  Každý tým daruje cenu na ukončenou v hodnotě <strong>500 Kč</strong>
                </>,
              ]}
            />
          </Section>

          <Section id="zaver" title="Závěrečná ustanovení">
            <List
              items={[
                <>
                  HŠL si vyhrazuje právo v průběhu sezóny{" "}
                  <strong>změnit, upravit či doplnit pravidla</strong>
                </>,
                <>
                  Doplňující krajská pravidla budou v souladu s <strong>principem Fair Play</strong>
                </>,
                <>
                  Pravidla byla aktualizována <strong>30. 8. 2024</strong>
                </>,
              ]}
            />

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded border border-border bg-muted px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Phone className="h-3.5 w-3.5 text-primary" />
                Ředitel soutěže
              </span>
              <span className="text-sm font-medium text-slate-900">Ladislav Kučírek</span>
              <a href="tel:+420777852277" className="tnum text-sm text-primary hover:underline">
                777 852 277
              </a>
              <span className="text-xs text-muted-foreground">
                pro dotazy a nejasnosti v průběhu ligy
              </span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
