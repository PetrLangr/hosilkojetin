import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Target,
  Facebook,
  Instagram,
  Youtube,
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
            {/* Email */}
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 grid place-items-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 mb-1">E-mailová adresa</h3>
                    <p className="text-slate-600 font-medium">info@hsl-liga.cz</p>
                    <p className="text-sm text-slate-500 mt-1">Odpovíme do 24 hodin</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white">
                    <Link href="mailto:info@hsl-liga.cz">
                      Napsat
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-accent/10 grid place-items-center">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 mb-1">Telefon</h3>
                    <p className="text-slate-600 font-medium">+420 123 456 789</p>
                    <p className="text-sm text-slate-500 mt-1">Po-Pá 18:00-22:00</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white">
                    <Link href="tel:+420123456789">
                      Volat
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-warning/10 grid place-items-center">
                    <MapPin className="h-6 w-6 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 mb-1">Lokace</h3>
                    <p className="text-slate-600 font-medium">Chropyně a okolí</p>
                    <p className="text-sm text-slate-500 mt-1">Různé hospody v regionu</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-warning text-warning hover:bg-warning hover:text-white">
                    <Link href="/teams">
                      Týmy
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-green-100 grid place-items-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 mb-1">Zápasy</h3>
                    <p className="text-slate-600 font-medium">Obvykle večer</p>
                    <p className="text-sm text-slate-500 mt-1">Podle domluvy týmů</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                    <Link href="/schedule">
                      Rozpis
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media */}
          <Card className="rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-100">
            <CardContent className="p-6 text-center">
              <h3 className="font-black text-slate-900 mb-4">Sledujte nás na sociálních sítích</h3>
              <div className="flex justify-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="size-12 p-0 rounded-xl border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                  asChild
                >
                  <Link href="#" aria-label="Facebook">
                    <Facebook className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="size-12 p-0 rounded-xl border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
                  asChild
                >
                  <Link href="#" aria-label="Instagram">
                    <Instagram className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="size-12 p-0 rounded-xl border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  asChild
                >
                  <Link href="#" aria-label="YouTube">
                    <Youtube className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Contact Form */}
        <div className="lg:sticky lg:top-8">
          <ContactForm 
            title="Napište nám zprávu"
            description="Vyplňte formulář a my se vám ozveme co nejdříve"
            compact={false}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-gray-100 p-8 md:p-12 max-w-4xl mx-auto mt-16">
        <div className="text-center mb-12">
          <div className="size-16 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center mx-auto mb-6">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">ČASTO KLADENÉ DOTAZY</h2>
          <p className="text-slate-600 font-medium">Odpovědi na nejčastější otázky o lize</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Jak se zapojit do ligy?</h3>
              <p className="text-slate-600 text-sm">Kontaktujte nás e-mailem nebo přes formulář. Rádi vás provedeme registračním procesem.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Kdy se hrají zápasy?</h3>
              <p className="text-slate-600 text-sm">Zápasy se obvykle hrají večer podle domluvy týmů. Přesný rozpis najdete v sekci Rozpis.</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2">Kolik stojí účast?</h3>
              <p className="text-slate-600 text-sm">Informace o poplatcích vám rádi poskytneme při registraci.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Kde se hraje?</h3>
              <p className="text-slate-600 text-sm">Zápasy se hrají v různých hospodách v Chropyni a okolních obcích.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Potřebuji vlastní šipky?</h3>
              <p className="text-slate-600 text-sm">Ano, každý hráč si nosí své vlastní šipky. Doporučujeme kvalitní šipky pro lepší výkon.</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2">Jak fungují statistiky?</h3>
              <p className="text-slate-600 text-sm">Systém automaticky počítá BPI indexy a další statistiky na základě výsledků zápasů.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}