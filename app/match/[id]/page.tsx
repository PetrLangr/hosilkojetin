"use client";

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { notFound, redirect } from 'next/navigation';
import { MatchWizard } from '@/components/match/match-wizard';
import { PinAccess } from '@/components/match/pin-access';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, User, Target } from 'lucide-react';
import Link from 'next/link';


interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default function MatchPage({ params }: MatchPageProps) {
  const { data: session, status } = useSession();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pinAccessGranted, setPinAccessGranted] = useState(false);
  
  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const response = await fetch(`/api/matches`);
        if (response.ok) {
          const matches = await response.json();
          const foundMatch = matches.find((m: any) => m.id === id);
          setMatch(foundMatch);
        }
      } catch (error) {
        console.error('Error fetching match:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Načítám zápas...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    notFound();
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Načítám session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/match/${id}`)}`);
  }

  // Check access permissions
  const isAdmin = session?.user?.role === 'admin';
  const isHomeCaptain = session?.user?.role === 'kapitán' && session?.user?.player?.team?.id === match.homeTeamId;
  const isAwayCaptain = session?.user?.role === 'kapitán' && session?.user?.player?.team?.id === match.awayTeamId;
  const isTeamMember = session?.user?.player?.team?.id === match.homeTeamId || session?.user?.player?.team?.id === match.awayTeamId;
  
  const hasDirectAccess = isAdmin || isHomeCaptain || isAwayCaptain;
  const needsPin = isTeamMember && !hasDirectAccess && !pinAccessGranted;

  // Show PIN input for team members
  if (needsPin) {
    return <PinAccess match={match} onAccessGranted={() => setPinAccessGranted(true)} />;
  }

  // Show access denied for non-team members  
  if (!isTeamMember && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-3xl bg-white border border-gray-100 card-shadow">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <div className="size-20 rounded-full bg-red-50 grid place-items-center mx-auto mb-6">
                  <Lock className="h-10 w-10 text-red-600" />
                </div>
                
                <Badge className="bg-red-600 text-white px-4 py-2 font-bold mb-4">
                  PŘÍSTUP ODEPŘEN
                </Badge>
                
                <h1 className="text-3xl font-black text-slate-900 mb-4">
                  NEJSTE <span className="text-red-600">OPRÁVNĚNI</span>
                </h1>
                
                <p className="text-lg text-slate-600 mb-6">
                  Zadávání výsledků zápasů je dostupné pouze kapitánům zúčastněných týmů nebo administrátorům.
                </p>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100 mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="size-12 rounded-xl bg-white shadow-sm border border-slate-200 p-1">
                      <img 
                        src={`/logos/${match.homeTeam.name.toLowerCase().replace(/\s+/g, '')}_logo.png`}
                        alt={match.homeTeam.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.parentElement!.innerHTML = `<div class="w-full h-full bg-primary/10 rounded grid place-items-center text-primary font-bold text-xs">${match.homeTeam.shortName || 'H'}</div>`;
                        }}
                      />
                    </div>
                    <div className="text-xl font-black text-slate-400">VS</div>
                    <div className="size-12 rounded-xl bg-white shadow-sm border border-slate-200 p-1">
                      <img 
                        src={`/logos/${match.awayTeam.name.toLowerCase().replace(/\s+/g, '')}_logo.png`}
                        alt={match.awayTeam.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.parentElement!.innerHTML = `<div class="w-full h-full bg-accent/10 rounded grid place-items-center text-accent font-bold text-xs">${match.awayTeam.shortName || 'A'}</div>`;
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-black text-lg text-slate-900 mb-2">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {match.round}. kolo • Sezóna 2025/2026
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900">Oprávnění uživatelé:</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-primary/5 p-3 rounded-xl">
                      <div className="font-semibold text-primary">Kapitán {match.homeTeam.name}</div>
                      <div className="text-slate-600">Může zadávat výsledky tohoto zápasu</div>
                    </div>
                    <div className="bg-accent/5 p-3 rounded-xl">
                      <div className="font-semibold text-accent">Kapitán {match.awayTeam.name}</div>
                      <div className="text-slate-600">Může zadávat výsledky tohoto zápasu</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  {session?.user?.role === 'hráč' && (
                    <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-xl">
                      <strong>Hráč:</strong> Kontaktujte svého kapitána pro zadání výsledků.
                    </p>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href="/matches">
                        <Shield className="h-4 w-4 mr-2" />
                        Zpět na zápasy
                      </Link>
                    </Button>
                    
                    <Button asChild className="rounded-xl bg-primary hover:bg-[#9F1239] text-white">
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-2" />
                        Můj profil
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h1>
          <p className="text-muted-foreground">
            {match.round}. kolo • {match.startTime ? new Date(match.startTime).toLocaleDateString('cs-CZ') : 'Datum neuvedek'}
          </p>
        </div>

        <MatchWizard match={match} />
      </div>
    </div>
  );
}