import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube } from "lucide-react";
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
    { name: "Statistiky", href: "/stats" },
    { name: "Archiv", href: "/archive" },
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
              <div className="flex items-center gap-3 text-white/90">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">info@hsl-liga.cz</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">+420 123 456 789</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Chropyně a okolí</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h5 className="font-bold text-white">Sledujte nás</h5>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-10 p-0 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                  asChild
                >
                  <Link href="#" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-10 p-0 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                  asChild
                >
                  <Link href="#" aria-label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-10 p-0 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                  asChild
                >
                  <Link href="#" aria-label="YouTube">
                    <Youtube className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
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
              <Link href="/privacy" className="text-white/90 hover:text-white font-medium transition-colors">
                Ochrana osobních údajů
              </Link>
              <Link href="/terms" className="text-white/90 hover:text-white font-medium transition-colors">
                Podmínky užití
              </Link>
              <Link href="/rules" className="text-white/90 hover:text-white font-medium transition-colors">
                Pravidla ligy
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