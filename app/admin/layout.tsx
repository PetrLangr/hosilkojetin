"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Target, Edit, Home, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Načítám admin panel...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    redirect("/");
  }

  const adminNavItems = [
    { href: "/admin", label: "Přehled", icon: Home },
    { href: "/admin/teams", label: "Týmy", icon: Users },
    { href: "/admin/players", label: "Hráči", icon: Target },
    { href: "/admin/matches", label: "Zápasy", icon: Calendar },
    { href: "/admin/posts", label: "Příspěvky", icon: Edit },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="text-center py-12 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-gray-100">
        <Badge className="bg-primary text-white px-4 py-2 text-sm font-semibold mb-4">
          <Shield className="h-3 w-3 mr-1" />
          ADMINISTRÁTORSKÝ PANEL
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
          SPRÁVA <span className="text-primary">HŠL</span>
        </h1>
        <p className="text-xl text-slate-600 font-medium">
          Kompletní správa ligy, týmů a obsahu
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Admin Sidebar */}
        <div className="lg:w-1/4">
          <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-black text-slate-900">Admin Menu</div>
                  <div className="text-sm text-slate-600">{session.user.name}</div>
                </div>
              </div>

              <nav className="space-y-2">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  
                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start rounded-xl font-semibold ${
                        isActive 
                          ? "bg-primary text-white hover:bg-[#9F1239]" 
                          : "text-slate-700 hover:bg-primary hover:text-white"
                      }`}
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {children}
        </div>
      </div>
    </div>
  );
}