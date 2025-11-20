"use client";

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { notFound, redirect } from 'next/navigation';
import { SimplifiedMatchWizard } from '@/components/match/simplified-match-wizard';
import { PublicMatchView } from '@/components/match/public-match-view';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Lock, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default function SimplifiedMatchPage({ params }: MatchPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSaveMatch = async (data: any) => {
    setSaving(true);
    setError(null);

    try {
      // Calculate match summary
      const { scores, gameResults, homeLineup, awayLineup } = data;

      // Prepare match result
      const matchResult = {
        homeGamesWon: scores.home,
        awayGamesWon: scores.away,
        homeLegsTotal: 0, // Would need to be calculated from detailed results
        awayLegsTotal: 0,
        status: 'completed',
        endTime: new Date().toISOString(),
      };

      // Prepare games data
      const games = Object.entries(gameResults).map(([gameId, winner]) => ({
        gameNumber: parseInt(gameId),
        winner,
        type: getGameType(parseInt(gameId)), // Helper function to determine game type
        participants: {
          home: getGameParticipants('home', parseInt(gameId), homeLineup),
          away: getGameParticipants('away', parseInt(gameId), awayLineup)
        }
      }));

      const response = await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result: matchResult,
          games,
          lineups: {
            home: homeLineup,
            away: awayLineup
          }
        }),
      });

      if (response.ok) {
        // Redirect to match summary or matches list
        router.push(`/matches?saved=${id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Chyba při ukládání zápasu');
      }
    } catch (error) {
      console.error('Error saving match:', error);
      setError('Nepodařilo se uložit zápas. Zkuste to prosím znovu.');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for game types and participants
  const getGameType = (gameNumber: number): string => {
    if (gameNumber <= 3 || [6, 7, 8, 12, 13, 14].includes(gameNumber)) return 'single';
    if ([5, 11, 16].includes(gameNumber)) return 'double_501';
    if ([4, 10, 15].includes(gameNumber)) return 'double_cricket';
    if (gameNumber === 9) return 'triple_301';
    if (gameNumber === 17) return 'tiebreak_701';
    return 'single';
  };

  const getGameParticipants = (team: 'home' | 'away', gameNumber: number, lineup: string[]): string[] => {
    // Simplified participant logic - would need full mapping
    const position = team === 'home' ? 'D' : 'H';

    // Singles
    if ([1, 6, 12].includes(gameNumber)) return [lineup[0]]; // Position 1
    if ([2, 7, 13].includes(gameNumber)) return [lineup[1]]; // Position 2
    if ([3, 8, 14].includes(gameNumber)) return [lineup[2]]; // Position 3

    // Doubles
    if ([4, 15].includes(gameNumber)) return [lineup[0], lineup[1]]; // 1+2
    if ([5, 11].includes(gameNumber)) return [lineup[1], lineup[2]]; // 2+3
    if ([10, 16].includes(gameNumber)) return [lineup[0], lineup[2]]; // 1+3

    // Triple
    if (gameNumber === 9 || gameNumber === 17) return lineup.slice(0, 3);

    return [];
  };

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

  // Check if match is completed
  const isMatchCompleted = match.endTime !== null || match.status === 'completed';

  // If match is completed, show public read-only view
  if (isMatchCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PublicMatchView match={match} />
      </div>
    );
  }

  // For non-completed matches, require authentication
  if (!session) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/match/${id}`)}`);
  }

  // Check access permissions
  const isAdmin = session?.user?.role === 'admin';
  const isHomeCaptain = session?.user?.role === 'kapitán' && session?.user?.player?.team?.id === match.homeTeamId;
  const isAwayCaptain = session?.user?.role === 'kapitán' && session?.user?.player?.team?.id === match.awayTeamId;

  const hasAccess = isAdmin || isHomeCaptain || isAwayCaptain;

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto rounded-2xl">
          <CardContent className="p-12 text-center">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-black mb-3">Přístup odepřen</h1>
            <p className="text-muted-foreground mb-6">
              Pouze kapitáni týmů nebo administrátoři mohou zadávat výsledky tohoto zápasu.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link href="/matches">
                <Button variant="outline" className="w-full">
                  Zpět na seznam zápasů
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full">
                  Domovská stránka
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Access indicator */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500 text-white">
            <Shield className="mr-1 h-3 w-3" />
            {isAdmin ? 'Admin přístup' : isHomeCaptain ? 'Kapitán domácích' : 'Kapitán hostů'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Zadávání výsledků zápasu
          </span>
        </div>
        <Link href="/matches">
          <Button variant="outline" size="sm">
            Zpět na zápasy
          </Button>
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simplified Match Wizard */}
      <SimplifiedMatchWizard
        match={match}
        onSave={handleSaveMatch}
      />

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="p-8">
            <div className="text-center">
              <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-semibold">Ukládám výsledky...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}