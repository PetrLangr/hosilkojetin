"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineupManager } from './lineup-manager';
import { GameEditor } from './game-editor';
import { MatchSummary } from './match-summary';
import { PlayerStatsInput } from './player-stats-input';
import { SimpleGameInput } from './simple-game-input';
import { Users, Target, FileText, Save, BarChart3, Trophy } from 'lucide-react';
import { getTeamLogo, getTeamGradient } from '@/lib/team-logos';

// HŠL Game structure - 17 položek podle oficiálních pravidel
const HSL_GAMES = [
  // Základní singl kola
  { id: 1, type: 'single', format: 'bo3', name: '1D vs 1H (501 DO)', order: 1, positions: { home: ['D1'], away: ['H1'] } },
  { id: 2, type: 'single', format: 'bo3', name: '2D vs 2H (501 DO)', order: 2, positions: { home: ['D2'], away: ['H2'] } },
  { id: 3, type: 'single', format: 'bo3', name: '3D vs 3H (501 DO)', order: 3, positions: { home: ['D3'], away: ['H3'] } },
  
  // První Cricket
  { id: 4, type: 'double_cricket', format: 'bo1_15rounds', name: '1D+2D vs 1H+2H (Cricket)', order: 4, positions: { home: ['D1', 'D2'], away: ['H1', 'H2'] } },
  
  // První 501 dvojice
  { id: 5, type: 'double_501', format: 'bo3', name: '2D+3D vs 2H+3H (501 DO)', order: 5, positions: { home: ['D2', 'D3'], away: ['H2', 'H3'] } },
  
  // Křížové singly
  { id: 6, type: 'single', format: 'bo3', name: '1D vs 2H (501 DO)', order: 6, positions: { home: ['D1'], away: ['H2'] } },
  { id: 7, type: 'single', format: 'bo3', name: '2D vs 3H (501 DO)', order: 7, positions: { home: ['D2'], away: ['H3'] } },
  { id: 8, type: 'single', format: 'bo3', name: '3D vs 1H (501 DO)', order: 8, positions: { home: ['D3'], away: ['H1'] } },
  
  // Trojice 301
  { id: 9, type: 'triple_301', format: 'bo3', name: '1D+2D+3D vs 1H+2H+3H (301 DI/DO)', order: 9, positions: { home: ['D1', 'D2', 'D3'], away: ['H1', 'H2', 'H3'] } },
  
  // Druhý Cricket
  { id: 10, type: 'double_cricket', format: 'bo1_15rounds', name: '1D+3D vs 1H+3H (Cricket)', order: 10, positions: { home: ['D1', 'D3'], away: ['H1', 'H3'] } },
  
  // Druhá 501 dvojice
  { id: 11, type: 'double_501', format: 'bo3', name: '2D+3D vs 2H+3H (501 DO)', order: 11, positions: { home: ['D2', 'D3'], away: ['H2', 'H3'] } },
  
  // Druhé křížové singly
  { id: 12, type: 'single', format: 'bo3', name: '1D vs 3H (501 DO)', order: 12, positions: { home: ['D1'], away: ['H3'] } },
  { id: 13, type: 'single', format: 'bo3', name: '2D vs 1H (501 DO)', order: 13, positions: { home: ['D2'], away: ['H1'] } },
  { id: 14, type: 'single', format: 'bo3', name: '3D vs 2H (501 DO)', order: 14, positions: { home: ['D3'], away: ['H2'] } },
  
  // Třetí Cricket
  { id: 15, type: 'double_cricket', format: 'bo1_15rounds', name: '1D+2D vs 1H+2H (Cricket)', order: 15, positions: { home: ['D1', 'D2'], away: ['H1', 'H2'] } },
  
  // Třetí 501 dvojice
  { id: 16, type: 'double_501', format: 'bo3', name: '1D+3D vs 1H+3H (501 DO)', order: 16, positions: { home: ['D1', 'D3'], away: ['H1', 'H3'] } },
  
  // Tiebreak - jen při remíze
  { id: 17, type: 'tiebreak_701', format: 'bo1', name: 'Rozstřel - 1D+2D+3D vs 1H+2H+3H (701 DO)', order: 17, positions: { home: ['D1', 'D2', 'D3'], away: ['H1', 'H2', 'H3'] }, onlyIfTied: true },
];

interface MatchWizardProps {
  match: any; // Type this properly later
}

