"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Edit, Users, Target } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();

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

  return (
    <div className="space-y-6">
      {/* Admin Dashboard - same as profile admin section */}
      <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Administrátorský panel
          </CardTitle>
          <CardDescription>
            Správa ligy a obsahu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Admin stats overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-primary mb-1">12</div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Týmů</div>
              </div>
              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-accent mb-1">86</div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Hráčů</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-600 mb-1">66</div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Zápasů</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-purple-600 mb-1">2</div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Příspěvků</div>
              </div>
            </div>

            {/* Quick admin actions */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-black text-slate-900">Rychlé akce:</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold justify-start" asChild>
                  <Link href="/admin/posts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Nový příspěvek
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white font-bold justify-start" asChild>
                  <Link href="/posts">
                    <Edit className="h-4 w-4 mr-2" />
                    Spravovat příspěvky
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-bold justify-start" asChild>
                  <Link href="/admin/teams">
                    <Users className="h-4 w-4 mr-2" />
                    Spravovat týmy
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white font-bold justify-start" asChild>
                  <Link href="/admin/players">
                    <Target className="h-4 w-4 mr-2" />
                    Spravovat hráče
                  </Link>
                </Button>
              </div>
            </div>

            {/* Admin privileges info */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h4 className="font-black text-slate-900 mb-4">Vaše administrátorská oprávnění:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary"></div>
                    <span>Správa všech týmů a hráčů</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary"></div>
                    <span>Vytváření a úprava příspěvků</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary"></div>
                    <span>Správa sezón a rozpisů</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-accent"></div>
                    <span>Přístup ke všem zápasům</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-accent"></div>
                    <span>Export dat a statistik</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-accent"></div>
                    <span>Správa uživatelských účtů</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}