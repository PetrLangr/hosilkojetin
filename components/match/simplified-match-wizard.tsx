"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Trophy,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  Target,
  Save,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Timer
} from 'lucide-react';
import { getTeamLogo } from '@/lib/team-logos';
import { cn } from '@/lib/utils';

// Simplified game structure - just what we need
const GAME_SEQUENCE = [
  // Singles rounds
  { id: 1, type: 'single', name: 'Singly 1. kolo', count: 3, subGames: [
    { id: 1, name: '1D vs 1H' },
    { id: 2, name: '2D vs 2H' },
    { id: 3, name: '3D vs 3H' }
  ]},
  // First doubles/cricket round
  { id: 2, type: 'mixed', name: 'Dvojice/Cricket 1', count: 3, subGames: [
    { id: 4, name: 'Cricket: 1+2 vs 1+2' },
    { id: 5, name: '501 Dvojice: 2+3 vs 2+3' },
    { id: 6, name: 'Singl: 1D vs 2H' }
  ]},
  // Cross singles
  { id: 3, type: 'single', name: 'Singly křížem', count: 3, subGames: [
    { id: 7, name: '2D vs 3H' },
    { id: 8, name: '3D vs 1H' },
    { id: 9, name: '301 Trojice' }
  ]},
  // Second round
  { id: 4, type: 'mixed', name: 'Dvojice/Cricket 2', count: 3, subGames: [
    { id: 10, name: 'Cricket: 1+3 vs 1+3' },
    { id: 11, name: '501 Dvojice: 2+3 vs 2+3' },
    { id: 12, name: 'Singl: 1D vs 3H' }
  ]},
  // Final singles
  { id: 5, type: 'single', name: 'Singly finále', count: 2, subGames: [
    { id: 13, name: '2D vs 1H' },
    { id: 14, name: '3D vs 2H' }
  ]},
  // Last round
  { id: 6, type: 'mixed', name: 'Závěr', count: 2, subGames: [
    { id: 15, name: 'Cricket: 1+2 vs 1+2' },
    { id: 16, name: '501 Dvojice: 1+3 vs 1+3' }
  ]}
];

interface SimplifiedMatchWizardProps {
  match: any;
  onSave?: (data: any) => void;
}

