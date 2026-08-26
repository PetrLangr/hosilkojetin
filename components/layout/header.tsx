"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, Target, User, LogIn, LogOut } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navigation = [
    { name: "Domů", href: "/" },
    { name: "Zápasy", href: "/schedule" },
    { name: "Tabulka", href: "/standings" },
    { name: "Týmy", href: "/teams" },
    { name: "Archiv", href: "/archiv" },
    { name: "Kontakt", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-gradient-to-r from-primary to-[#9F1239] shadow-lg">
      <div className="container mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
        {/* Oficiální logo je černo-zlaté a na vínové liště by zaniklo, proto sedí
            na bílé destičce. Nápis HŠL vedle zůstává — v logu je text tak malý,
            že se v liště nedá přečíst. */}
        <Link href="/" className="group transition-all flex items-center gap-2">
          <span className="flex h-9 items-center rounded-md bg-white px-1.5 shadow-sm ring-1 ring-black/5">
            <img src="/logo-hsl-full.png" alt="Hospodská šipková liga" className="h-7 w-auto" />
          </span>
          <span className="text-lg font-black text-white group-hover:text-white/80 transition-colors tracking-tight">
            HŠL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-5">
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              // Aktivní položka: "/" jen přesně, ostatní i pro podstránky (/team/x → Týmy)
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-3 ml-3 pl-4 border-l border-white/20">
            {status === "loading" ? (
              <div className="text-sm text-white/80">Načítám…</div>
            ) : session ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild className="h-8 rounded-md border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary font-medium">
                  <Link href={session.user?.role === 'admin' ? '/admin' : '/profile'}>
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    {/* Jméno je uvnitř tlačítka — dřív stálo vedle a rozbíjelo výšku lišty */}
                    {session.user?.name ?? (session.user?.role === 'admin' ? 'Admin' : 'Profil')}
                  </Link>
                </Button>

                {session.user?.role === 'admin' && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-[11px] px-1.5 py-0">
                    admin
                  </Badge>
                )}

                <Button variant="ghost" size="sm" onClick={() => signOut()} aria-label="Odhlásit se" className="h-8 w-8 p-0 hover:bg-white/10 text-white/80 hover:text-white">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => signIn()} className="h-8 rounded-md bg-white text-primary hover:bg-white/90 font-semibold px-3">
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                Přihlásit
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          {/* lg, ne md — desktopová navigace se zapíná až na lg, jinak by mezi
              768 a 1024 px nebyla navigace vidět vůbec */}
          <SheetTrigger asChild className="lg:hidden">
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