"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Trophy, CheckCircle, Edit, ArrowRight, RefreshCw } from 'lucide-react';
import { getTeamLogo } from '@/lib/team-logos';

interface SimpleGameInputProps {
  games: any[];
  gameResults: Record<number, any>;
  homeTeam: any;
  awayTeam: any;
  homeLineup: string[];
  awayLineup: string[];
  onGameComplete: (gameId: number, result: any) => void;
}

export function SimpleGameInput({
  games,
  gameResults,
  homeTeam,
  awayTeam,
  homeLineup,
  awayLineup,
  onGameComplete
}: SimpleGameInputProps) {
  const [editingGame, setEditingGame] = useState<number | null>(null);
  const [tempResult, setTempResult] = useState({ homeLegs: '', awayLegs: '', winner: '' });
  const [substitutions, setSubstitutions] = useState<Record<number, any>>({});
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  
  // Track active substitutions across all games
  const [activeSubstitutions, setActiveSubstitutions] = useState<{home: Record<string, string>, away: Record<string, string>}>({
    home: {}, // D1: 'playerId' (who is currently playing D1)
    away: {}  // H1: 'playerId' 
  });

  // Find next game to play
  const nextGameId = games.find(game => !gameResults[game.id])?.id || null;
  const currentGame = editingGame || nextGameId;
  const currentGameData = games.find(g => g.id === currentGame);

  // Get current player for a position (considering active substitutions)
  const getCurrentPlayer = (position: string, lineup: string[], team: any, isHome: boolean) => {
    const activeSubs = isHome ? activeSubstitutions.home : activeSubstitutions.away;
    
    // Check if position is currently substituted
    if (activeSubs[position]) {
      const currentPlayerId = activeSubs[position];
      const player = team.players.find((p: any) => p.id === currentPlayerId);
      return player;
    }
    
    // Default lineup player
    const index = position === 'D1' || position === 'H1' ? 0 : 
                 position === 'D2' || position === 'H2' ? 1 : 
                 position === 'D3' || position === 'H3' ? 2 : -1;
    const playerId = lineup[index];
    return team.players.find((p: any) => p.id === playerId);
  };

  // Get player names for current game positions
  const getPlayerNames = (positions: string[], lineup: string[], team: any, isHome: boolean) => {
    return positions.map(pos => {
      const player = getCurrentPlayer(pos, lineup, team, isHome);
      return player ? player.name : pos;
    }).join(' + ');
  };

  const getAvailableSubstitutes = (team: any, lineup: string[], isHome: boolean) => {
    // Get D4-D6 or H4-H6 players who are not currently playing any position
    const substitutePlayers = lineup.slice(3).map(playerId => team.players.find((p: any) => p.id === playerId)).filter(Boolean);
    const activeSubs = isHome ? activeSubstitutions.home : activeSubstitutions.away;
    const currentlyPlayingIds = Object.values(activeSubs);
    
    return substitutePlayers.filter(player => !currentlyPlayingIds.includes(player.id));
  };
  
  const getOriginalPlayer = (position: string, lineup: string[], team: any) => {
    const index = position === 'D1' || position === 'H1' ? 0 : 
                 position === 'D2' || position === 'H2' ? 1 : 
                 position === 'D3' || position === 'H3' ? 2 : -1;
    const playerId = lineup[index];
    return team.players.find((p: any) => p.id === playerId);
  };

  const makeSubstitution = (position: string, newPlayerId: string, isHome: boolean) => {
    const activeSubs = isHome ? { ...activeSubstitutions.home } : { ...activeSubstitutions.away };
    
    if (newPlayerId === 'original') {
      // Return to original player
      delete activeSubs[position];
    } else {
      // Make substitution
      activeSubs[position] = newPlayerId;
    }
    
    setActiveSubstitutions(prev => ({
      ...prev,
      [isHome ? 'home' : 'away']: activeSubs
    }));
  };

  const startEdit = (gameId: number) => {
    const existingResult = gameResults[gameId];
    if (existingResult) {
      setTempResult({
        homeLegs: existingResult.homeLegs || '',
        awayLegs: existingResult.awayLegs || '',
        winner: existingResult.winner || ''
      });
    } else {
      setTempResult({ homeLegs: '', awayLegs: '', winner: '' });
    }
    setEditingGame(gameId);
  };

  const saveGame = () => {
    if (!currentGame || !tempResult.homeLegs || !tempResult.awayLegs || !tempResult.winner) return;
    
    const result = {
      homeLegs: parseInt(tempResult.homeLegs),
      awayLegs: parseInt(tempResult.awayLegs),
      winner: tempResult.winner,
      participants: {
        home: homeLineup,
        away: awayLineup
      }
    };

    onGameComplete(currentGame, result);
    setEditingGame(null);
    setTempResult({ homeLegs: '', awayLegs: '', winner: '' });
  };

  const getValidScores = () => {
    return [
      { home: 2, away: 0, label: '2:0' },
      { home: 2, away: 1, label: '2:1' },
      { home: 0, away: 2, label: '0:2' },
      { home: 1, away: 2, label: '1:2' }
    ];
  };

  const completedGames = Object.keys(gameResults).length;
  const totalGames = games.length;

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <Card className="rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-2">PRŮBĚH ZÁPASU</h3>
              <p className="text-slate-600">
                {completedGames}/{totalGames} her dokončeno
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-primary">{Math.round((completedGames/totalGames) * 100)}%</div>
              <div className="text-sm text-muted-foreground">hotovo</div>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500" 
              style={{ width: `${(completedGames/totalGames) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current/Next Game */}
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {getPlayerNames(currentGameData.positions.home, homeLineup, homeTeam, true)} vs {getPlayerNames(currentGameData.positions.away, awayLineup, awayTeam, false)}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowSubstitutions(!showSubstitutions)}
                      className="rounded-lg text-xs hover:bg-slate-100"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      STŘÍDÁNÍ
                    </Button>
                  </div>
                </div>
              </div>
              <Badge className={`font-bold text-lg px-4 py-2 ${
                gameResults[currentGame] ? "bg-success text-white" : editingGame ? "bg-warning text-white" : "bg-accent text-white"
              }`}>
                {gameResults[currentGame] ? "DOKONČENO" : editingGame ? "ÚPRAVA" : "ZADÁVÁNÍ"}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Substitution Interface */}
            {showSubstitutions && currentGame && !gameResults[currentGame] && (
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-gray-200">
                <h4 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  STŘÍDÁNÍ PRO TUTO HRU
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Home Substitutions */}
                  <div>
                    <h5 className="font-bold text-slate-900 mb-3">{homeTeam.name}</h5>
                    {currentGameData.positions.home.map((pos: string) => {
                      const currentPlayer = getCurrentPlayer(pos, homeLineup, homeTeam, true);
                      const originalPlayer = getOriginalPlayer(pos, homeLineup, homeTeam);
                      const availableSubs = getAvailableSubstitutes(homeTeam, homeLineup, true);
                      const isSubstituted = activeSubstitutions.home[pos];
                      
                      return (
                        <div key={pos} className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="w-8 h-6 text-xs">{pos}</Badge>
                          <div className="flex-1 text-sm">
                            <span className="font-semibold">{currentPlayer?.name || 'Nevybráno'}</span>
                            {isSubstituted && (
                              <span className="text-primary ml-1">(↔ střídá {originalPlayer?.name})</span>
                            )}
                          </div>
                          <Select
                            value={activeSubstitutions.home[pos] ? activeSubstitutions.home[pos] : 'original'}
                            onValueChange={(value) => makeSubstitution(pos, value, true)}
                          >
                            <SelectTrigger className="w-32 text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="original">{originalPlayer?.name}</SelectItem>
                              {availableSubs.map((sub: any) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Away Substitutions */}
                  <div>
                    <h5 className="font-bold text-slate-900 mb-3">{awayTeam.name}</h5>
                    {currentGameData.positions.away.map((pos: string) => {
                      const currentPlayer = getCurrentPlayer(pos, awayLineup, awayTeam, false);
                      const originalPlayer = getOriginalPlayer(pos, awayLineup, awayTeam);
                      const availableSubs = getAvailableSubstitutes(awayTeam, awayLineup, false);
                      const isSubstituted = activeSubstitutions.away[pos];
                      
                      return (
                        <div key={pos} className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="w-8 h-6 text-xs">{pos}</Badge>
                          <div className="flex-1 text-sm">
                            <span className="font-semibold">{currentPlayer?.name || 'Nevybráno'}</span>
                            {isSubstituted && (
                              <span className="text-primary ml-1">(↔ střídá {originalPlayer?.name})</span>
                            )}
                          </div>
                          <Select
                            value={activeSubstitutions.away[pos] ? activeSubstitutions.away[pos] : 'original'}
                            onValueChange={(value) => makeSubstitution(pos, value, false)}
                          >
                            <SelectTrigger className="w-32 text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="original">{originalPlayer?.name}</SelectItem>
                              {availableSubs.map((sub: any) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* Teams vs Teams */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-8">
                {/* Home Team */}
                <div className="text-center">
                  <div className="size-16 rounded-xl bg-white shadow-lg border border-slate-200 p-2 mx-auto mb-3">
                    <img 
                      src={getTeamLogo(homeTeam.name)}
                      alt={homeTeam.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="font-black text-lg text-slate-900">{homeTeam.name}</div>
                  <div className="text-sm text-muted-foreground">DOMÁCÍ</div>
                </div>
                
                {/* Score Input */}
                <div className="text-center">
                  <div className="bg-slate-50 rounded-2xl p-6 min-w-[200px]">
                    <div className="space-y-4">
                      <div className="text-lg font-bold text-slate-600 mb-4">VÝSLEDEK (BO3)</div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {getValidScores().map((score) => (
                          <Button
                            key={score.label}
                            size="sm"
                            variant={tempResult.homeLegs === score.home.toString() && tempResult.awayLegs === score.away.toString() ? "default" : "outline"}
                            className={`rounded-xl font-bold ${
                              tempResult.homeLegs === score.home.toString() && tempResult.awayLegs === score.away.toString() 
                                ? "bg-primary text-white" 
                                : "border-slate-300 hover:border-primary"
                            }`}
                            onClick={() => {
                              setTempResult({
                                homeLegs: score.home.toString(),
                                awayLegs: score.away.toString(),
                                winner: score.home > score.away ? 'home' : 'away'
                              });
                            }}
                          >
                            {score.label}
                          </Button>
                        ))}
                      </div>
                      
                      {tempResult.homeLegs && tempResult.awayLegs && (
                        <div className="mt-4 p-3 bg-white rounded-xl border">
                          <div className="text-sm text-slate-600 mb-1">Vítěz:</div>
                          <div className="font-black text-primary">
                            {tempResult.winner === 'home' ? homeTeam.name : awayTeam.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Away Team */}
                <div className="text-center">
                  <div className="size-16 rounded-xl bg-white shadow-lg border border-slate-200 p-2 mx-auto mb-3">
                    <img 
                      src={getTeamLogo(awayTeam.name)}
                      alt={awayTeam.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="font-black text-lg text-slate-900">{awayTeam.name}</div>
                  <div className="text-sm text-muted-foreground">HOSTÉ</div>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-center gap-4">
              {editingGame && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingGame(null);
                    setTempResult({ homeLegs: '', awayLegs: '', winner: '' });
                  }}
                  className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Zrušit
                </Button>
              )}
              
              <Button
                onClick={saveGame}
                disabled={!tempResult.homeLegs || !tempResult.awayLegs || !tempResult.winner}
                className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold px-8 py-3 text-lg"
              >
                {editingGame ? 'Uložit opravu' : 'Dokončit hru'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Games Grid */}
      {Object.keys(gameResults).length > 0 && (
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 rounded-t-2xl">
            <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-success" />
              DOKONČENÉ HRY ({Object.keys(gameResults).length}/{games.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Klikněte na hru pro úpravu výsledku
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(gameResults).map(([gameId, result]: [string, any]) => {
                const game = games.find(g => g.id === parseInt(gameId));
                if (!game) return null;
                
                return (
                  <div
                    key={gameId}
                    className="p-4 rounded-xl border border-gray-200 bg-success/5 hover:bg-success/10 cursor-pointer transition-all group"
                    onClick={() => startEdit(parseInt(gameId))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-success text-white font-bold text-xs">
                        HRA {gameId}
                      </Badge>
                      <Edit className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                    </div>
                    
                    <div className="text-sm font-black text-slate-900 mb-2">
                      {game.name.split('(')[0].trim()}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-black text-primary">
                        {result.homeLegs}:{result.awayLegs}
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

      {/* Live Match Summary - Progressive Report */}
      <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 rounded-t-2xl">
          <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            ZÁPIS ZÁPASU
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Postupně se doplňuje během zadávání her - ready pro export
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Match Header */}
          <div className="text-center mb-6 pb-6 border-b border-gray-100">
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {homeTeam.name} vs {awayTeam.name}
            </h3>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline">{currentGame ? `${Object.keys(gameResults).length}/${games.length}` : '0'} her dokončeno</Badge>
              <Badge variant="outline">Kolo {games[0]?.round || 1}</Badge>
            </div>
          </div>

          {/* Games Results Table */}
          {Object.keys(gameResults).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(gameResults)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([gameId, result]: [string, any]) => {
                  const game = games.find(g => g.id === parseInt(gameId));
                  if (!game) return null;

                  return (
                    <div key={gameId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <Badge className="bg-slate-600 text-white font-bold">
                          {gameId}
                        </Badge>
                        <div>
                          <div className="font-bold text-sm text-slate-900">
                            {game.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getPlayerNames(game.positions.home, homeLineup, homeTeam)} vs {getPlayerNames(game.positions.away, awayLineup, awayTeam)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-black text-primary">
                          {result.homeLegs}:{result.awayLegs}
                        </div>
                        <Badge className={`font-semibold ${
                          result.winner === 'home' ? 'bg-primary text-white' : 'bg-accent text-white'
                        }`}>
                          {result.winner === 'home' ? homeTeam.name : awayTeam.name}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Trophy className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Výsledky her se budou zobrazovat postupně</p>
            </div>
          )}

          {/* Match Summary */}
          {Object.keys(gameResults).length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-6 text-center mb-6">
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {Object.values(gameResults).filter((r: any) => r.winner === 'home').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Výhry {homeTeam.name}</div>
                </div>
                <div>
                  <div className="text-xl font-black text-slate-400">:</div>
                  <div className="text-sm text-muted-foreground">Poměr</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {Object.values(gameResults).filter((r: any) => r.winner === 'away').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Výhry {awayTeam.name}</div>
                </div>
              </div>
              
              {/* Leg Summary */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-black text-slate-900 mb-4 text-center">CELKOVÉ LEGY</h4>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-black text-primary">
                      {Object.values(gameResults).reduce((total: number, r: any) => total + (r.homeLegs || 0), 0)}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">{homeTeam.name}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-400">:</div>
                    <div className="text-sm text-slate-600 font-semibold">LEGY</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-accent">
                      {Object.values(gameResults).reduce((total: number, r: any) => total + (r.awayLegs || 0), 0)}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">{awayTeam.name}</div>
                  </div>
                </div>
                
                {/* Leg Difference */}
                <div className="mt-4 text-center">
                  <div className="text-sm text-slate-600 mb-1">Rozdíl legů</div>
                  <div className={`text-lg font-black ${
                    (Object.values(gameResults).reduce((total: number, r: any) => total + (r.homeLegs || 0), 0) - 
                     Object.values(gameResults).reduce((total: number, r: any) => total + (r.awayLegs || 0), 0)) > 0 
                      ? 'text-primary' : 'text-accent'
                  }`}>
                    {Object.values(gameResults).reduce((total: number, r: any) => total + (r.homeLegs || 0), 0) - 
                     Object.values(gameResults).reduce((total: number, r: any) => total + (r.awayLegs || 0), 0) >= 0 ? '+' : ''}
                    {Object.values(gameResults).reduce((total: number, r: any) => total + (r.homeLegs || 0), 0) - 
                     Object.values(gameResults).reduce((total: number, r: any) => total + (r.awayLegs || 0), 0)}
                  </div>
                </div>
              </div>
              
              {Object.keys(gameResults).length === games.length && (
                <div className="mt-6 text-center">
                  <Badge className="bg-success text-white font-black text-lg px-6 py-3">
                    ZÁPAS DOKONČEN
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}