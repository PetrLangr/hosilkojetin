import Link from "next/link";
import { Mail, MapPin, Phone, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { name: "Domů", href: "/" },
    { name: "Tabulka", href: "/standings" },
    { name: "Týmy", href: "/teams" },
    { name: "Hráči", href: "/players" },
  ];

  const matchLinks = [
    { name: "Rozpis zápasů", href: "/schedule" },
    { name: "Výsledky", href: "/matches" },
    { name: "Pravidla", href: "/rules" },
    { name: "Archiv", href: "/archiv" },
  ];

  return (
    <footer className="bg-gradient-to-r from-primary to-[#9F1239] text-white">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src="/logo_hsl.svg" alt="HŠL" className="h-14 w-auto brightness-0 invert" />
              <div>
                <h3 className="text-2xl font-black text-white">HŠL</h3>
                <p className="text-white/80 text-sm font-semibold">Hospodská Šipková Liga</p>
              </div>
            </div>
            
            <p className="text-white/90 leading-relaxed">
              Tradice hospodského šipkování v nejlepší lize regionu. 
              Sledujte své oblíbené týmy a hráče v průběhu celé sezóny.
            </p>
            
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-bold">
              SEZÓNA 2025/2026
            </Badge>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-white">Rychlé odkazy</h4>
            <nav className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-white/90 hover:text-white font-semibold transition-colors hover:translate-x-1 transform duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Match Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-white">Zápasy</h4>
            <nav className="space-y-3">
              {matchLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-white/90 hover:text-white font-semibold transition-colors hover:translate-x-1 transform duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-white">Kontakt</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-white mb-1">Vedoucí ligy</p>
                <p className="text-sm text-white/90">Ladislav Kučírek</p>
                <div className="flex items-center gap-2 text-white/80 mt-1">
                  <Phone className="h-3 w-3" />
                  <span className="text-sm">777 852 277</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Technická podpora</p>
                <p className="text-sm text-white/90">Petr Langr</p>
                <div className="flex items-center gap-2 text-white/80 mt-1">
                  <Mail className="h-3 w-3" />
                  <span className="text-sm">petr.langr@pmlogy.cz</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Chropyně a okolí</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h5 className="font-bold text-white">Sledujte nás</h5>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm px-4"
                asChild
              >
                <Link href="https://www.facebook.com/groups/764848670219258" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook skupina
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-white/90 text-sm font-medium">
                © {currentYear} Hospodská Šipková Liga. Všechna práva vyhrazena.
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link href="/rules" className="text-white/90 hover:text-white font-medium transition-colors">
                Pravidla ligy
              </Link>
              <Link href="/contact" className="text-white/90 hover:text-white font-medium transition-colors">
                Kontakt
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      </div>
    </footer>
  );
}