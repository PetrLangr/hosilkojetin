"use client";

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { notFound, redirect, useRouter } from 'next/navigation';
import { SinglePageScorecard } from '@/components/match/single-page-scorecard';
import { PinAccess } from '@/components/match/pin-access';
import { PublicMatchView } from '@/components/match/public-match-view';
import { ResultModeSelector } from '@/components/match/result-mode-selector';
import { QuickResultEntry, QuickResultData } from '@/components/match/quick-result-entry';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default function MatchPage({ params }: MatchPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pinAccessGranted, setPinAccessGranted] = useState(false);
  const [entryMode, setEntryMode] = useState<'select' | 'quick' | 'detailed'>('select');

  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const response = await fetch(`/api/matches/${id}`);
        if (response.ok) {
          const match = await response.json();
          setMatch(match);
        } else {
          console.error('Match not found');
        }
      } catch (error) {
        console.error('Error fetching match:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [id]);

  const handleQuickResultSubmit = async (resultData: QuickResultData) => {
    try {
      const response = await fetch(`/api/matches/${id}/quick-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Nepodařilo se uložit výsledek');
      }

      toast({
        title: 'Výsledek uložen',
        description: 'Rychlý výsledek byl úspěšně uložen a tabulka byla aktualizována.',
      });

      // Redirect to matches or standings page
      router.push('/standings');
    } catch (error) {
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodařilo se uložit výsledek',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (loading) {
    return <LoadingLine>Načítám zápas…</LoadingLine>;
  }

  if (!match) {
    notFound();
  }

  if (status === "loading") {
    return <LoadingLine>Ověřuji přihlášení…</LoadingLine>;
  }

  // Check access permissions for editing
  const isAdmin = session?.user?.role === 'admin';
  const isHomeCaptain = session?.user?.role === 'kapitán' && session?.user?.player?.team?.id === match.homeTeamId;
  const isAwayCaptain = session?.user?.role === 'kapitán' && session?.user?.player?.team?.id === match.awayTeamId;
  const isTeamMember = session?.user?.player?.team?.id === match.homeTeamId || session?.user?.player?.team?.id === match.awayTeamId;

  const hasDirectAccess = isAdmin || isHomeCaptain || isAwayCaptain;
  const needsPin = isTeamMember && !hasDirectAccess && !pinAccessGranted;

  // Check if match is completed
  const isMatchCompleted = match.endTime !== null || (match.games && match.games.length > 0);
  const isQuickResult = match.isQuickResult === true;

  // Check if user can edit (admin or team captain)
  const canEditMatch = isAdmin || isHomeCaptain || isAwayCaptain;

  // Handle upgrade to detailed mode
  const handleUpgradeToDetailed = () => {
    setEntryMode('detailed');
  };

  // If match is completed and user cannot edit, show public read-only view
  if (isMatchCompleted && !canEditMatch) {
    return <PublicMatchView match={match} />;
  }

  // If match is completed, user can edit, show with upgrade option
  if (isMatchCompleted && canEditMatch && isQuickResult && entryMode === 'select') {
    return (
      <PublicMatchView
        match={match}
        canEdit={true}
        onUpgradeToDetailed={handleUpgradeToDetailed}
      />
    );
  }

  // For non-completed matches, require authentication
  if (!session) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/match/${id}`)}`);
  }

  // Show PIN input for team members
  if (needsPin) {
    return <PinAccess match={match} onAccessGranted={() => setPinAccessGranted(true)} />;
  }

  // Show access denied for non-team members
  if (!isTeamMember && !isAdmin) {
    return (
      <div>
        <PageHeader
          title="Zadání výsledku"
          subtitle={`${match.homeTeam.name} – ${match.awayTeam.name}${match.round ? ` · ${match.round}. kolo` : ''}`}
        />
        <section className="mx-auto max-w-xl overflow-hidden rounded-lg border border-border bg-white">
          <div className="flex h-10 items-center gap-2 border-b border-border bg-muted px-3">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-slate-900">Přístup odepřen</h2>
          </div>
          <div className="space-y-3 p-3 text-sm text-slate-700">
            <p>
              Výsledek mohou zadat jen kapitáni týmů{' '}
              <span className="font-semibold text-slate-900">{match.homeTeam.shortName || match.homeTeam.name}</span> a{' '}
              <span className="font-semibold text-slate-900">{match.awayTeam.shortName || match.awayTeam.name}</span>{' '}
              nebo administrátor.
            </p>
            {session?.user?.role === 'hráč' && (
              <p className="text-xs text-muted-foreground">Jako hráč požádejte o zadání svého kapitána.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="h-8 font-semibold">
                <Link href="/schedule">Rozpis</Link>
              </Button>
              <Button asChild className="h-8 bg-primary font-semibold text-white hover:bg-[#9F1239]">
                <Link href="/profile">Můj profil</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show mode selector for non-completed matches
  if (entryMode === 'select') {
    return (
      <ResultModeSelector
        onModeSelected={(mode) => setEntryMode(mode)}
        matchInfo={{
          homeTeam: { name: match.homeTeam.name, shortName: match.homeTeam.shortName },
          awayTeam: { name: match.awayTeam.name, shortName: match.awayTeam.shortName },
          round: match.round,
        }}
      />
    );
  }

  // Show quick result entry
  if (entryMode === 'quick') {
    return (
      <div>
        <BackToModes onClick={() => setEntryMode('select')} />
        <QuickResultEntry
          matchId={id}
          homeTeam={{
            id: match.homeTeamId,
            name: match.homeTeam.name,
            shortName: match.homeTeam.shortName
          }}
          awayTeam={{
            id: match.awayTeamId,
            name: match.awayTeam.name,
            shortName: match.awayTeam.shortName
          }}
          onSubmit={handleQuickResultSubmit}
          onCancel={() => setEntryMode('select')}
        />
      </div>
    );
  }

  // Show detailed entry (existing SinglePageScorecard)
  return (
    <div>
      <BackToModes onClick={() => setEntryMode('select')} />
      <SinglePageScorecard match={match} />
    </div>
  );
}

/** Stav načítání: jeden řádek se spinnerem, obsah stránky neodskakuje. */
function LoadingLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {children}
    </div>
  );
}

function BackToModes({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="mb-3 h-8 gap-1.5 px-2 text-muted-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Výběr režimu zadání
    </Button>
  );
}
