import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Target,
  Facebook,
  MessageCircle
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="text-center py-12">
        <div className="mb-6">
          <Badge className="bg-primary text-white px-4 py-2 text-sm font-semibold">
            KONTAKT
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          KONTAKTUJTE
          <br />
          <span className="text-primary">HŠL</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
          Máte dotazy, nápady nebo se chcete zapojit do ligy? Rádi vám odpovíme!
        </p>
      </section>

      {/* Main Content - Split Layout */}
      <section className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
        {/* Left Side - Contact Info */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">HOSPODSKÁ ŠIPKOVÁ LIGA</h2>
                <p className="text-slate-600 font-semibold">Tradice hospodského šipkování</p>
              </div>
            </div>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Jsme komunita šipkařů z Chropyně a okolí. Liga běží již několik sezón 
              a stále hledáme nové nadšence do šipkování.
            </p>

            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold mb-8">
              SEZÓNA 2025/2026
            </Badge>
          </div>

          {/* Contact Information Cards */}
          <div className="space-y-6">
            {/* Vedoucí ligy */}
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 grid place-items-center">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 mb-1">Vedoucí ligy</h3>
                    <p className="text-slate-600 font-medium">Ladislav Kučírek</p>
                    <p className="text-sm text-slate-500 mt-1">tel.: 777 852 277</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white">
                    <Link href="tel:+420777852277">
                      Volat
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Technická podpora */}
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-accent/10 grid place-items-center">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 mb-1">Technická podpora webu</h3>
                    <p className="text-slate-600 font-medium">Petr Langr</p>
                    <p className="text-sm text-slate-500 mt-1">petr.langr@pmlogy.cz</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white">
                    <Link href="mailto:petr.langr@pmlogy.cz">
                      Napsat
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media */}
          <Card className="rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-100">
            <CardContent className="p-6 text-center">
              <h3 className="font-black text-slate-900 mb-4">Sledujte nás na Facebooku</h3>
              <Button
                variant="outline"
                className="rounded-xl border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-6"
                asChild
              >
                <Link href="https://www.facebook.com/groups/764848670219258" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5 mr-2" />
                  Facebook skupina HŠL
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - FAQ */}
        <div className="lg:sticky lg:top-8">
          <Card className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-gray-100 card-shadow">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="size-14 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center mx-auto mb-4">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">ČASTO KLADENÉ DOTAZY</h2>
                <p className="text-slate-600 font-medium text-sm">Odpovědi na nejčastější otázky o lize</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Jak se zapojit do ligy?</h3>
                  <p className="text-slate-600 text-sm">Kontaktujte vedoucího ligy. Rád vás provede registračním procesem.</p>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Kdy se hrají zápasy?</h3>
                  <p className="text-slate-600 text-sm">Zápasy se obvykle hrají večer podle domluvy týmů. Přesný rozpis najdete v sekci Rozpis.</p>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Kde se hraje?</h3>
                  <p className="text-slate-600 text-sm">Zápasy se hrají v různých hospodách v Chropyni a okolních obcích.</p>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Potřebuji vlastní šipky?</h3>
                  <p className="text-slate-600 text-sm">Ano, každý hráč si nosí své vlastní šipky.</p>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Jak fungují statistiky?</h3>
                  <p className="text-slate-600 text-sm">Systém automaticky počítá HSL indexy a další statistiky na základě výsledků zápasů.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}