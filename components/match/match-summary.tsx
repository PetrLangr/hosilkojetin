"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Target, Users, Save } from 'lucide-react';

interface MatchSummaryProps {
  match: any;
  gameResults: Record<number, any>;
  homeLineup: string[];
  awayLineup: string[];
  events: Record<string, any>;
}

export function MatchSummary({ match, gameResults, homeLineup, awayLineup, events }: MatchSummaryProps) {
  const calculateMatchScore = () => {
    let homeWins = 0;
    let awayWins = 0;

    Object.values(gameResults).forEach((result: any) => {
      if (result.winner === 'home') homeWins++;
      if (result.winner === 'away') awayWins++;
    });

    return { homeWins, awayWins };
  };

  const calculateMatchResult = () => {
    const { homeWins, awayWins } = calculateMatchScore();
    const totalGames = Object.keys(gameResults).length;
    const hasBase16Games = totalGames >= 16;

    if (!hasBase16Games) return null; // Match not complete (need at least 16 games)

    // Check if we need tiebreak (after 16 games)
    if (totalGames === 16 && homeWins === awayWins) {
      return { home: 0, away: 0, type: 'TIED', needsTiebreak: true };
    }

    // HŠL scoring rules: V=3, VP=2, PP=1, P=0
    if (homeWins > awayWins) {
      if (awayWins === 0) return { home: 3, away: 0, type: 'V-P' }; // Clean win
      return { home: 3, away: 1, type: 'V-PP' }; // Win with opponent points
    } else if (awayWins > homeWins) {
      if (homeWins === 0) return { home: 0, away: 3, type: 'P-V' }; // Clean loss
      return { home: 1, away: 3, type: 'PP-V' }; // Loss with points
    } else {
      // After tiebreak - this means 8.5 wins each, so penalty shootout result
      return { home: 2, away: 2, type: 'VP-VP' };
    }
  };

  const { homeWins, awayWins } = calculateMatchScore();
  const matchResult = calculateMatchResult();
  const completedGames = Object.keys(gameResults).length;

  const getPlayerFromLineup = (playerId: string) => {
    const homePlayer = match.homeTeam.players.find((p: any) => p.id === playerId);
    const awayPlayer = match.awayTeam.players.find((p: any) => p.id === playerId);
    return homePlayer || awayPlayer;
  };

  const saveMatchResults = async () => {
    try {
      const response = await fetch(`/api/matches/${match.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameResults,
          matchResult,
          events
        }),
      });

      if (response.ok) {
        alert('Výsledky byly úspěšně uloženy!');
        // Redirect to matches page or refresh
        window.location.href = '/matches';
      } else {
        alert('Chyba při ukládání výsledků');
      }
    } catch (error) {
      console.error('Error saving match results:', error);
      alert('Chyba při ukládání výsledků');
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Result Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Výsledek zápasu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{match.homeTeam.name}</h3>
                <div className="text-4xl font-bold text-primary">{homeWins}</div>
                {matchResult && (
                  <Badge variant={matchResult.home > matchResult.away ? "default" : "secondary"}>
                    {matchResult.home} bodů
                  </Badge>
                )}
              </div>
              
              <div className="text-2xl font-light text-muted-foreground">vs</div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold">{match.awayTeam.name}</h3>
                <div className="text-4xl font-bold text-primary">{awayWins}</div>
                {matchResult && (
                  <Badge variant={matchResult.away > matchResult.home ? "default" : "secondary"}>
                    {matchResult.away} bodů
                  </Badge>
                )}
              </div>
            </div>

            {matchResult && (
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">
                  Vítěz: {matchResult.home > matchResult.away ? match.homeTeam.name : match.awayTeam.name}
                </span>
                <Badge variant="outline">{matchResult.type}</Badge>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Dokončeno {completedGames} her
              {matchResult?.needsTiebreak && <span className="text-red-600 ml-2">• Potřebný rozstřel</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Přehled her</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hra</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Hráči {match.homeTeam.name}</TableHead>
                <TableHead>Hráči {match.awayTeam.name}</TableHead>
                <TableHead>Vítěz</TableHead>
                <TableHead>Skóre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(gameResults).map(([gameId, result]: [string, any]) => (
                <TableRow key={gameId}>
                  <TableCell className="font-medium">Hra {gameId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{result.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {result.participants.home.map((playerId: string) => {
                        const player = getPlayerFromLineup(playerId);
                        return (
                          <div key={playerId} className="text-sm">
                            {player?.name}
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {result.participants.away.map((playerId: string) => {
                        const player = getPlayerFromLineup(playerId);
                        return (
                          <div key={playerId} className="text-sm">
                            {player?.name}
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={result.winner === 'home' ? "default" : "secondary"}>
                      {result.winner === 'home' ? match.homeTeam.name : match.awayTeam.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {result.legs && (
                      <div className="text-sm">
                        {result.legs.filter((leg: any) => leg.winner === 'home').length} - {' '}
                        {result.legs.filter((leg: any) => leg.winner === 'away').length}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg">
          <Target className="h-4 w-4 mr-2" />
          Upravit hry
        </Button>
        
        <Button 
          onClick={saveMatchResults} 
          size="lg"
          disabled={!matchResult || matchResult.needsTiebreak}
        >
          <Save className="h-4 w-4 mr-2" />
          Uložit výsledky
        </Button>
      </div>
    </div>
  );
}