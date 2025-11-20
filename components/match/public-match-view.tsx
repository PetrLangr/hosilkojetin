"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Calendar, MapPin, Users, Target, Download, ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PublicMatchViewProps {
  match: any;
  canEdit?: boolean;
  onUpgradeToDetailed?: () => void;
}

export function PublicMatchView({ match, canEdit = false, onUpgradeToDetailed }: PublicMatchViewProps) {

  // Real data structure from database
  const games = match.games || [];
  const matchResult = match.result || null;

  // Check if this is a quick result (no game data, just totals)
  const isQuickResult = match.isQuickResult === true || (games.length === 0 && matchResult);

  // Check if we have real game data
  const hasRealData = games.length > 0;

  const calculateMatchScore = () => {
    // If quick result, use the result data directly
    if (isQuickResult && matchResult) {
      return {
        homeWins: matchResult.homeWins || 0,
        awayWins: matchResult.awayWins || 0,
        homeLegs: matchResult.homeLegs || 0,
        awayLegs: matchResult.awayLegs || 0
      };
    }

    // Otherwise calculate from games
    let homeWins = 0;
    let awayWins = 0;

    games.forEach((game: any) => {
      // Game result is stored in game.result JSON field
      const gameResult = game.result;
      if (gameResult && gameResult.winner) {
        if (gameResult.winner === 'home') homeWins++;
        if (gameResult.winner === 'away') awayWins++;
      }
    });

    return { homeWins, awayWins };
  };

  const scoreData = calculateMatchScore();
  const { homeWins, awayWins } = scoreData;
  const homeLegs = (scoreData as any).homeLegs;
  const awayLegs = (scoreData as any).awayLegs;
  const completedGames = games.length;

  const getPlayerFromLineup = (playerId: string) => {
    const homePlayer = match.homeTeam?.players?.find((p: any) => p.id === playerId);
    const awayPlayer = match.awayTeam?.players?.find((p: any) => p.id === playerId);
    return homePlayer || awayPlayer || { id: playerId, name: 'Neznámý hráč' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/matches">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na zápasy
          </Link>
        </Button>

        <div className="text-sm text-muted-foreground">
          {match.round}. kolo • Sezóna 2025/2026
        </div>
      </div>

      {/* Quick Result Warning */}
      {isQuickResult && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-2">Rychlý výsledek</h3>
                <p className="text-sm text-orange-800 mb-4">
                  Tento zápas byl zadán v režimu rychlého zadání. Zobrazuje se pouze celkový výsledek a počet legů.
                  Statistiky jednotlivých hráčů (BPI, HSL Index, high finishes) nebyly aktualizovány.
                </p>
                {canEdit && onUpgradeToDetailed && (
                  <Button
                    onClick={onUpgradeToDetailed}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Přidat podrobné statistiky
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Header */}
      <Card className="rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-gray-100 card-shadow overflow-hidden">
        <CardHeader className="pb-4">
          <div className="text-center">
            <Badge className="bg-primary text-white px-4 py-2 font-bold mb-4">
              ZÁPAS UKONČEN
            </Badge>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {match.endTime && formatDate(match.endTime)}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="text-center space-y-6">
            {/* Team vs Team */}
            <div className="flex items-center justify-center gap-8 lg:gap-16">
              <div className="text-center flex-1 max-w-xs">
                <div className="size-20 md:size-24 rounded-2xl bg-white shadow-lg border border-slate-200 p-2 mx-auto mb-4">
                  <img 
                    src={`/logos/${match.homeTeam.name.toLowerCase().replace(/\s+/g, '')}_logo.png`}
                    alt={match.homeTeam.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.parentElement!.innerHTML = `<div class="w-full h-full bg-primary/10 rounded-xl grid place-items-center text-primary font-bold text-lg">${match.homeTeam.shortName || 'H'}</div>`;
                    }}
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
                  {match.homeTeam.name}
                </h3>
                <div className="text-sm text-muted-foreground mb-4">
                  {match.homeTeam.city}
                </div>
                <div className="text-6xl md:text-7xl font-black text-primary mb-2">
                  {homeWins}
                </div>
                {matchResult && (
                  <Badge variant={matchResult.home > matchResult.away ? "default" : "secondary"} className="text-lg px-4 py-2">
                    {matchResult.home} bodů
                  </Badge>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-light text-muted-foreground">vs</div>
                {matchResult && (
                  <Badge variant="outline" className="font-bold mt-2">
                    {matchResult.type}
                  </Badge>
                )}
              </div>
              
              <div className="text-center flex-1 max-w-xs">
                <div className="size-20 md:size-24 rounded-2xl bg-white shadow-lg border border-slate-200 p-2 mx-auto mb-4">
                  <img 
                    src={`/logos/${match.awayTeam.name.toLowerCase().replace(/\s+/g, '')}_logo.png`}
                    alt={match.awayTeam.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.parentElement!.innerHTML = `<div class="w-full h-full bg-accent/10 rounded-xl grid place-items-center text-accent font-bold text-lg">${match.awayTeam.shortName || 'A'}</div>`;
                    }}
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
                  {match.awayTeam.name}
                </h3>
                <div className="text-sm text-muted-foreground mb-4">
                  {match.awayTeam.city}
                </div>
                <div className="text-6xl md:text-7xl font-black text-primary mb-2">
                  {awayWins}
                </div>
                {matchResult && (
                  <Badge variant={matchResult.away > matchResult.home ? "default" : "secondary"} className="text-lg px-4 py-2">
                    {matchResult.away} bodů
                  </Badge>
                )}
              </div>
            </div>

            {/* Winner Announcement */}
            {matchResult && matchResult.home !== matchResult.away && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      VÍTĚZ: {matchResult.home > matchResult.away ? match.homeTeam.name : match.awayTeam.name}
                    </div>
                    <div className="text-yellow-700 font-medium">
                      {matchResult.home > matchResult.away ? matchResult.home : matchResult.away} - {matchResult.home < matchResult.away ? matchResult.home : matchResult.away} na body
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isQuickResult && homeLegs !== undefined && awayLegs !== undefined ? (
              <div className="text-sm text-muted-foreground">
                Legy: {homeLegs} - {awayLegs} • Rychlý výsledek (bez detailů her)
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Dokončeno {completedGames} her
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Results - Only show if not quick result or if has actual game data */}
      {!isQuickResult && completedGames > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Přehled her</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                  {games.map((game: any) => {
                    const gameResult = game.result || {};
                    return (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">Hra {game.order}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {game.type === 'single' ? 'Singl' : 
                             game.type === 'double_501' ? 'Dvojice 501' :
                             game.type === 'double_cricket' ? 'Dvojice Cricket' :
                             game.type === 'triple_301' ? 'Trojice 301' :
                             game.type === 'tiebreak_701' ? 'Rozstřel 701' : game.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {game.participants?.home?.map((playerId: string) => {
                              const player = getPlayerFromLineup(playerId);
                              return (
                                <div key={playerId} className="text-sm">
                                  {player?.name || 'Neznámý hráč'}
                                </div>
                              );
                            }) || <div className="text-sm text-muted-foreground">-</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {game.participants?.away?.map((playerId: string) => {
                              const player = getPlayerFromLineup(playerId);
                              return (
                                <div key={playerId} className="text-sm">
                                  {player?.name || 'Neznámý hráč'}
                                </div>
                              );
                            }) || <div className="text-sm text-muted-foreground">-</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {gameResult.winner ? (
                            <Badge variant={gameResult.winner === 'home' ? "default" : "secondary"}>
                              {gameResult.winner === 'home' ? match.homeTeam.shortName || match.homeTeam.name : match.awayTeam.shortName || match.awayTeam.name}
                            </Badge>
                          ) : (
                            <div className="text-sm text-muted-foreground">-</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {gameResult.legs && gameResult.legs.length > 0 ? (
                            <div className="text-sm">
                              {gameResult.legs.filter((leg: any) => leg.winner === 'home').length} - {gameResult.legs.filter((leg: any) => leg.winner === 'away').length}
                            </div>
                          ) : gameResult.winner ? (
                            <div className="text-sm">
                              {gameResult.winner === 'home' ? '1 - 0' : '0 - 1'}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">-</div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/standings">
            <Trophy className="h-4 w-4 mr-2" />
            Tabulka ligy
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/team/${match.homeTeam.id}`}>
            <Users className="h-4 w-4 mr-2" />
            Profil {match.homeTeam.shortName}
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/team/${match.awayTeam.id}`}>
            <Users className="h-4 w-4 mr-2" />
            Profil {match.awayTeam.shortName}
          </Link>
        </Button>

        <Button variant="outline" className="rounded-xl" disabled>
          <Download className="h-4 w-4 mr-2" />
          Stáhnout PDF
        </Button>
      </div>
    </div>
  );
}