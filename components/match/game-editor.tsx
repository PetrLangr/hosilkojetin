"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Target, Users, Plus, Minus, CheckCircle, Trophy, ArrowRight, ArrowLeftRight, UserPlus, X } from 'lucide-react';
import { PlayerStatsInput } from './player-stats-input';
import { getTeamLogo } from '@/lib/team-logos';

interface GameEditorProps {
  games: any[];
  currentGame: number;
  gameResults: Record<number, any>;
  homeTeam: any;
  awayTeam: any;
  homeLineup: string[]; // [D1, D2, D3, D4, D5, D6] player IDs (including substitutes)
  awayLineup: string[]; // [H1, H2, H3, H4, H5, H6] player IDs (including substitutes)
  events: Record<string, any>;
  onGameComplete: (gameId: number, result: any) => void;
  onGameSelect: (gameId: number) => void;
}

export function GameEditor({
  games,
  currentGame,
  gameResults,
  homeTeam,
  awayTeam,
  homeLineup,
  awayLineup,
  events,
  onGameComplete,
  onGameSelect
}: GameEditorProps) {
  const [selectedHomePlayers, setSelectedHomePlayers] = useState<string[]>([]);
  const [selectedAwayPlayers, setSelectedAwayPlayers] = useState<string[]>([]);
  const [legResults, setLegResults] = useState<any[]>([]);
  // Simple substitutions: map of playerId -> substituteId
  const [substitutions, setSubstitutions] = useState<Record<string, string>>({});
  const [substitutionDialogOpen, setSubstitutionDialogOpen] = useState(false);

  const currentGameData = games.find(g => g.id === currentGame);
  const isGameCompleted = gameResults[currentGame];

  const resetGameForm = () => {
    setSelectedHomePlayers([]);
    setSelectedAwayPlayers([]);
    setLegResults([]);
    setSubstitutions({});
  };

  const handleGameSelect = (gameId: number) => {
    // Save current progress before switching
    if (legResults.length > 0) {
      // Auto-save current game progress
    }
    
    onGameSelect(gameId);
    resetGameForm();
  };

  const getPlayersForGame = () => {
    if (!currentGameData) return { home: [], away: [], autoAssigned: true };

    // Auto-assign players based on HŠL positions
    let homePlayerIds = currentGameData.positions.home.map((pos: string) => {
      const index = parseInt(pos.replace('D', '')) - 1;
      const originalId = homeLineup[index];
      // Check if this player has a substitute
      return substitutions[originalId] || originalId;
    }).filter(Boolean);

    let awayPlayerIds = currentGameData.positions.away.map((pos: string) => {
      const index = parseInt(pos.replace('H', '')) - 1;
      const originalId = awayLineup[index];
      // Check if this player has a substitute
      return substitutions[originalId] || originalId;
    }).filter(Boolean);

    const homePlayers = homePlayerIds.map(id => homeTeam.players.find((p: any) => p.id === id)).filter(Boolean);
    const awayPlayers = awayPlayerIds.map(id => awayTeam.players.find((p: any) => p.id === id)).filter(Boolean);

    return {
      home: homePlayers,
      away: awayPlayers,
      autoAssigned: true,
      homeIds: homePlayerIds,
      awayIds: awayPlayerIds
    };
  };

  const getGameDescription = () => {
    if (!currentGameData) return '';
    
    const positions = currentGameData.positions;
    return `${positions.home.join('+')} vs ${positions.away.join('+')}`;
  };

  const getRequiredPlayersCount = () => {
    if (!currentGameData) return { home: 1, away: 1 };
    
    return {
      home: currentGameData.positions.home.length,
      away: currentGameData.positions.away.length
    };
  };

  const requiredPlayers = getRequiredPlayersCount();
  const availablePlayers = getPlayersForGame();

  const addLeg = () => {
    setLegResults([...legResults, { winner: null, homeScore: 0, awayScore: 0 }]);
  };

  const updateLeg = (index: number, field: string, value: any) => {
    const updated = [...legResults];
    updated[index] = { ...updated[index], [field]: value };
    setLegResults(updated);
  };


  const calculateGameWinner = () => {
    if (currentGameData?.format === 'bo3') {
      const homeWins = legResults.filter(leg => leg.winner === 'home').length;
      const awayWins = legResults.filter(leg => leg.winner === 'away').length;
      
      if (homeWins >= 2) return 'home';
      if (awayWins >= 2) return 'away';
      return null;
    }
    
    // For other formats, implement specific logic
    return null;
  };

  const completeGame = () => {
    const winner = calculateGameWinner();
    if (!winner) return;

    const result = {
      type: currentGameData.type,
      format: currentGameData.format,
      positions: currentGameData.positions,
      participants: {
        home: availablePlayers.homeIds,
        away: availablePlayers.awayIds
      },
      legs: legResults,
      winner,
      events
    };

    onGameComplete(currentGame, result);
    resetGameForm();
  };

  const canCompleteGame = () => {
    return availablePlayers.home.length > 0 &&
           availablePlayers.away.length > 0 &&
           calculateGameWinner() !== null;
  };

  // Initialize 3 legs for current game
  const currentGameLegs = legResults.length === 0 ? [
    { winner: null, homeScore: 0, awayScore: 0 },
    { winner: null, homeScore: 0, awayScore: 0 },
    { winner: null, homeScore: 0, awayScore: 0 }
  ] : legResults;

  // Set initial legs if empty
  if (legResults.length === 0) {
    setLegResults(currentGameLegs);
  }

  // Auto-calculate if game is finished (2 legs won)
  const homeLegsWon = currentGameLegs.filter(leg => leg.winner === 'home').length;
  const awayLegsWon = currentGameLegs.filter(leg => leg.winner === 'away').length;
  const gameFinished = homeLegsWon >= 2 || awayLegsWon >= 2;

  return (
    <div className="space-y-8">
      {/* Current Game Header */}
      {currentGameData && (
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary grid place-items-center text-white">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900">
                    HRA {currentGame} • {currentGameData.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getGameDescription()} • {currentGameData.format.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`font-bold text-lg px-4 py-2 ${
                  isGameCompleted ? "bg-success text-white" : "bg-accent text-white"
                }`}>
                  {isGameCompleted ? "DOKONČENO" : "PROBÍHÁ"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Single Game Interface */}
      <div className="space-y-8">
        {currentGameData && (
          <>

            {/* Auto-assigned Players Display */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-white shadow-sm border border-slate-200 p-1">
                      <img
                        src={getTeamLogo(homeTeam.name)}
                        alt={homeTeam.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <CardTitle className="text-lg font-black text-slate-900">
                      {homeTeam.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-3">
                      Pozice: {getGameDescription().split(' vs ')[0]}
                    </div>
                    {availablePlayers.home.map((player: any, index: number) => (
                      <div key={player.id} className="flex items-center gap-3 p-3 bg-muted rounded">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {currentGameData.positions.home[index]}
                        </Badge>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          {player.nickname && (
                            <div className="text-xs text-muted-foreground">"{player.nickname}"</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-white shadow-sm border border-slate-200 p-1">
                      <img
                        src={getTeamLogo(awayTeam.name)}
                        alt={awayTeam.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <CardTitle className="text-lg font-black text-slate-900">
                      {awayTeam.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-3">
                      Pozice: {getGameDescription().split(' vs ')[1]}
                    </div>
                    {availablePlayers.away.map((player: any, index: number) => (
                      <div key={player.id} className="flex items-center gap-3 p-3 bg-muted rounded">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {currentGameData.positions.away[index]}
                        </Badge>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          {player.nickname && (
                            <div className="text-xs text-muted-foreground">"{player.nickname}"</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Substitution for doubles - New clean approach */}
            {currentGameData && (currentGameData.type === 'double_501' || currentGameData.type === 'double_cricket') &&
             (homeLineup.slice(3).filter(Boolean).length > 0 || awayLineup.slice(3).filter(Boolean).length > 0) && (
              <>
                {/* Substitution Status Banner */}
                {Object.keys(substitutions).length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ArrowLeftRight className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-bold text-sm text-amber-900">Aktivní střídání</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(substitutions).map(([originalId, substituteId]) => {
                              const originalPlayer = [...homeTeam.players, ...awayTeam.players].find((p: any) => p.id === originalId);
                              const substitutePlayer = [...homeTeam.players, ...awayTeam.players].find((p: any) => p.id === substituteId);
                              return (
                                <Badge key={originalId} variant="secondary" className="bg-amber-100 text-amber-800">
                                  {originalPlayer?.name} → {substitutePlayer?.name}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSubstitutions({})}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        Zrušit vše
                      </Button>
                    </div>
                  </div>
                )}

                {/* Substitution Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setSubstitutionDialogOpen(true)}
                    className="rounded-xl border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Střídání hráčů
                  </Button>
                </div>

                {/* Substitution Dialog */}
                <Dialog open={substitutionDialogOpen} onOpenChange={setSubstitutionDialogOpen}>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Střídání hráčů pro tuto hru</DialogTitle>
                      <DialogDescription>
                        Každý hráč může být vystřídán náhradníkem
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Home Team Substitutions */}
                        <div>
                          <h4 className="font-bold text-sm mb-3">{homeTeam.name}</h4>
                          <div className="space-y-3">
                            {currentGameData.positions.home.map((pos: string, idx: number) => {
                              const index = parseInt(pos.replace('D', '')) - 1;
                              const originalPlayerId = homeLineup[index];
                              const originalPlayer = homeTeam.players.find((p: any) => p.id === originalPlayerId);
                              const availableSubs = homeLineup.slice(3).filter(Boolean).filter(id =>
                                !Object.values(substitutions).includes(id) || substitutions[originalPlayerId] === id
                              );

                              if (!originalPlayer) return null;

                              return (
                                <div key={pos}>
                                  <Label className="text-xs text-muted-foreground">Hráč {idx + 1}</Label>
                                  <Select
                                    value={substitutions[originalPlayerId] || originalPlayerId}
                                    onValueChange={(value) => {
                                      if (value === originalPlayerId) {
                                        const newSubs = { ...substitutions };
                                        delete newSubs[originalPlayerId];
                                        setSubstitutions(newSubs);
                                      } else {
                                        setSubstitutions({ ...substitutions, [originalPlayerId]: value });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue>
                                        {substitutions[originalPlayerId]
                                          ? homeTeam.players.find((p: any) => p.id === substitutions[originalPlayerId])?.name
                                          : originalPlayer.name
                                        }
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={originalPlayerId}>{originalPlayer.name} (základní)</SelectItem>
                                      {availableSubs.length > 0 && <Separator className="my-1" />}
                                      {availableSubs.map(subId => {
                                        const subPlayer = homeTeam.players.find((p: any) => p.id === subId);
                                        return (
                                          <SelectItem key={subId} value={subId}>
                                            {subPlayer?.name} (náhradník)
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              );
                            })}
                            {homeLineup.slice(3).filter(Boolean).length === 0 && (
                              <p className="text-sm text-muted-foreground italic">Žádní náhradníci k dispozici</p>
                            )}
                          </div>
                        </div>

                        {/* Away Team Substitutions */}
                        <div>
                          <h4 className="font-bold text-sm mb-3">{awayTeam.name}</h4>
                          <div className="space-y-3">
                            {currentGameData.positions.away.map((pos: string, idx: number) => {
                              const index = parseInt(pos.replace('H', '')) - 1;
                              const originalPlayerId = awayLineup[index];
                              const originalPlayer = awayTeam.players.find((p: any) => p.id === originalPlayerId);
                              const availableSubs = awayLineup.slice(3).filter(Boolean).filter(id =>
                                !Object.values(substitutions).includes(id) || substitutions[originalPlayerId] === id
                              );

                              if (!originalPlayer) return null;

                              return (
                                <div key={pos}>
                                  <Label className="text-xs text-muted-foreground">Hráč {idx + 1}</Label>
                                  <Select
                                    value={substitutions[originalPlayerId] || originalPlayerId}
                                    onValueChange={(value) => {
                                      if (value === originalPlayerId) {
                                        const newSubs = { ...substitutions };
                                        delete newSubs[originalPlayerId];
                                        setSubstitutions(newSubs);
                                      } else {
                                        setSubstitutions({ ...substitutions, [originalPlayerId]: value });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue>
                                        {substitutions[originalPlayerId]
                                          ? awayTeam.players.find((p: any) => p.id === substitutions[originalPlayerId])?.name
                                          : originalPlayer.name
                                        }
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={originalPlayerId}>{originalPlayer.name} (základní)</SelectItem>
                                      {availableSubs.length > 0 && <Separator className="my-1" />}
                                      {availableSubs.map(subId => {
                                        const subPlayer = awayTeam.players.find((p: any) => p.id === subId);
                                        return (
                                          <SelectItem key={subId} value={subId}>
                                            {subPlayer?.name} (náhradník)
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              );
                            })}
                            {awayLineup.slice(3).filter(Boolean).length === 0 && (
                              <p className="text-sm text-muted-foreground italic">Žádní náhradníci k dispozici</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSubstitutionDialogOpen(false)}>
                        Zavřít
                      </Button>
                      <Button onClick={() => setSubstitutionDialogOpen(false)} className="bg-primary hover:bg-[#9F1239]">
                        Potvrdit střídání
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Legs/Rounds - Always show for current game */}
            {currentGameData && (
              <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 rounded-t-2xl">
                  <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    VÝSLEDKY LEGŮ
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Best of 3 - první na 2 vyhrané legy
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {currentGameLegs.map((leg, index) => {
                      const isPlayable = (index === 0 || currentGameLegs[index - 1]?.winner) && !gameFinished; // Can play if first leg or previous completed, but game not finished
                      const shouldShow = index < 2 || (homeLegsWon === 1 && awayLegsWon === 1) || leg.winner; // Show Leg 3 if tied 1:1 OR if it has a winner (was played)
                      
                      if (!shouldShow) return null;
                      
                      return (
                        <div key={index} className={`p-4 rounded-xl border-2 transition-all ${
                          leg.winner ? 'border-success bg-success/5' : 
                          isPlayable ? 'border-primary bg-primary/5' : 
                          'border-slate-200 bg-slate-50'
                        }`}>
                          <div className="text-center mb-4">
                            <Badge className={`font-black text-lg px-4 py-2 ${
                              leg.winner ? 'bg-success text-white' : 
                              isPlayable ? 'bg-primary text-white' : 
                              'bg-slate-300 text-slate-600'
                            }`}>
                              LEG {index + 1}
                            </Badge>
                          </div>
                          
                          {isPlayable && !leg.winner ? (
                            <Select
                              value={leg.winner || ''}
                              onValueChange={(winner) => {
                                const newLegs = [...currentGameLegs];
                                newLegs[index] = { ...newLegs[index], winner };
                                setLegResults(newLegs);
                              }}
                            >
                              <SelectTrigger className="w-full rounded-xl border-2 border-primary focus:border-accent">
                                <SelectValue placeholder="Vítěz legu" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="home" className="font-bold">{homeTeam.name}</SelectItem>
                                <SelectItem value="away" className="font-bold">{awayTeam.name}</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="text-center py-4">
                              <div className="text-sm text-muted-foreground">
                                {leg.winner ? `Vítěz: ${leg.winner === 'home' ? homeTeam.name : awayTeam.name}` : 
                                 gameFinished ? 'Hra skončila' : 
                                 'Čekání na předchozí leg'}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Game Score Summary */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <div className="text-2xl font-black text-slate-900">{homeLegsWon}</div>
                        <div className="text-sm text-muted-foreground">{homeTeam.name}</div>
                      </div>
                      <div className="text-xl font-black text-slate-400">:</div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-slate-900">{awayLegsWon}</div>
                        <div className="text-sm text-muted-foreground">{awayTeam.name}</div>
                      </div>
                    </div>
                    {gameFinished && (
                      <div className="mt-3">
                        <Badge className="bg-success text-white font-bold">
                          VÍTĚZ: {homeLegsWon > awayLegsWon ? homeTeam.name : awayTeam.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Complete Game Button */}
            {availablePlayers.home.length > 0 && availablePlayers.away.length > 0 && (
              <div className="flex justify-center">
                <Button
                  onClick={completeGame}
                  disabled={!canCompleteGame()}
                  size="lg"
                  className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold px-12 py-4 text-lg disabled:opacity-50"
                >
                  {canCompleteGame() ? 'Dokončit hru' : 'Dokončete všechny legy'}
                  <CheckCircle className="h-5 w-5 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
        {/* Completed Games - For Corrections */}
        {Object.keys(gameResults).length > 0 && (
          <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 rounded-t-2xl">
              <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                DOKONČENÉ HRY
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Klikněte na hru pro opravu výsledku
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(gameResults).map(([gameId, result]: [string, any]) => {
                  const game = games.find(g => g.id === parseInt(gameId));
                  if (!game) return null;
                  
                  return (
                    <div
                      key={gameId}
                      className="p-3 rounded-xl border border-gray-200 bg-success/5 hover:bg-success/10 cursor-pointer transition-all"
                      onClick={() => onGameSelect(parseInt(gameId))}
                    >
                      <div className="text-center">
                        <Badge className="bg-success text-white font-bold text-xs mb-2">
                          HRA {gameId}
                        </Badge>
                        <div className="text-xs font-semibold text-slate-700 mb-1">
                          {game.name.split('(')[0].trim()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Vítěz: {result.winner === 'home' ? homeTeam.name : awayTeam.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}