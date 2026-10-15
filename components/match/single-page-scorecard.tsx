"use client";

import { useState, useEffect, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Save, FileText, Edit, ArrowUpDown, Check, X, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { TeamMark } from '@/components/admin/admin-ui';
import { getTeamLogo } from '@/lib/team-logos';
import { ImprovedSubstitution } from './improved-substitution';

/** Rámeček sekce zápisu — stejný vzor jako panely v administraci. */
function Panel({ title, meta, action, children }: {
  title: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex h-10 items-center justify-between gap-2 border-b border-border bg-muted px-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="truncate text-sm font-semibold text-slate-900">{title}</h2>
          {meta != null && <span className="shrink-0 text-xs text-muted-foreground tnum">{meta}</span>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// Hry jdou v pořadí papírového zápisu; disciplína je u řádku jen jako popisek.
const DISCIPLINE_LABELS: Record<string, string> = {
  single: 'Single 501',
  double_501: 'Dvojice 501',
  double_cricket: 'Cricket',
  triple_301: 'Trojice 301',
  tiebreak_701: 'Rozstřel 701',
};

// HŠL Game structure - správné pořadí podle oficiálního zápisu
const HSL_GAMES = [
  // Podle papírového zápisu - přesné pořadí a formáty
  { id: 1, type: 'single', name: '1D vs 3H', format: '501 DO', positions: { home: 'D1', away: 'H3' } },
  { id: 2, type: 'single', name: '2D vs 1H', format: '501 DO', positions: { home: 'D2', away: 'H1' } },
  { id: 3, type: 'single', name: '3D vs 2H', format: '501 DO', positions: { home: 'D3', away: 'H2' } },
  { id: 4, type: 'double_cricket', name: '1D+2D vs 1H+3H', format: 'Cricket (Bo1)', positions: { home: 'D1+D2', away: 'H1+H3' } },
  { id: 5, type: 'double_501', name: '2D+3D vs 2H+3H', format: '501 DO - tým', positions: { home: 'D2+D3', away: 'H2+H3' } },
  { id: 6, type: 'single', name: '1D vs 2H', format: '501 DO', positions: { home: 'D1', away: 'H2' } },
  { id: 7, type: 'single', name: '3D vs 1H', format: '501 DO', positions: { home: 'D3', away: 'H1' } },
  { id: 8, type: 'single', name: '2D vs 3H', format: '501 DO', positions: { home: 'D2', away: 'H3' } },
  { id: 9, type: 'triple_301', name: '3x D vs 3x H', format: '301 DI/DO', positions: { home: 'D1+D2+D3', away: 'H1+H2+H3' } },
  { id: 10, type: 'double_cricket', name: '2D+3D vs 1H+2H', format: 'Cricket (Bo1)', positions: { home: 'D2+D3', away: 'H1+H2' } },
  { id: 11, type: 'double_501', name: '1D+3D vs 1H+3H', format: '501 DO - tým', positions: { home: 'D1+D3', away: 'H1+H3' } },
  { id: 12, type: 'single', name: '2D vs 2H', format: '501 DO', positions: { home: 'D2', away: 'H2' } },
  { id: 13, type: 'single', name: '1D vs 1H', format: '501 DO', positions: { home: 'D1', away: 'H1' } },
  { id: 14, type: 'single', name: '3D vs 3H', format: '501 DO', positions: { home: 'D3', away: 'H3' } },
  { id: 15, type: 'double_cricket', name: '1D+3D vs 2H+3H', format: 'Cricket (Bo1)', positions: { home: 'D1+D3', away: 'H2+H3' } },
  { id: 16, type: 'double_501', name: '1D+2D vs 1H+2H', format: '501 DO - tým', positions: { home: 'D1+D2', away: 'H1+H2' } },
  // Rozstřel (jen při remíze)
  { id: 17, type: 'tiebreak_701', name: 'Rozstřel 3x D vs 3x H', format: '701 DO (Bo1)', positions: { home: 'D1+D2+D3', away: 'H1+H2+H3' }, onlyIfTied: true }
];

interface SinglePageScorecardProps {
  match: any;
}

export function SinglePageScorecard({ match }: SinglePageScorecardProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('lineups');
  const [lineupsSaved, setLineupsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [homeLineup, setHomeLineup] = useState<Record<string, string>>({ 
    D1: '', D2: '', D3: '', D4: '', D5: '', D6: '' 
  });
  const [awayLineup, setAwayLineup] = useState<Record<string, string>>({ 
    H1: '', H2: '', H3: '', H4: '', H5: '', H6: '' 
  });
  const [gameResults, setGameResults] = useState<Record<number, { homeScore: number; awayScore: number; winner: 'home' | 'away' }>>({});
  const [playerStats, setPlayerStats] = useState<Record<string, { S95: number; S133: number; S170: number; CO3: number; CO4: number; CO5: number; CO6: number }>>({});
  const [substitutions, setSubstitutions] = useState<Record<number, { home?: string; away?: string }>>({});

  // Track substitution pairs (e.g., D3↔D4) - once paired, they can only substitute with each other
  const [substitutionPairs, setSubstitutionPairs] = useState<Record<string, string>>({});

  // Quick substitution dialog state
  const [showSubstitutionDialog, setShowSubstitutionDialog] = useState(false);
  const [substitutionData, setSubstitutionData] = useState<{
    gameId: number;
    team: 'home' | 'away';
    teamName: string;
  } | null>(null);
  
  // Check if basic lineups are filled (D1-D3, H1-H3)
  const basicLineupsFilled = homeLineup.D1 && homeLineup.D1 !== 'none' && 
                             homeLineup.D2 && homeLineup.D2 !== 'none' && 
                             homeLineup.D3 && homeLineup.D3 !== 'none' && 
                             awayLineup.H1 && awayLineup.H1 !== 'none' && 
                             awayLineup.H2 && awayLineup.H2 !== 'none' && 
                             awayLineup.H3 && awayLineup.H3 !== 'none';

  // Get all currently selected players to filter from dropdowns
  const getAllSelectedPlayers = () => {
    return [
      ...Object.values(homeLineup).filter(id => id && id !== 'none'),
      ...Object.values(awayLineup).filter(id => id && id !== 'none')
    ];
  };

  // Get available players for a specific position (excluding already selected)
  const getAvailablePlayersForPosition = (teamPlayers: any[], currentPosition: string, currentTeam: 'home' | 'away') => {
    const selectedPlayers = getAllSelectedPlayers();
    const currentLineup = currentTeam === 'home' ? homeLineup : awayLineup;
    const currentSelection = currentLineup[currentPosition];
    
    return teamPlayers.filter(player => 
      !selectedPlayers.includes(player.id) || player.id === currentSelection
    );
  };

  const lineupsValid = basicLineupsFilled;
  
  // Calculate current match score
  const homeWins = Object.values(gameResults).filter(result => result.winner === 'home').length;
  const awayWins = Object.values(gameResults).filter(result => result.winner === 'away').length;
  
  // Check if tiebreak is needed (only after 16 regular games)
  const regularGamesCompleted = Object.keys(gameResults).filter(id => parseInt(id) <= 16).length;
  const regularHomeWins = Object.entries(gameResults)
    .filter(([id, _]) => parseInt(id) <= 16)
    .filter(([_, result]) => result.winner === 'home').length;
  const regularAwayWins = Object.entries(gameResults)
    .filter(([id, _]) => parseInt(id) <= 16)
    .filter(([_, result]) => result.winner === 'away').length;
    
  const isTied = regularGamesCompleted >= 16 && regularHomeWins === regularAwayWins;
  const tiebreakStarted = gameResults[17] !== undefined;
  
  const completedGames = Object.keys(gameResults).length;
  const totalGames = (isTied || tiebreakStarted) ? 17 : 16;

  // Load existing match data on component mount
  useEffect(() => {
    const loadMatchData = async () => {
      if (match.result && typeof match.result === 'object') {
        // Load existing lineups
        if (match.result.homeLineup) {
          setHomeLineup(match.result.homeLineup);
        }
        if (match.result.awayLineup) {
          setAwayLineup(match.result.awayLineup);
        }
        
        // Check if lineups are complete
        const homeValid = match.result.homeLineup?.D1 && match.result.homeLineup?.D2 && match.result.homeLineup?.D3;
        const awayValid = match.result.awayLineup?.H1 && match.result.awayLineup?.H2 && match.result.awayLineup?.H3;
        
        if (homeValid && awayValid) {
          setLineupsSaved(true);
          setActiveTab('results');
        }
      }

      // Load existing games from database
      try {
        const response = await fetch(`/api/matches/${match.id}`);
        if (response.ok) {
          const matchData = await response.json();

          // Load lineups from match result if available
          if (matchData.result?.homeLineup) {
            setHomeLineup(matchData.result.homeLineup);
          }
          if (matchData.result?.awayLineup) {
            setAwayLineup(matchData.result.awayLineup);
          }

          // Load game results and events from Games table
          if (matchData.games && matchData.games.length > 0) {
            const loadedResults: Record<number, any> = {};
            const loadedEvents: Record<string, any> = {};

            matchData.games.forEach((game: any) => {
              if (game.result) {
                loadedResults[game.order] = {
                  homeScore: game.result.homeScore,
                  awayScore: game.result.awayScore,
                  winner: game.result.winner
                };

                // Load events for singles games
                if (game.result.events) {
                  if (!loadedEvents[game.order]) {
                    loadedEvents[game.order] = {};
                  }
                  loadedEvents[game.order] = game.result.events;
                }
              }
            });

            setGameResults(loadedResults);
            setPlayerStats(loadedEvents);
            console.log('Loaded game results:', loadedResults);
            console.log('Loaded player events:', loadedEvents);

            // Mark lineups as saved if we have lineup data
            if (matchData.result?.homeLineup && matchData.result?.awayLineup) {
              setLineupsSaved(true);
            }
          }

          // Also try to load from match.result.gameResults (legacy format)
          else if (matchData.result?.gameResults) {
            const loadedResults: Record<number, any> = {};
            Object.entries(matchData.result.gameResults).forEach(([gameId, gameData]: [string, any]) => {
              loadedResults[parseInt(gameId)] = {
                homeScore: gameData.homeScore,
                awayScore: gameData.awayScore,
                winner: gameData.winner
              };
            });
            setGameResults(loadedResults);
            console.log('Loaded from match.result:', loadedResults);
          }
        }
      } catch (error) {
        console.error('Error loading match data:', error);
      }
    };

    loadMatchData();
  }, [match.id, match.result]);

  const saveLineups = () => {
    if (lineupsValid) {
      setLineupsSaved(true);
      setActiveTab('results');
    }
  };

  const editLineups = () => {
    setLineupsSaved(false);
    setActiveTab('lineups');
  };

  const saveMatch = async () => {
    setSaving(true);
    try {
      // Prepare game results for API
      const apiGameResults: Record<string, any> = {};
      
      Object.entries(gameResults).forEach(([gameId, result]) => {
        const game = HSL_GAMES.find(g => g.id === parseInt(gameId));
        if (game && result) {
          apiGameResults[gameId] = {
            type: game.type,
            format: game.format,
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            winner: result.winner,
            participants: {
              home: game.type === 'single'
                ? [getEffectivePlayer(game.positions.home, gameId, 'home')]
                : game.positions.home.split('+').map(pos => getEffectivePlayer(pos, gameId, 'home')),
              away: game.type === 'single'
                ? [getEffectivePlayer(game.positions.away, gameId, 'away')]
                : game.positions.away.split('+').map(pos => getEffectivePlayer(pos, gameId, 'away'))
            },
            events: {} // Will be populated from playerStats for singles
          };

          // Add player events for singles
          if (game.type === 'single') {
            const homePlayerId = getEffectivePlayer(game.positions.home, gameId, 'home');
            const awayPlayerId = getEffectivePlayer(game.positions.away, gameId, 'away');

            apiGameResults[gameId].events = {
              [homePlayerId]: playerStats[homePlayerId] || {},
              [awayPlayerId]: playerStats[awayPlayerId] || {}
            };
          }
        }
      });

      // Determine status based on user role
      const isAdmin = session?.user?.role === 'admin';
      const newStatus = isAdmin ? 'completed' : 'pending_approval';

      // Prepare match result summary
      const matchResult = {
        homeScore: homeWins,
        awayScore: awayWins,
        summary: `${match.homeTeam.name} ${homeWins > awayWins ? 'wins' : awayWins > homeWins ? 'loses' : 'draws'} ${homeWins}-${awayWins}`,
        status: newStatus,
        homeLineup,
        awayLineup,
        gameResults, // Store game results for later loading
        totalLegs: {
          home: Object.values(gameResults).reduce((sum, result) => sum + (result?.homeScore || 0), 0),
          away: Object.values(gameResults).reduce((sum, result) => sum + (result?.awayScore || 0), 0)
        }
      };

      const response = await fetch(`/api/matches/${match.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameResults: apiGameResults,
          matchResult
        })
      });

      if (response.ok) {
        const message = isAdmin 
          ? 'Zápas byl úspěšně uložen a schválen!'
          : 'Zápas byl uložen a čeká na schválení administrátorem.';
        alert(message);
        // Optionally redirect or refresh
      } else {
        const error = await response.json();
        alert(`Chyba při ukládání: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Chyba při ukládání zápasu');
    } finally {
      setSaving(false);
    }
  };

  const updateGameResult = (gameId: number, homeScore: number, awayScore: number) => {
    const winner = homeScore > awayScore ? 'home' : 'away';
    setGameResults(prev => ({
      ...prev,
      [gameId]: { homeScore, awayScore, winner }
    }));
  };

  const updatePlayerStat = (playerId: string, stat: string, value: number) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [stat]: value
      }
    }));
  };

  // Get effective player for a position considering substitutions
  const getEffectivePlayer = (position: string, gameId: number, team: 'home' | 'away') => {
    const lineup = team === 'home' ? homeLineup : awayLineup;
    const basePlayer = lineup[position];

    // Check if there's a substitution active for THIS SPECIFIC GAME only
    const sub = substitutions[gameId];
    if (sub && sub[team]) {
      // Handle multiple substitutions separated by commas
      const substitutionList = sub[team]!.split(', ');
      for (const substitution of substitutionList) {
        const [originalPos, substitutePos] = substitution.split('→');
        if (originalPos === position) {
          return lineup[substitutePos] || basePlayer;
        }
      }
    }

    return basePlayer;
  };

  // Get current substitution for a position in THIS SPECIFIC GAME only
  const getCurrentSubstitution = (position: string, gameId: number, team: 'home' | 'away') => {
    const sub = substitutions[gameId];
    if (sub && sub[team]) {
      // Handle multiple substitutions separated by commas
      const substitutionList = sub[team]!.split(', ');
      for (const substitution of substitutionList) {
        const [originalPos, substitutePos] = substitution.split('→');
        if (originalPos === position) {
          return `${originalPos}→${substitutePos}`;
        }
      }
    }
    return null;
  };

  // Get substitution options for a specific game (only for players actually playing)
  const getSubstitutionOptions = (gameId: number, team: 'home' | 'away') => {
    const game = HSL_GAMES.find(g => g.id === gameId);
    if (!game) return [];

    const lineup = team === 'home' ? homeLineup : awayLineup;
    const substitutePositions = team === 'home' ? ['D4', 'D5', 'D6'] : ['H4', 'H5', 'H6'];

    // Get positions that actually play in this game
    const gamePositions = team === 'home' ? game.positions.home : game.positions.away;
    const playingPositions = gamePositions.includes('+')
      ? gamePositions.split('+')
      : [gamePositions];

    const options = [];

    // Game 9 (301 triple) allows any substitutions
    const isGame9 = gameId === 9;

    // Only show substitutions for players actually playing in this game
    playingPositions.forEach(playingPos => {
      if (lineup[playingPos] && lineup[playingPos] !== 'none') {

        // Check if this position is currently substituted
        const currentSub = getCurrentSubstitution(playingPos, gameId, team);

        if (currentSub && !currentSub.includes('→' + playingPos)) {
          // If already substituted (and not reverted), offer option to revert
          const [originalPos, currentSubPos] = currentSub.split('→');

          // Option to revert to original (only if actually substituted)
          if (originalPos !== currentSubPos) {
            const originalPlayer = match[team === 'home' ? 'homeTeam' : 'awayTeam'].players?.find((p: any) => p.id === lineup[originalPos])?.name || originalPos;
            options.push({
              value: `${originalPos}→${originalPos}`, // Revert
              label: `Zpět na ${originalPlayer} (${originalPos})`
            });
          }
        } else {
          // Not substituted, offer substitution options

          if (isGame9) {
            // Game 9: Allow any substitution with any substitute position
            substitutePositions.forEach(subPos => {
              if (lineup[subPos] && lineup[subPos] !== 'none') {
                const playingPlayer = match[team === 'home' ? 'homeTeam' : 'awayTeam'].players?.find((p: any) => p.id === lineup[playingPos])?.name || playingPos;
                const subPlayer = match[team === 'home' ? 'homeTeam' : 'awayTeam'].players?.find((p: any) => p.id === lineup[subPos])?.name || subPos;
                options.push({
                  value: `${playingPos}→${subPos}`,
                  label: `${subPlayer} (${subPos}) → ${playingPlayer} (${playingPos})`
                });
              }
            });
          } else {
            // Other games: Check substitution pairing restrictions

            // If this position has a pair, can only substitute with that pair
            if (substitutionPairs[playingPos]) {
              const pairedPos = substitutionPairs[playingPos];

              // Check if paired position has a player (could be anywhere in lineup)
              if (lineup[pairedPos] && lineup[pairedPos] !== 'none') {
                const playingPlayer = match[team === 'home' ? 'homeTeam' : 'awayTeam'].players?.find((p: any) => p.id === lineup[playingPos])?.name || playingPos;
                const pairedPlayer = match[team === 'home' ? 'homeTeam' : 'awayTeam'].players?.find((p: any) => p.id === lineup[pairedPos])?.name || pairedPos;

                // Check if they're not already in their swapped positions for this game
                const currentSub = getCurrentSubstitution(playingPos, gameId, team);
                if (!currentSub || currentSub !== `${playingPos}→${pairedPos}`) {
                  options.push({
                    value: `${playingPos}→${pairedPos}`,
                    label: `${pairedPlayer} (${pairedPos}) → ${playingPlayer} (${playingPos})`
                  });
                }
              }
            } else {
              // Not paired yet, can substitute with any unpaired position
              const allPositions = team === 'home' ? ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'] : ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

              allPositions.forEach(pos => {
                // Can substitute with position if:
                // - It's not the same position
                // - Player exists in that position
                // - That position is not paired with someone else
                // - That position is not currently playing in this same game (unless it's a substitute position)
                if (pos !== playingPos &&
                    lineup[pos] &&
                    lineup[pos] !== 'none' &&
                    !substitutionPairs[pos]) {

                  // Check if this position is playing in the current game
                  const isPlayingInThisGame = playingPositions.includes(pos);

                  // Allow substitution if it's a substitute position OR not playing in this game
                  if (substitutePositions.includes(pos) || !isPlayingInThisGame) {
                    const playingPlayer = match[team === 'home' ? 'homeTeam' : 'awayTeam'].players?.find((p: any) => p.id === lineup[playingPos])?.name || playingPos;
                    const otherPlayer = match[team === 'home' ? 'homeTeam' : 'awayTeam'].players?.find((p: any) => p.id === lineup[pos])?.name || pos;
                    options.push({
                      value: `${playingPos}→${pos}`,
                      label: `${otherPlayer} (${pos}) → ${playingPlayer} (${playingPos})`
                    });
                  }
                }
              });
            }
          }
        }
      }
    });

    return options;
  };

  const handleSubstitution = (gameId: number, team: 'home' | 'away', substitution: string) => {
    if (substitution === '' || substitution === 'none') {
      // Remove substitution
      setSubstitutions(prev => {
        const newSubs = { ...prev };
        if (newSubs[gameId]) {
          delete newSubs[gameId][team];
          if (!newSubs[gameId].home && !newSubs[gameId].away) {
            delete newSubs[gameId];
          }
        }
        return newSubs;
      });
    } else {
      // Check if this is a revert (D1→D1)
      const [originalPos, substitutePos] = substitution.split('→');
      if (originalPos === substitutePos) {
        // This is a revert - remove any substitution for this position
        setSubstitutions(prev => {
          const newSubs = { ...prev };
          if (newSubs[gameId]) {
            delete newSubs[gameId][team];
            if (!newSubs[gameId].home && !newSubs[gameId].away) {
              delete newSubs[gameId];
            }
          }
          return newSubs;
        });
      } else {
        // Regular substitution
        setSubstitutions(prev => ({
          ...prev,
          [gameId]: {
            ...prev[gameId],
            [team]: substitution
          }
        }));

        // Track substitution pairs (but not for game 9 - triple 301)
        if (gameId !== 9) {
          // Handle multiple substitutions (comma-separated)
          const allSubstitutions = substitution.includes(', ')
            ? substitution.split(', ')
            : [substitution];

          setSubstitutionPairs(prev => {
            const newPairs = { ...prev };

            allSubstitutions.forEach(sub => {
              const [origPos, subPos] = sub.split('→');
              // Only create pairing if not reverting to same position
              if (origPos !== subPos) {
                // Create bidirectional pairing
                newPairs[origPos] = subPos;
                newPairs[subPos] = origPos;
              }
            });

            return newPairs;
          });
        }
      }
    }
  };

  // Helper functions for quick substitution dialog
  const openQuickSubstitution = (gameId: number, team: 'home' | 'away') => {
    const teamName = team === 'home' ? match.homeTeam.name : match.awayTeam.name;
    setSubstitutionData({ gameId, team, teamName });
    setShowSubstitutionDialog(true);
  };

  const handleQuickSubstitutionComplete = (substitutionsList: Array<{ outPlayerId: string; inPlayerId: string }>) => {
    if (!substitutionData || substitutionsList.length === 0) return;

    const { gameId, team } = substitutionData;
    const lineup = team === 'home' ? homeLineup : awayLineup;

    // Build combined substitution string for multiple substitutions
    const substitutionStrings = substitutionsList.map(({ outPlayerId, inPlayerId }) => {
      // Find position of outgoing player
      const outPosition = Object.keys(lineup).find(pos => lineup[pos] === outPlayerId);
      // Find position of incoming player
      const inPosition = Object.keys(lineup).find(pos => lineup[pos] === inPlayerId);

      if (outPosition && inPosition) {
        return `${outPosition}→${inPosition}`;
      }
      return null;
    }).filter(Boolean);

    // Combine multiple substitutions with comma separator
    if (substitutionStrings.length > 0) {
      const combinedSubstitution = substitutionStrings.join(', ');
      handleSubstitution(gameId, team, combinedSubstitution);
    }

    setShowSubstitutionDialog(false);
    setSubstitutionData(null);
  };

  const getQuickSubstitutionData = (team: 'home' | 'away', gameId: number) => {
    const lineup = team === 'home' ? homeLineup : awayLineup;
    const allPlayers = team === 'home' ? match.homeTeam.players : match.awayTeam.players;

    // Get game data to know which positions are playing
    const gameData = HSL_GAMES.find(g => g.id === gameId);
    if (!gameData) return { activePlayers: [], benchPlayers: [] };

    const playingPositions = (team === 'home' ? gameData.positions.home : gameData.positions.away)
      .includes('+')
        ? (team === 'home' ? gameData.positions.home : gameData.positions.away).split('+')
        : [team === 'home' ? gameData.positions.home : gameData.positions.away];

    // Active players (those playing in this game)
    const activePlayers = playingPositions
      .filter(pos => lineup[pos])
      .map(pos => {
        const playerId = getEffectivePlayer(pos, gameId, team);
        const player = allPlayers.find((p: any) => p.id === playerId);
        return player ? { id: playerId, name: player.name, position: pos } : null;
      })
      .filter(Boolean);

    // Bench players (substitute positions with players assigned)
    const substitutePositions = team === 'home' ? ['D4', 'D5', 'D6'] : ['H4', 'H5', 'H6'];
    const benchPlayers = substitutePositions
      .filter(pos => lineup[pos])
      .map(pos => {
        const player = allPlayers.find((p: any) => p.id === lineup[pos]);
        return player ? { id: player.id, name: player.name, position: pos } : null;
      })
      .filter(Boolean);

    return { activePlayers, benchPlayers };
  };


  // Součty legů — stejný výpočet jako v matchResult.totalLegs při ukládání.
  const homeLegs = Object.values(gameResults).reduce((sum, result) => sum + (result?.homeScore || 0), 0);
  const awayLegs = Object.values(gameResults).reduce((sum, result) => sum + (result?.awayScore || 0), 0);

  // Křestní jména hráčů na straně, včetně střídání v této hře.
  const sideNames = (game: typeof HSL_GAMES[number], team: 'home' | 'away') => {
    const positions = team === 'home' ? game.positions.home : game.positions.away;
    const players = team === 'home' ? match.homeTeam.players : match.awayTeam.players;
    return positions.split('+').map(pos => {
      const effectivePlayerId = getEffectivePlayer(pos, game.id, team);
      const playerName = players?.find((p: any) => p.id === effectivePlayerId)?.name || pos;
      return playerName.split(' ')[0];
    }).join(' + ');
  };

  // Postupné skóre po dané hře (jako "průběh" v papírovém zápisu).
  const getProgressiveScore = (currentGameId: number) => {
    let progressiveHomeWins = 0;
    let progressiveAwayWins = 0;
    for (let i = 1; i <= currentGameId; i++) {
      const gameResult = gameResults[i];
      if (gameResult) {
        if (gameResult.winner === 'home') progressiveHomeWins++;
        if (gameResult.winner === 'away') progressiveAwayWins++;
      }
    }
    return { home: progressiveHomeWins, away: progressiveAwayWins };
  };

  const visibleGames = HSL_GAMES.filter(game => !game.onlyIfTied || isTied || tiebreakStarted);

  const renderLineupColumn = (team: 'home' | 'away') => {
    const isHome = team === 'home';
    const teamData = isHome ? match.homeTeam : match.awayTeam;
    const lineup = isHome ? homeLineup : awayLineup;
    const setLineup = isHome ? setHomeLineup : setAwayLineup;
    const basePositions = isHome ? ['D1', 'D2', 'D3'] : ['H1', 'H2', 'H3'];
    const benchPositions = isHome ? ['D4', 'D5', 'D6'] : ['H4', 'H5', 'H6'];

    return (
      <div className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <TeamMark name={teamData.name} logoUrl={getTeamLogo(teamData.name)} />
          <span className="truncate text-sm font-semibold text-slate-900">{teamData.name}</span>
          <span className="label-muted">{isHome ? 'Domácí' : 'Hosté'}</span>
        </div>
        <div className="label-muted mb-1">Základní sestava</div>
        <div className="space-y-1.5">
          {basePositions.map(pos => (
            <div key={pos} className="flex items-center gap-2">
              <span className="w-7 shrink-0 text-xs font-semibold text-slate-700 tnum">{pos}</span>
              <Select value={lineup[pos]} onValueChange={(value) => setLineup(prev => ({ ...prev, [pos]: value }))}>
                <SelectTrigger className="h-10 flex-1">
                  <SelectValue placeholder="Vyberte hráče" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePlayersForPosition(teamData.players, pos, team)?.map((player: any) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="label-muted mb-1 mt-3">Náhradníci</div>
        <div className="space-y-1.5">
          {benchPositions.map(pos => (
            <div key={pos} className="flex items-center gap-2">
              <span className="w-7 shrink-0 text-xs font-semibold text-muted-foreground tnum">{pos}</span>
              <Select value={lineup[pos]} onValueChange={(value) => setLineup(prev => ({ ...prev, [pos]: value }))}>
                <SelectTrigger className="h-10 flex-1">
                  <SelectValue placeholder="Volitelné" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Žádný</SelectItem>
                  {getAvailablePlayersForPosition(teamData.players, pos, team)?.map((player: any) => (
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
    );
  };

  const renderSubstitution = (game: typeof HSL_GAMES[number], team: 'home' | 'away') => {
    const side = team === 'home' ? 'D' : 'H';
    const current = substitutions[game.id]?.[team];
    if (current) {
      return (
        <div className="flex h-8 items-center gap-1 rounded-md border border-border pl-2 text-xs">
          <span className="font-semibold text-muted-foreground">{side}</span>
          {current.split(', ').map((sub, idx) => (
            <span key={idx} className="tnum text-slate-900">{sub}</span>
          ))}
          <button
            type="button"
            onClick={() => handleSubstitution(game.id, team, '')}
            className="grid h-8 w-8 place-items-center text-slate-400 hover:text-slate-900"
            aria-label="Zrušit střídání"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => openQuickSubstitution(game.id, team)}
        className="h-8 px-2 text-xs font-medium text-slate-600"
        disabled={!lineupsValid}
      >
        <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
        Střídání {side}
      </Button>
    );
  };

  const renderScoreSelect = (game: typeof HSL_GAMES[number], team: 'home' | 'away') => {
    const result = gameResults[game.id];
    const isHome = team === 'home';
    const isWinner = !!result && result.winner === team;
    return (
      <Select
        value={(isHome ? result?.homeScore : result?.awayScore)?.toString() || ''}
        onValueChange={(value) => {
          if (isHome) {
            const homeScore = parseInt(value);
            const awayScore = result?.awayScore || 0;
            updateGameResult(game.id, homeScore, awayScore);
          } else {
            const awayScore = parseInt(value);
            const homeScore = result?.homeScore || 0;
            updateGameResult(game.id, homeScore, awayScore);
          }
        }}
      >
        <SelectTrigger
          aria-label={isHome ? 'Legy domácí' : 'Legy hosté'}
          className={`h-10 w-14 px-2.5 tnum ${isWinner ? 'font-bold text-slate-900' : 'text-slate-500'}`}
        >
          <SelectValue placeholder="–" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">0</SelectItem>
          <SelectItem value="1">1</SelectItem>
          {(game.type === 'double_cricket' || game.type === 'tiebreak_701') ? null : (
            <SelectItem value="2">2</SelectItem>
          )}
        </SelectContent>
      </Select>
    );
  };

  // Silnější předěl jen tam, kde se mění disciplína — usnadní orientaci v 16 řádcích.
  const renderGameRow = (game: typeof HSL_GAMES[number], idx: number, disciplineChange: boolean) => {
    const result = gameResults[game.id];
    const isCompleted = !!result;
    const progressiveScore = getProgressiveScore(game.id);

    return (
      <div
        key={game.id}
        className={`flex flex-col gap-2 px-3 py-2 md:flex-row md:items-center md:gap-3 ${
          idx === 0 ? '' : disciplineChange ? 'border-t border-slate-300' : 'border-t border-border'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span className={`w-5 shrink-0 pt-px text-right text-xs font-semibold tnum ${isCompleted ? 'text-slate-900' : 'text-muted-foreground'}`}>
            {game.id}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="text-sm">
              <span className={result?.winner === 'home' ? 'font-semibold text-slate-900' : 'text-slate-700'}>
                {sideNames(game, 'home')}
              </span>
              <span className="px-1.5 text-muted-foreground">–</span>
              <span className={result?.winner === 'away' ? 'font-semibold text-slate-900' : 'text-slate-700'}>
                {sideNames(game, 'away')}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              <span className="font-medium text-slate-600">{DISCIPLINE_LABELS[game.type]}</span>
              {' · '}{game.name}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pl-7 md:pl-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {renderSubstitution(game, 'home')}
            {renderSubstitution(game, 'away')}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {renderScoreSelect(game, 'home')}
            <span className="text-muted-foreground">:</span>
            {renderScoreSelect(game, 'away')}
            <span
              title="Průběžné skóre"
              className={`w-10 text-right text-xs tnum ${isCompleted ? 'text-slate-700' : 'text-slate-300'}`}
            >
              {progressiveScore.home}:{progressiveScore.away}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderStatsPanel = (team: 'home' | 'away') => {
    const isHome = team === 'home';
    const teamData = isHome ? match.homeTeam : match.awayTeam;
    const lineup = isHome ? homeLineup : awayLineup;
    const positions = isHome ? ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'] : ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    return (
      <Panel
        title={
          <span className="flex items-center gap-2">
            <TeamMark name={teamData.name} logoUrl={getTeamLogo(teamData.name)} />
            {teamData.name}
          </span>
        }
      >
        <div className="divide-y divide-border">
          {positions.filter(pos => lineup[pos] && lineup[pos] !== 'none').map(pos => {
            const playerId = lineup[pos];
            const playerName = teamData.players?.find((p: any) => p.id === playerId)?.name || pos;

            return (
              <div key={pos} className="px-3 py-2">
                <div className="mb-1.5 flex items-baseline gap-2 text-sm">
                  <span className="font-semibold text-slate-900">{playerName}</span>
                  <span className="text-xs text-muted-foreground tnum">{pos}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-9">
                  {['95+', '133+', '170+', 'Asfalt'].map(stat => (
                    <label key={stat} className="block text-center">
                      <span className="mb-0.5 block text-[10px] font-semibold uppercase text-muted-foreground">{stat}</span>
                      <Input
                        className="h-9 px-1 text-center text-sm tnum"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={playerStats[playerId]?.[stat === 'Asfalt' ? 'Asfalt' : stat.replace('+', '')] || ''}
                        onChange={(e) => updatePlayerStat(playerId, stat === 'Asfalt' ? 'Asfalt' : stat.replace('+', ''), parseInt(e.target.value) || 0)}
                      />
                    </label>
                  ))}
                  {['CO3', 'CO4', 'CO5', 'CO6', 'Nejvyšší zavření'].map(stat => (
                    <label key={stat} className="block text-center">
                      <span className="mb-0.5 block text-[10px] font-semibold uppercase text-muted-foreground">{stat === 'Nejvyšší zavření' ? 'Max CO' : stat}</span>
                      <Input
                        className="h-9 px-1 text-center text-sm tnum"
                        type="number"
                        min="0"
                        max={stat === 'Nejvyšší zavření' ? '170' : undefined}
                        placeholder="0"
                        value={playerStats[playerId]?.[stat === 'Nejvyšší zavření' ? 'highestCheckout' : stat] || ''}
                        onChange={(e) => updatePlayerStat(playerId, stat === 'Nejvyšší zavření' ? 'highestCheckout' : stat, parseInt(e.target.value) || 0)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    );
  };

  const saveIcon = saving
    ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
    : <Save className="mr-1.5 h-4 w-4" />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Zápis utkání"
        subtitle={
          <>
            {match.round}. kolo ·{' '}
            {match.startTime ? new Date(match.startTime).toLocaleDateString('cs-CZ', {
              weekday: 'long', day: 'numeric', month: 'long'
            }) : 'Datum bude upřesněn'}
          </>
        }
      />

      {/* Souhrn drží u lišty, aby bylo skóre vidět i při zadávání dole v seznamu her. */}
      <div className="sticky top-[57px] z-30 rounded-lg border border-border bg-white">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <TeamMark name={match.homeTeam.name} logoUrl={getTeamLogo(match.homeTeam.name)} />
            <span className="truncate text-sm font-semibold text-slate-900">{match.homeTeam.name}</span>
          </div>
          <div className="text-center leading-tight">
            <div className="text-xl font-bold text-slate-900 tnum">{homeWins}:{awayWins}</div>
            <div className="text-[11px] text-muted-foreground tnum">legy {homeLegs}:{awayLegs}</div>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <span className="truncate text-right text-sm font-semibold text-slate-900">{match.awayTeam.name}</span>
            <TeamMark name={match.awayTeam.name} logoUrl={getTeamLogo(match.awayTeam.name)} />
          </div>
        </div>

        {/* Kroky zápisu — výsledky a statistiky se odemknou po uložení sestav. */}
        <div className="grid grid-cols-3 gap-0.5 border-t border-border bg-muted p-0.5">
          {[
            { id: 'lineups', label: 'Sestavy', done: lineupsSaved, enabled: true },
            { id: 'results', label: `Výsledky ${completedGames}/${totalGames}`, done: false, enabled: lineupsSaved },
            { id: 'stats', label: 'Statistiky', done: false, enabled: lineupsSaved }
          ].map(({ id, label, done, enabled }) => (
            <button
              key={id}
              type="button"
              onClick={() => enabled && setActiveTab(id)}
              disabled={!enabled}
              aria-pressed={activeTab === id}
              className={`flex h-9 items-center justify-center gap-1 rounded text-xs font-semibold tnum transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                activeTab === id
                  ? 'bg-white text-slate-900 ring-1 ring-border'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {done && <Check className="h-3.5 w-3.5 text-emerald-700" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Sestavy */}
        <TabsContent value="lineups" className="mt-0 space-y-3">
          <Panel title="Sestavy">
            <div className="grid divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              {renderLineupColumn('home')}
              {renderLineupColumn('away')}
            </div>
          </Panel>

          {!basicLineupsFilled && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Nejprve vyplňte základní sestavu (D1–D3, H1–H3).
            </p>
          )}

          {lineupsValid && !lineupsSaved && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Sestavy jsou kompletní, můžete je uložit.
            </p>
          )}

          {!lineupsSaved ? (
            <div className="flex justify-end">
              <Button
                onClick={saveLineups}
                disabled={!lineupsValid}
                className="h-9 rounded-md bg-primary font-semibold text-white hover:bg-[#9F1239]"
              >
                <Save className="mr-1.5 h-4 w-4" />
                Uložit sestavy
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs text-emerald-800">
                <Check className="h-3.5 w-3.5" />
                Sestavy uloženy, můžete zadávat výsledky.
              </p>
              <Button
                onClick={editLineups}
                variant="outline"
                className="h-9 rounded-md font-semibold"
              >
                <Edit className="mr-1.5 h-4 w-4" />
                Upravit sestavy
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Výsledky her */}
        <TabsContent value="results" className="mt-0 space-y-3">
          <Panel title="Hry" meta={`${completedGames}/${totalGames} zadáno`}>
            {visibleGames.map((game, idx) => renderGameRow(game, idx, visibleGames[idx - 1]?.type !== game.type))}
          </Panel>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
            <div className="mr-auto flex items-baseline gap-3 text-sm">
              <span className="label-muted">Celkem</span>
              <span className="font-bold text-slate-900 tnum">{homeWins}:{awayWins}</span>
              <span className="text-xs text-muted-foreground tnum">legy {homeLegs}:{awayLegs}</span>
            </div>
            <Button
              onClick={editLineups}
              variant="outline"
              className="h-9 rounded-md font-semibold"
            >
              <Edit className="mr-1.5 h-4 w-4" />
              Upravit sestavy
            </Button>
            <Button
              variant="outline"
              className="h-9 rounded-md font-semibold"
              disabled={completedGames < 16}
            >
              <FileText className="mr-1.5 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              onClick={saveMatch}
              disabled={saving || completedGames === 0}
              className="h-9 rounded-md bg-primary font-semibold text-white hover:bg-[#9F1239]"
            >
              {saveIcon}
              {saving ? 'Ukládám...' : 'Uložit průběh'}
            </Button>
          </div>
        </TabsContent>

        {/* Události hráčů (95+, 133+, 170, zavření) */}
        <TabsContent value="stats" className="mt-0 space-y-3">
          <div className="grid gap-3 lg:grid-cols-2">
            {renderStatsPanel('home')}
            {renderStatsPanel('away')}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              onClick={editLineups}
              variant="outline"
              className="h-9 rounded-md font-semibold"
            >
              <Edit className="mr-1.5 h-4 w-4" />
              Upravit sestavy
            </Button>
            <Button
              onClick={saveMatch}
              disabled={saving || completedGames === 0}
              className="h-9 rounded-md bg-primary font-semibold text-white hover:bg-[#9F1239]"
            >
              {saveIcon}
              {saving ? 'Ukládám...' : 'Uložit vše'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog střídání */}
      {substitutionData && (
        <ImprovedSubstitution
          open={showSubstitutionDialog}
          onClose={() => {
            setShowSubstitutionDialog(false);
            setSubstitutionData(null);
          }}
          team={substitutionData.team}
          teamName={substitutionData.teamName}
          activePlayers={getQuickSubstitutionData(substitutionData.team, substitutionData.gameId).activePlayers}
          benchPlayers={getQuickSubstitutionData(substitutionData.team, substitutionData.gameId).benchPlayers}
          onSubstitute={handleQuickSubstitutionComplete}
          substitutionPairs={substitutionPairs}
          gameId={substitutionData.gameId}
        />
      )}
    </div>
  );
}
