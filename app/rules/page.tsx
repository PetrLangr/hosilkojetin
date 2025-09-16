import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Users, 
  Trophy, 
  Shield, 
  DollarSign,
  Calendar,
  FileText,
  Phone,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="text-center py-12 bg-gradient-to-br from-slate-50 via-white to-rose-50 rounded-3xl border border-gray-100">
        <div className="mb-6">
          <Badge className="bg-primary text-white px-4 py-2 text-sm font-semibold">
            OFICIÁLNÍ PRAVIDLA
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          PRAVIDLA
          <br />
          <span className="text-primary">HŠL</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
          Kompletní pravidla a podmínky Hospodské Šipkové Ligy platná od 30.8.2024
        </p>
      </section>

      {/* Quick Navigation */}
      <section className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-semibold" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na domovskou stránku
            </Link>
          </Button>
        </div>

        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rychlá navigace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <a href="#podmínky" className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="font-semibold text-slate-900">Podmínky účasti</div>
                <div className="text-sm text-slate-600">Registrace a poplatky</div>
              </a>
              <a href="#sportovni" className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="font-semibold text-slate-900">Sportovní pravidla</div>
                <div className="text-sm text-slate-600">Herní pravidla a prostory</div>
              </a>
              <a href="#soutez" className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="font-semibold text-slate-900">Systém soutěže</div>
                <div className="text-sm text-slate-600">Utkání a bodování</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto space-y-8">
        
        {/* Liga Info */}
        <Card id="liga" className="rounded-2xl bg-gradient-to-br from-primary/5 via-white to-accent/5 border border-primary/10 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6" />
              Ligová soutěž klubů hospodské šipkové ligy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-slate-700 leading-relaxed">
              Ligová soutěž Klubů hospodské šipkové ligy je rozdělena do dvou částí: <strong>podzimní a jarní</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card id="podmínky" className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6" />
              Podmínky k účasti v soutěži
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-slate-700">Soutěže se může zúčastnit každý řádně přihlášený klub</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-slate-700">Do soutěže bude přihlášen klub na základě řádně vyplněné přihlášky. Spolu s touto přihláškou je nutné uhradit registrační poplatek <strong>2.000 Kč</strong> za družstvo</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-slate-700">Počet klubů na domácí půdě není omezen</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Tým
              </h4>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                  Tým tvoří <strong>minimálně 3 hráči, maximálně 10 hráčů</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                  Dopsat hráče po začátku sezóny: poplatek <strong>200 Kč</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                  Nový hráč může nastoupit k následujícímu zápasu po zapsání na soupisku
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                  Týmy se můžou dohodnout na přeložení zápasu (3 pracovní dny předem)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Fees */}
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <DollarSign className="h-6 w-6" />
              Registrační poplatky
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                <div className="text-center">
                  <div className="text-3xl font-black text-primary mb-2">2.000 Kč</div>
                  <div className="font-bold text-slate-900">Za klub na sezónu</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-6 border border-accent/20">
                <div className="text-center">
                  <div className="text-3xl font-black text-accent mb-2">200 Kč</div>
                  <div className="font-bold text-slate-900">Za hráče v průběhu sezóny</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sports Rules */}
        <Card id="sportovni" className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6" />
              Sportovní pravidla HŠL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border">
              <h4 className="font-black text-slate-900 mb-4">A. Obecná ustanovení</h4>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Soutěže družstev se hrají podle předem stanovených sportovních pravidel a soutěžního řádu HŠL
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Domácí družstvo musí zajistit <strong>minimálně 6 míst k sezení</strong> s výhledem na terč
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Domácí tým musí umožnit hostům <strong>15 minut</strong> před utkáním přístup k terči k tréninku
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Čekací doba na tým je <strong>30 minut</strong>
                </li>
              </ul>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <h5 className="font-bold text-blue-900 mb-2">Leg</h5>
                <p className="text-sm text-blue-800">Jedna konkrétní hra, složená z několika kol mezi hráči</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                <h5 className="font-bold text-green-900 mb-2">Zápas</h5>
                <p className="text-sm text-green-800">Odehrání předem stanoveného počtu legů mezi hráči</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <h5 className="font-bold text-purple-900 mb-2">Utkání</h5>
                <p className="text-sm text-purple-800">Odehrání předem stanoveného počtu zápasů mezi týmy</p>
              </div>
            </div>

            <div className="bg-warning/10 rounded-2xl p-6 border border-warning/30">
              <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-warning" />
                Zdravotní zóna
              </h4>
              <p className="text-slate-700 mb-2">
                <strong>Území, ve kterém je při utkání zakázáno kouření.</strong>
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• DO = double out - ukončování hry dvojnásobným polem</li>
                <li>• DIN = double in - zahájení hry dvojnásobným polem</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Playing Space */}
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5" />
              Hrací prostor a technické požadavky
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Rozměry hracího prostoru</h4>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Vzdálenost za hrací čárou: <strong>min 80 cm</strong></li>
                  <li>• Vzdálenost od terče: <strong>3,60 m</strong></li>
                  <li>• Šířka hracího prostoru: <strong>min 1,2 m</strong></li>
                  <li>• Výška místnosti: <strong>min 2,30 m</strong></li>
                  <li>• Vzdálenost od boční stěny: <strong>min 80 cm</strong></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Terč a čára hodu</h4>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Výška středu terče: <strong>1,73 m (±1,5 cm)</strong></li>
                  <li>• Úhlopříčná vzdálenost: <strong>2,935 m</strong></li>
                  <li>• Kolmá vzdálenost: <strong>2,37 m</strong></li>
                  <li>• Šířka čáry hodu: <strong>min 25 cm</strong></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-5 w-5" />
              Herní pravidla
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6">
              <h4 className="font-black text-slate-900 mb-4">Základní pravidla hodu</h4>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Pro každé kolo má hráč k dispozici <strong>maximálně 3 šipky</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Hod se provádí <strong>vstoje</strong> (výjimka jen při zdravotním handicapu)
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Šipka mimo terč se považuje za <strong>uskutečněný hod</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Hráč si musí před hodem <strong>překontrolovat správné nastavení</strong> přístroje
                </li>
              </ul>
            </div>

            <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
              <h4 className="font-black text-slate-900 mb-4">Rozhoz na střed</h4>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                  Hráč má k dispozici <strong>max. 3 šipky</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                  Platí <strong>první zabodnutá šipka</strong> - další už nesmí hávet
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                  Vítězí hráč s šipkou <strong>blíže středu terče</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                  Při stejné vzdálenosti nebo oba červený/modrý střed: <strong>rozhazuje se znovu</strong>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Competition System */}
        <Card id="soutez" className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6" />
              Systém ligové soutěže
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border">
              <h4 className="font-black text-slate-900 mb-4">Ligové utkání HŠL</h4>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                  K utkání nastupují <strong>3 hráči základní sestavy + až 3 náhradníci</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                  Výjimečně může nastoupit jen <strong>2 hráči</strong> (třetí pozice je neobsazena)
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                  Utkání se skládá z <strong>9 zápasů jednotlivců + 6 zápasů teamů</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                  Základní hra: <strong>501 Double Out na 2 vítězné legy</strong>
                </li>
              </ul>
            </div>

            <div className="bg-warning/10 rounded-2xl p-6 border border-warning/30">
              <h4 className="font-black text-slate-900 mb-4">Speciální hry</h4>
              <div className="grid gap-4">
                <div>
                  <h5 className="font-bold text-slate-900 mb-2">Cricket Cut Throat</h5>
                  <p className="text-slate-700 text-sm">Hraje se <strong>15 kol</strong> na dva displeje. Vítězem jsou hráči, kteří uzavřou všechna čísla a mají stejně nebo méně bodů než soupeř.</p>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 mb-2">301 DIN/DO (3v3)</h5>
                  <p className="text-slate-700 text-sm">Hraje se na <strong>2 vítězné legy</strong>, každý má svůj displej. Maximální počet kol je 10, pak rozhoz na střed.</p>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 mb-2">701 DO (vláček)</h5>
                  <p className="text-slate-700 text-sm">Hra na <strong>1 leg</strong>, tři proti třem na 1 displej. Maximální počet kol je 20, pak rozhoz na střed.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring */}
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-5 w-5" />
              Bodové hodnocení
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                <div className="text-2xl font-black text-green-600">3</div>
                <div className="text-xs font-semibold text-green-800">VÍTĚZSTVÍ</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                <div className="text-2xl font-black text-blue-600">2</div>
                <div className="text-xs font-semibold text-blue-800">VÝHRA V PRODL.</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 text-center border border-yellow-100">
                <div className="text-2xl font-black text-yellow-600">1</div>
                <div className="text-xs font-semibold text-yellow-800">REMÍZA</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                <div className="text-2xl font-black text-gray-600">0</div>
                <div className="text-xs font-semibold text-gray-800">PROHRA</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                <div className="text-2xl font-black text-red-600">-3</div>
                <div className="text-xs font-semibold text-red-800">KONTUMACE</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100 mt-6">
              <h4 className="font-bold text-slate-900 mb-3">Pořadí v tabulce</h4>
              <ol className="space-y-2 text-slate-700">
                <li>1. <strong>Body</strong></li>
                <li>2. <strong>Vzájemný zápas</strong></li>
                <li>3. <strong>Skóre (rozdíl legů)</strong></li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Captain Rules */}
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5" />
              Kapitán družstva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                <h4 className="font-black text-slate-900 mb-4">Povinnosti kapitána</h4>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    Společně s kapitánem soupeře <strong>řídí ligové utkání a plní funkci rozhodčího</strong>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    Určuje <strong>nasazení hráčů</strong> svého družstva do zápisu
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    Je <strong>přítomen po celý průběh</strong> utkání nebo určí zástupce
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <strong>Zodpovídá za správnost</strong> zápisu z utkání
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    Zápis musí <strong>poslat do neděle 12:00</strong> po skončení zápasu
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfers */}
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5" />
              Přestupový řád
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h4 className="font-bold text-green-900 mb-4">Bezplatné přestupy</h4>
                <ul className="space-y-2 text-green-800 text-sm">
                  <li>• Po skončení kalendářního ročníku</li>
                  <li>• Letní termín: <strong>1.5. - 31.8.</strong></li>
                </ul>
              </div>
              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-4">Zpoplatněné přestupy</h4>
                <ul className="space-y-2 text-orange-800 text-sm">
                  <li>• Po podzimní části do <strong>31.12.</strong></li>
                  <li>• Poplatek: <strong>100 Kč</strong></li>
                  <li>• Hráč může přestoupit <strong>pouze jednou za sezónu</strong></li>
                </ul>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center">
              <h4 className="font-bold text-red-900 mb-2">Hostování</h4>
              <p className="text-red-800 font-medium">Hostování není povoleno</p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Rules */}
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5" />
              Ostatní podmínky
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Změny v sezóně</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h5 className="font-semibold text-slate-900 mb-2">Změna názvu týmu</h5>
                  <p className="text-sm text-slate-700">Mimo sezónu: <strong>0 Kč</strong></p>
                  <p className="text-sm text-slate-700">V sezóně: <strong>500 Kč</strong></p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h5 className="font-semibold text-slate-900 mb-2">Změna hracího místa</h5>
                  <p className="text-sm text-slate-700">Mimo sezónu: <strong>0 Kč</strong></p>
                  <p className="text-sm text-slate-700">V sezóně: <strong>500 Kč</strong></p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <h4 className="font-black text-slate-900 mb-4">Dodatečná pravidla</h4>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Na soupisce může být <strong>maximálně jeden extraligový hráč</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Credity na zápas vždy platí <strong>domácí tým</strong>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Občerstvení připravuje <strong>domácí tým pro hosty</strong> (netýká se alkoholu)
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  Každý tým daruje cenu na ukončenou v hodnotě <strong>500 Kč</strong>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Final Provisions */}
        <Card className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-gray-100 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5" />
              Závěrečná ustanovení
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-slate-600 mt-2 flex-shrink-0"></div>
                <p className="text-slate-700">HŠL si vyhrazuje právo v průběhu sezóny <strong>změnit, upravit či doplnit pravidla</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-slate-600 mt-2 flex-shrink-0"></div>
                <p className="text-slate-700">Doplňující krajská pravidla budou v souladu s <strong>principem Fair Play</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-slate-600 mt-2 flex-shrink-0"></div>
                <p className="text-slate-700">Pravidla byla aktualizována <strong>30.8.2024</strong></p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-6 text-white mt-6">
              <div className="text-center">
                <h4 className="font-black text-white mb-3 flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  Kontakt na ředitele soutěže
                </h4>
                <div className="text-lg font-bold">Ladislav Kučírek</div>
                <div className="text-white/90">777 852 277</div>
                <p className="text-sm text-white/80 mt-2">
                  Pro jakékoliv dotazy nebo nejasnosti v průběhu ligy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to site */}
        <div className="text-center py-12">
          <Button asChild className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold px-8 py-4 text-lg">
            <Link href="/">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Zpět na domovskou stránku
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}