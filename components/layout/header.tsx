"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, Target, User, LogIn, LogOut } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const navigation = [
    { name: "Domů", href: "/" },
    { name: "Rozpis", href: "/schedule" },
    { name: "Tabulka", href: "/standings" },
    { name: "Týmy", href: "/teams" },
    { name: "Hráči", href: "/players" },
    { name: "Zápasy", href: "/matches" },
    { name: "Archiv", href: "/archiv" },
    { name: "Kontakt", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-gradient-to-r from-primary to-[#9F1239] shadow-lg">
      <div className="container mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="group transition-all flex items-center gap-3">
          <img src="/logo_hsl.svg" alt="HŠL" className="h-12 w-auto brightness-0 invert" />
          <span className="text-2xl md:text-3xl font-black text-white group-hover:text-white/80 transition-colors tracking-tight">
            HŠL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <nav className="flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-bold text-white/90 hover:text-white transition-colors py-2 relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-6 ml-8 pl-8 border-l border-white/20">
            {status === "loading" ? (
              <div className="text-base text-white/80">Načítám...</div>
            ) : session ? (
              <div className="flex items-center gap-4">
                <Button variant="outline" asChild className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary font-semibold backdrop-blur-sm">
                  <Link href={session.user?.role === 'admin' ? '/admin' : '/profile'}>
                    <User className="h-4 w-4 mr-2" />
                    {session.user?.role === 'admin' ? 'Admin' : 'Profil'}
                  </Link>
                </Button>
                
                <div>
                  <div className="font-bold text-white">{session.user?.name}</div>
                  {session.user?.player?.team && (
                    <div className="text-sm text-white/70">
                      {session.user.player.team.name}
                    </div>
                  )}
                </div>
                
                {session.user?.role && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {session.user.role}
                  </Badge>
                )}
                
                <Button variant="ghost" onClick={() => signOut()} className="hover:bg-white/10 text-white/90 hover:text-white">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => signIn()} className="rounded-xl bg-white text-primary hover:bg-white/90 font-bold px-6 py-2 shadow-lg">
                <LogIn className="h-4 w-4 mr-2" />
                Přihlásit se
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="sr-only">Navigace</SheetTitle>
            <nav className="flex flex-col space-y-4 mt-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}