export function SimplifiedMatchWizard({ match, onSave }: SimplifiedMatchWizardProps) {
  // Core lineup - just the active 3 players per team
  const [homeActivePlayers, setHomeActivePlayers] = useState<string[]>([]);
  const [awayActivePlayers, setAwayActivePlayers] = useState<string[]>([]);

  // Bench players for substitutions
  const [homeBench, setHomeBench] = useState<string[]>([]);
  const [awayBench, setAwayBench] = useState<string[]>([]);

  // Game results - simplified
  const [gameResults, setGameResults] = useState<Record<number, 'home' | 'away' | null>>({});
  const [currentRound, setCurrentRound] = useState(0);
  const [currentSubGame, setCurrentSubGame] = useState(0);

  // UI state
  const [activeTab, setActiveTab] = useState<'lineup' | 'games' | 'summary'>('lineup');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate current game number
  const getCurrentGameNumber = () => {
    let gameNum = 0;
    for (let i = 0; i < currentRound; i++) {
      gameNum += GAME_SEQUENCE[i].subGames.length;
    }
    return gameNum + currentSubGame + 1;
  };

  // Calculate scores
  const getScores = () => {
    let home = 0, away = 0;
    Object.values(gameResults).forEach(winner => {
      if (winner === 'home') home++;
      if (winner === 'away') away++;
    });
    return { home, away };
  };

  // Quick lineup selection
  const handleQuickLineup = (team: 'home' | 'away') => {
    const players = team === 'home' ? match.homeTeam.players : match.awayTeam.players;
    const selected = players.slice(0, 3).map((p: any) => p.id);
    const bench = players.slice(3, 6).map((p: any) => p.id);

    if (team === 'home') {
      setHomeActivePlayers(selected);
      setHomeBench(bench);
    } else {
      setAwayActivePlayers(selected);
      setAwayBench(bench);
    }
  };

  // Simplified substitution
  const handleSubstitution = (team: 'home' | 'away', outPlayerId: string, inPlayerId: string) => {
    if (team === 'home') {
      setHomeActivePlayers(prev => prev.map(id => id === outPlayerId ? inPlayerId : id));
      setHomeBench(prev => [...prev.filter(id => id !== inPlayerId), outPlayerId]);
    } else {
      setAwayActivePlayers(prev => prev.map(id => id === outPlayerId ? inPlayerId : id));
      setAwayBench(prev => [...prev.filter(id => id !== inPlayerId), outPlayerId]);
    }
  };

  // Quick game result entry
  const handleGameResult = (gameId: number, winner: 'home' | 'away') => {
    setGameResults(prev => ({ ...prev, [gameId]: winner }));

    // Auto-advance to next game
    const currentGame = GAME_SEQUENCE[currentRound];
    if (currentSubGame < currentGame.subGames.length - 1) {
      setCurrentSubGame(currentSubGame + 1);
    } else if (currentRound < GAME_SEQUENCE.length - 1) {
      setCurrentRound(currentRound + 1);
      setCurrentSubGame(0);
    } else {
      // All games done
      setActiveTab('summary');
    }
  };

  // Get player name helper
  const getPlayerName = (playerId: string, team: 'home' | 'away') => {
    const players = team === 'home' ? match.homeTeam.players : match.awayTeam.players;
    const player = players.find((p: any) => p.id === playerId);
    return player?.name || 'Neznámý hráč';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with live score */}
      <Card className="rounded-2xl bg-gradient-to-r from-primary to-[#9F1239] text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={getTeamLogo(match.homeTeam.name)}
                alt={match.homeTeam.name}
                className="size-14 rounded-xl bg-white p-1"
              />
              <div>
                <h3 className="font-black text-xl">{match.homeTeam.shortName}</h3>
                <p className="text-white/80 text-sm">Domácí</p>
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-black">
                {getScores().home} : {getScores().away}
              </div>
              <div className="text-sm text-white/80 mt-1">
                Hra {getCurrentGameNumber()} z 16
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <h3 className="font-black text-xl">{match.awayTeam.shortName}</h3>
                <p className="text-white/80 text-sm">Hosté</p>
              </div>
              <img
                src={getTeamLogo(match.awayTeam.name)}
                alt={match.awayTeam.name}
                className="size-14 rounded-xl bg-white p-1"
              />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${(Object.keys(gameResults).length / 16) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="lineup" className="text-base font-semibold">
            <Users className="w-4 h-4 mr-2" />
            Sestavy
          </TabsTrigger>
          <TabsTrigger value="games" disabled={homeActivePlayers.length < 3 || awayActivePlayers.length < 3}>
            <Target className="w-4 h-4 mr-2" />
            Hry
          </TabsTrigger>
          <TabsTrigger value="summary">
            <Trophy className="w-4 h-4 mr-2" />
            Souhrn
          </TabsTrigger>
        </TabsList>

        {/* Lineup Tab */}
        <TabsContent value="lineup" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Home Team */}
            <Card className="rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
                <CardTitle className="flex items-center justify-between">
                  <span>{match.homeTeam.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickLineup('home')}
                  >
                    <Timer className="w-4 h-4 mr-1" />
                    Rychlý výběr
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Active Players */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge className="bg-green-500">AKTIVNÍ</Badge>
                    Základní sestava (3 hráči)
                  </h4>
                  <div className="space-y-2">
                    {[0, 1, 2].map(index => (
                      <div key={index} className="flex items-center gap-3">
                        <Badge variant="outline" className="w-10">
                          {index + 1}D
                        </Badge>
                        <Select
                          value={homeActivePlayers[index] || ''}
                          onValueChange={(value) => {
                            const newPlayers = [...homeActivePlayers];
                            newPlayers[index] = value;
                            setHomeActivePlayers(newPlayers);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte hráče" />
                          </SelectTrigger>
                          <SelectContent>
                            {match.homeTeam.players
                              .filter((p: any) =>
                                !homeActivePlayers.includes(p.id) ||
                                homeActivePlayers[index] === p.id
                              )
                              .map((player: any) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {homeActivePlayers[index] && homeBench.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto"
                            onClick={() => {
                              // Quick substitution modal would go here
                            }}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bench */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="outline">LAVIČKA</Badge>
                    Náhradníci
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {homeBench.map(playerId => (
                      <Badge key={playerId} variant="secondary">
                        {getPlayerName(playerId, 'home')}
                      </Badge>
                    ))}
                    {homeBench.length === 0 && (
                      <p className="text-sm text-muted-foreground">Žádní náhradníci</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Away Team - Similar structure */}
            <Card className="rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
                <CardTitle className="flex items-center justify-between">
                  <span>{match.awayTeam.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickLineup('away')}
                  >
                    <Timer className="w-4 h-4 mr-1" />
                    Rychlý výběr
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Active Players */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge className="bg-green-500">AKTIVNÍ</Badge>
                    Základní sestava (3 hráči)
                  </h4>
                  <div className="space-y-2">
                    {[0, 1, 2].map(index => (
                      <div key={index} className="flex items-center gap-3">
                        <Badge variant="outline" className="w-10">
                          {index + 1}H
                        </Badge>
                        <Select
                          value={awayActivePlayers[index] || ''}
                          onValueChange={(value) => {
                            const newPlayers = [...awayActivePlayers];
                            newPlayers[index] = value;
                            setAwayActivePlayers(newPlayers);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte hráče" />
                          </SelectTrigger>
                          <SelectContent>
                            {match.awayTeam.players
                              .filter((p: any) =>
                                !awayActivePlayers.includes(p.id) ||
                                awayActivePlayers[index] === p.id
                              )
                              .map((player: any) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bench */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="outline">LAVIČKA</Badge>
                    Náhradníci
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {awayBench.map(playerId => (
                      <Badge key={playerId} variant="secondary">
                        {getPlayerName(playerId, 'away')}
                      </Badge>
                    ))}
                    {awayBench.length === 0 && (
                      <p className="text-sm text-muted-foreground">Žádní náhradníci</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-8"
              disabled={homeActivePlayers.length < 3 || awayActivePlayers.length < 3}
              onClick={() => setActiveTab('games')}
            >
              Pokračovat k hrám
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="mt-6">
          <div className="space-y-6">
            {/* Current round header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">
                {GAME_SEQUENCE[currentRound].name}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentRound === 0 && currentSubGame === 0}
                  onClick={() => {
                    if (currentSubGame > 0) {
                      setCurrentSubGame(currentSubGame - 1);
                    } else if (currentRound > 0) {
                      setCurrentRound(currentRound - 1);
                      setCurrentSubGame(GAME_SEQUENCE[currentRound - 1].subGames.length - 1);
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Badge variant="outline" className="px-4">
                  {currentRound + 1} / {GAME_SEQUENCE.length}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    currentRound === GAME_SEQUENCE.length - 1 &&
                    currentSubGame === GAME_SEQUENCE[currentRound].subGames.length - 1
                  }
                  onClick={() => {
                    const currentGame = GAME_SEQUENCE[currentRound];
                    if (currentSubGame < currentGame.subGames.length - 1) {
                      setCurrentSubGame(currentSubGame + 1);
                    } else if (currentRound < GAME_SEQUENCE.length - 1) {
                      setCurrentRound(currentRound + 1);
                      setCurrentSubGame(0);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Games in current round */}
            <div className="grid gap-4">
              {GAME_SEQUENCE[currentRound].subGames.map((game, idx) => {
                const gameId = GAME_SEQUENCE.slice(0, currentRound)
                  .reduce((acc, r) => acc + r.subGames.length, 0) + idx + 1;
                const result = gameResults[gameId];
                const isActive = idx === currentSubGame;

                return (
                  <Card
                    key={game.id}
                    className={cn(
                      "rounded-xl transition-all",
                      isActive && "ring-2 ring-primary",
                      result && "bg-gray-50"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={result ? "secondary" : "outline"}
                            className="text-lg px-3 py-1"
                          >
                            {gameId}
                          </Badge>
                          <div>
                            <h4 className="font-semibold text-lg">{game.name}</h4>
                            {isActive && (
                              <p className="text-sm text-muted-foreground">
                                Zadejte výsledek hry
                              </p>
                            )}
                          </div>
                        </div>

                        {result ? (
                          <div className="flex items-center gap-3">
                            <Badge
                              className={cn(
                                "px-4 py-2",
                                result === 'home'
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                              )}
                            >
                              {match.homeTeam.shortName}
                              {result === 'home' && <Check className="ml-1 h-4 w-4" />}
                            </Badge>
                            <span className="text-muted-foreground">vs</span>
                            <Badge
                              className={cn(
                                "px-4 py-2",
                                result === 'away'
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                              )}
                            >
                              {match.awayTeam.shortName}
                              {result === 'away' && <Check className="ml-1 h-4 w-4" />}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setGameResults(prev => {
                                  const newResults = { ...prev };
                                  delete newResults[gameId];
                                  return newResults;
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : isActive ? (
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              onClick={() => handleGameResult(gameId, 'home')}
                            >
                              {match.homeTeam.shortName} vyhrál
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleGameResult(gameId, 'away')}
                            >
                              {match.awayTeam.shortName} vyhrál
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Čeká na zadání
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Jump to summary if all games done */}
            {Object.keys(gameResults).length === 16 && (
              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={() => setActiveTab('summary')}
                >
                  Zobrazit souhrn
                  <Trophy className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6">
          <div className="space-y-6">
            {/* Final score */}
            <Card className="rounded-2xl bg-gradient-to-br from-rose-50 to-white">
              <CardContent className="p-8">
                <h3 className="text-center text-2xl font-black mb-6">
                  KONEČNÝ VÝSLEDEK
                </h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <img
                      src={getTeamLogo(match.homeTeam.name)}
                      alt={match.homeTeam.name}
                      className="size-20 mx-auto mb-3 rounded-xl bg-white p-2 shadow-lg"
                    />
                    <h4 className="font-bold mb-2">{match.homeTeam.name}</h4>
                    <div className="text-5xl font-black text-primary">
                      {getScores().home}
                    </div>
                  </div>

                  <div className="text-4xl font-black text-gray-400">:</div>

                  <div className="text-center">
                    <img
                      src={getTeamLogo(match.awayTeam.name)}
                      alt={match.awayTeam.name}
                      className="size-20 mx-auto mb-3 rounded-xl bg-white p-2 shadow-lg"
                    />
                    <h4 className="font-bold mb-2">{match.awayTeam.name}</h4>
                    <div className="text-5xl font-black text-primary">
                      {getScores().away}
                    </div>
                  </div>
                </div>

                {/* Winner banner */}
                {getScores().home !== getScores().away && (
                  <div className="mt-8 text-center">
                    <Badge className="px-6 py-3 text-lg">
                      <Trophy className="mr-2 h-5 w-5" />
                      Vítěz: {getScores().home > getScores().away
                        ? match.homeTeam.name
                        : match.awayTeam.name}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game by game results */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Přehled her</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(gameResults).map(([gameId, winner]) => {
                    const gameNum = parseInt(gameId);
                    let gameName = '';
                    let cumSum = 0;

                    for (const round of GAME_SEQUENCE) {
                      for (const subGame of round.subGames) {
                        cumSum++;
                        if (cumSum === gameNum) {
                          gameName = subGame.name;
                          break;
                        }
                      }
                      if (gameName) break;
                    }

                    return (
                      <div key={gameId} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{gameId}</Badge>
                          <span className="font-medium">{gameName}</span>
                        </div>
                        <Badge
                          className={winner === 'home' ? 'bg-blue-500' : 'bg-red-500'}
                        >
                          {winner === 'home' ? match.homeTeam.shortName : match.awayTeam.shortName}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Save button */}
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setActiveTab('games')}
              >
                Upravit výsledky
              </Button>
              <Button
                size="lg"
                onClick={async () => {
                  setIsSaving(true);
                  // Save logic here
                  if (onSave) {
                    await onSave({
                      homeLineup: homeActivePlayers,
                      awayLineup: awayActivePlayers,
                      homeBench,
                      awayBench,
                      gameResults,
                      scores: getScores()
                    });
                  }
                  setIsSaving(false);
                }}
                disabled={isSaving || Object.keys(gameResults).length < 16}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Ukládání...' : 'Uložit zápas'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}