export function MatchWizard({ match }: MatchWizardProps) {
  const [activeTab, setActiveTab] = useState('lineups');
  const [homeLineup, setHomeLineup] = useState<string[]>([]);
  const [awayLineup, setAwayLineup] = useState<string[]>([]);
  const [gameResults, setGameResults] = useState<Record<number, any>>({});
  const [currentGame, setCurrentGame] = useState(1);
  const [events, setEvents] = useState<Record<string, any>>({});

  const handleGameComplete = (gameId: number, result: any) => {
    setGameResults(prev => ({ ...prev, [gameId]: result }));
    
    // Auto-advance to next game
    if (gameId < HSL_GAMES.length) {
      setCurrentGame(gameId + 1);
    } else {
      // All games completed, go to summary
      setActiveTab('summary');
    }
  };

  const completedGames = Object.keys(gameResults).length;
  const totalGames = HSL_GAMES.filter(game => !game.onlyIfTied).length; // 16 regular games
  const needsTiebreak = checkIfTiebreakNeeded();
  const actualTotalGames = needsTiebreak ? 17 : 16;
  const progressPercentage = (completedGames / actualTotalGames) * 100;
  
  // Check if lineups are complete (at least D1-D3 and H1-H3 required)
  const isHomeLineupComplete = homeLineup.length >= 3;
  const isAwayLineupComplete = awayLineup.length >= 3;
  const lineupsComplete = isHomeLineupComplete && isAwayLineupComplete;

  function checkIfTiebreakNeeded() {
    if (completedGames < 16) return false;
    
    // Count wins from first 16 games
    let homeWins = 0;
    let awayWins = 0;
    
    Object.values(gameResults).forEach((result: any) => {
      if (result.winner === 'home') homeWins++;
      if (result.winner === 'away') awayWins++;
    });
    
    return homeWins === awayWins; // Tied after 16 games
  }

  return (
    <div className="space-y-8">
      {/* Match Header - Athletic Style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-gray-100 card-shadow">
        <div className="p-8">
          {/* Teams Face-off */}
          <div className="flex items-center justify-center mb-8">
            {/* Home Team */}
            <div className="flex items-center gap-4">
              <div className="size-20 rounded-2xl bg-white shadow-lg border border-slate-200 p-2">
                <img 
                  src={getTeamLogo(match.homeTeam.name)}
                  alt={match.homeTeam.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-right">
                <div className="font-black text-2xl text-slate-900">{match.homeTeam.name}</div>
                <div className="text-sm text-muted-foreground font-semibold">DOMÁCÍ TÝM</div>
              </div>
            </div>
            
            {/* VS and Round */}
            <div className="mx-12 text-center">
              <div className="text-4xl font-black text-slate-400 mb-2">VS</div>
              <Badge className="bg-primary text-white px-4 py-2 font-bold text-lg">
                {match.round}. KOLO
              </Badge>
            </div>
            
            {/* Away Team */}
            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className="font-black text-2xl text-slate-900">{match.awayTeam.name}</div>
                <div className="text-sm text-muted-foreground font-semibold">HOSTUJÍCÍ TÝM</div>
              </div>
              <div className="size-20 rounded-2xl bg-white shadow-lg border border-slate-200 p-2">
                <img 
                  src={getTeamLogo(match.awayTeam.name)}
                  alt={match.awayTeam.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Progress Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge className="bg-accent text-white px-4 py-2 font-bold">
                  {completedGames}/{actualTotalGames} HER DOKONČENO
                </Badge>
                {needsTiebreak && (
                  <Badge variant="destructive" className="bg-warning text-white font-bold">
                    ROZSTŘEL POTŘEBNÝ!
                  </Badge>
                )}
                <div className="text-slate-600 font-semibold">
                  {Math.round(progressPercentage)}% hotovo
                </div>
              </div>
              <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-semibold">
                <Save className="h-4 w-4 mr-2" />
                Uložit průběh
              </Button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 shadow-sm" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Decorative dart ring */}
        <div className="absolute -bottom-16 -right-16 size-32 rounded-full border-4 border-primary/10" />
      </div>

      {/* Athletic Navigation */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { 
            id: 'lineups', 
            icon: Users, 
            label: 'SESTAVY', 
            description: 'Nastavení pozic D1-D3, H1-H3',
            enabled: true,
            required: true
          },
          { 
            id: 'games', 
            icon: Target, 
            label: `VÝSLEDKY (${completedGames}/${actualTotalGames})`, 
            description: 'Jednoduché zadávání 2:1, 2:0',
            enabled: lineupsComplete,
            required: false
          },
          { 
            id: 'stats', 
            icon: BarChart3, 
            label: 'STATISTIKY', 
            description: '95+, 133+, 170+, CO3-6',
            enabled: lineupsComplete,
            required: false
          },
          { 
            id: 'export', 
            icon: Save, 
            label: 'EXPORT', 
            description: 'PDF zápis',
            enabled: completedGames >= 16,
            required: false
          }
        ].map(({ id, icon: Icon, label, description, enabled, required }) => (
          <Card 
            key={id}
            className={`rounded-2xl border transition-all duration-300 ${
              !enabled 
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                : activeTab === id 
                  ? 'bg-gradient-to-br from-primary to-accent text-white border-primary shadow-xl transform -translate-y-1 cursor-pointer hover:shadow-lg hover:-translate-y-1' 
                  : 'bg-white border-gray-100 text-slate-900 hover:border-primary/30 cursor-pointer hover:shadow-lg hover:-translate-y-1'
            }`}
            onClick={() => enabled && setActiveTab(id)}
          >
            <CardContent className="p-4 text-center">
              <Icon className={`h-6 w-6 mx-auto mb-2 ${
                !enabled ? 'text-gray-400' : 
                activeTab === id ? 'text-white' : 'text-primary'
              }`} />
              <div className={`font-black text-sm mb-1 ${
                !enabled ? 'text-gray-500' :
                activeTab === id ? 'text-white' : 'text-slate-900'
              }`}>
                {label}
              </div>
              <div className={`text-xs ${
                !enabled ? 'text-gray-400' :
                activeTab === id ? 'text-white/80' : 'text-muted-foreground'
              }`}>
                {description}
              </div>
              {required && !lineupsComplete && (
                <div className="mt-2">
                  <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                    POVINNÉ
                  </div>
                </div>
              )}
              {!enabled && id !== 'lineups' && (
                <div className="mt-2">
                  <div className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
                    ZABLOKOVÁNO
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8">

        {activeTab === 'games' && (
          <div className="space-y-6">
            {!lineupsComplete ? (
              <Card className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
                <CardContent className="p-8 text-center">
                  <div className="size-16 rounded-full bg-red-100 grid place-items-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">NEJPRVE NASTAVTE SESTAVY</h3>
                  <p className="text-slate-600 mb-6">
                    Pro zadávání výsledků musíte nejprve nastavit základní sestavy obou týmů (pozice D1-D3 a H1-H3).
                  </p>
                  <Button 
                    onClick={() => setActiveTab('lineups')}
                    className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Nastavit sestavy
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">ZADÁVÁNÍ VÝSLEDKŮ</h2>
                  <p className="text-slate-600 font-medium">
                    Jednoduché zadávání - stačí vybrat 2:1, 2:0 a vítěze
                  </p>
                </div>
            
                <SimpleGameInput
                  games={needsTiebreak ? HSL_GAMES : HSL_GAMES.filter(game => !game.onlyIfTied)}
                  gameResults={gameResults}
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  homeLineup={homeLineup}
                  awayLineup={awayLineup}
                  onGameComplete={handleGameComplete}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {!lineupsComplete ? (
              <Card className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
                <CardContent className="p-8 text-center">
                  <div className="size-16 rounded-full bg-red-100 grid place-items-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">NEJPRVE NASTAVTE SESTAVY</h3>
                  <p className="text-slate-600 mb-6">
                    Pro zadávání statistik musíte nejprve nastavit základní sestavy obou týmů.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('lineups')}
                    className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Nastavit sestavy
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">STATISTIKY HRÁČŮ</h2>
                  <p className="text-slate-600 font-medium">
                    Zadejte eventy pro všechny hráče z obou týmů
                  </p>
                </div>
                
                <PlayerStatsInput
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  events={events}
                  onEventsChange={setEvents}
                />
              </>
            )}
          </div>
        )}


        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2">PDF EXPORT</h2>
              <p className="text-slate-600 font-medium mb-8">
                Oficiální zápis zápasu s podpisy kapitánů a QR kódem
              </p>
              
              <Card className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-gray-100 p-8 max-w-md mx-auto">
                <div className="text-center space-y-4">
                  <div className="size-16 rounded-full bg-primary grid place-items-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900">PŘIPRAVENO K EXPORTU</h3>
                  <p className="text-sm text-slate-600">
                    PDF bude obsahovat všechny výsledky, statistiky a místa pro podpisy kapitánů
                  </p>
                  <Button className="w-full rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold py-3">
                    <FileText className="h-4 w-4 mr-2" />
                    Stáhnout oficiální zápis
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'lineups' && (
          <LineupManager
            match={match}
            homeLineup={homeLineup}
            awayLineup={awayLineup}
            onHomeLineupChange={setHomeLineup}
            onAwayLineupChange={setAwayLineup}
            onComplete={() => setActiveTab('games')}
          />
        )}
      </div>
    </div>
  );
}