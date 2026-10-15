"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Přehled" },
  { href: "/admin/matches", label: "Zápasy" },
  { href: "/admin/teams", label: "Týmy" },
  { href: "/admin/players", label: "Hráči" },
  // Seznam příspěvků v administraci zatím není — správa běží přes veřejné /posts.
  { href: "/admin/posts/new", label: "Nový příspěvek" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Shield className="h-4 w-4 animate-pulse text-primary" />
        Načítám administraci…
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    redirect("/");
  }

  return (
    <div>
      {/* Stejný řádek jako PageHeader, jen bez spodní linky — tu tvoří lišta záložek. */}
      <div className="flex items-baseline gap-2.5 pb-2">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Správa ligy</h1>
        <span className="truncate text-sm text-muted-foreground">
          {session.user.name ?? session.user.email}
        </span>
      </div>

      {/* Záložky místo bočního panelu — sidebar ve čtvrtině šířky ubíral
          tabulkám v podstránkách místo a nesl jen pět odkazů. */}
      <nav className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {adminNavItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
