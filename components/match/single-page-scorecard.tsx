"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Users, Target, Trophy, Calendar, FileText, Plus, Minus, BarChart3, Edit, RefreshCw, ArrowUpDown } from 'lucide-react';
import { TeamLogo } from '@/components/team-logo';
import { ImprovedSubstitution } from './improved-substitution';

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

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card className="rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                ZÁPIS UTKÁNÍ - {match.round}. KOLO
              </h1>
              <p className="text-slate-600">
                {match.startTime ? new Date(match.startTime).toLocaleDateString('cs-CZ', {
                  weekday: 'long', day: 'numeric', month: 'long'
                }) : 'Datum bude upřesněn'}
              </p>
            </div>
            <Badge className="bg-primary text-white px-4 py-2 font-bold text-lg">
              {homeWins} : {awayWins}
            </Badge>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="size-16 rounded-xl bg-white shadow-sm border p-2 mx-auto mb-3">
                <TeamLogo teamName={match.homeTeam.name} className="w-full h-full object-contain" />
              </div>
              <h2 className="font-black text-xl text-slate-900">{match.homeTeam.name}</h2>
              <p className="text-sm text-slate-600 font-semibold">DOMÁCÍ</p>
            </div>
            <div className="text-center">
              <div className="size-16 rounded-xl bg-white shadow-sm border p-2 mx-auto mb-3">
                <TeamLogo teamName={match.awayTeam.name} className="w-full h-full object-contain" />
              </div>
              <h2 className="font-black text-xl text-slate-900">{match.awayTeam.name}</h2>
              <p className="text-sm text-slate-600 font-semibold">HOSTÉ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { id: 'lineups', icon: Users, label: lineupsSaved ? 'SESTAVY ✓' : 'SESTAVY', enabled: true },
          { id: 'results', icon: Target, label: `VÝSLEDKY (${completedGames}/${totalGames})`, enabled: lineupsSaved },
          { id: 'stats', icon: BarChart3, label: 'STATISTIKY', enabled: lineupsSaved }
        ].map(({ id, icon: Icon, label, enabled }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "outline"}
            className={`rounded-xl font-bold py-6 ${
              !enabled 
                ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400' 
                : activeTab === id 
                  ? 'bg-primary text-white hover:bg-[#9F1239]'
                  : 'border-primary text-primary hover:bg-primary hover:text-white'
            }`}
            onClick={() => enabled && setActiveTab(id)}
            disabled={!enabled}
          >
            <Icon className="h-5 w-5 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Lineups Tab */}
        <TabsContent value="lineups">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Home Team */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-white shadow-sm border p-1">
                    <TeamLogo teamName={match.homeTeam.name} className="w-full h-full object-contain" />
                  </div>
                  {match.homeTeam.name}
                  <Badge className="bg-primary/10 text-primary font-bold">DOMÁCÍ</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Základní sestava *</h4>
                  {['D1', 'D2', 'D3'].map(pos => (
                    <div key={pos} className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary/10 text-primary font-bold w-8 pointer-events-none">{pos}</Badge>
                      <Select value={homeLineup[pos]} onValueChange={(value) => setHomeLineup(prev => ({ ...prev, [pos]: value }))}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Vyberte hráče" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailablePlayersForPosition(match.homeTeam.players, pos, 'home')?.map((player: any) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Náhradníci</h4>
                  {['D4', 'D5', 'D6'].map(pos => (
                    <div key={pos} className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-100 text-slate-600 font-bold w-8 pointer-events-none">{pos}</Badge>
                      <Select value={homeLineup[pos]} onValueChange={(value) => setHomeLineup(prev => ({ ...prev, [pos]: value }))}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Volitelné" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Žádný</SelectItem>
                          {getAvailablePlayersForPosition(match.homeTeam.players, pos, 'home')?.map((player: any) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Away Team */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-white shadow-sm border p-1">
                    <TeamLogo teamName={match.awayTeam.name} className="w-full h-full object-contain" />
                  </div>
                  {match.awayTeam.name}
                  <Badge className="bg-accent/10 text-accent font-bold">HOSTÉ</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Základní sestava *</h4>
                  {['H1', 'H2', 'H3'].map(pos => (
                    <div key={pos} className="flex items-center gap-2 mb-2">
                      <Badge className="bg-accent/10 text-accent font-bold w-8 pointer-events-none">{pos}</Badge>
                      <Select value={awayLineup[pos]} onValueChange={(value) => setAwayLineup(prev => ({ ...prev, [pos]: value }))}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Vyberte hráče" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailablePlayersForPosition(match.awayTeam.players, pos, 'away')?.map((player: any) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Náhradníci</h4>
                  {['H4', 'H5', 'H6'].map(pos => (
                    <div key={pos} className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-100 text-slate-600 font-bold w-8 pointer-events-none">{pos}</Badge>
                      <Select value={awayLineup[pos]} onValueChange={(value) => setAwayLineup(prev => ({ ...prev, [pos]: value }))}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Volitelné" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Žádný</SelectItem>
                          {getAvailablePlayersForPosition(match.awayTeam.players, pos, 'away')?.map((player: any) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Messages */}
          <div className="space-y-3 mt-6">
            {!basicLineupsFilled && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Nejprve nastavte základní sestavu (D1-D3, H1-H3)
                </p>
              </div>
            )}
            
            {lineupsValid && !lineupsSaved && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800 font-medium">
                  ✅ Sestavy jsou v pořádku - můžete je uložit
                </p>
              </div>
            )}
          </div>

          {/* Save/Edit Lineups Button */}
          <div className="mt-6 text-center">
            {!lineupsSaved ? (
              <Button 
                onClick={saveLineups}
                disabled={!lineupsValid}
                className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold px-8"
              >
                <Save className="h-4 w-4 mr-2" />
                Uložit sestavy
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800 font-medium">
                    ✅ Sestavy byly uloženy - můžete zadávat výsledky
                  </p>
                </div>
                <Button 
                  onClick={editLineups}
                  variant="outline"
                  className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-bold"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Upravit sestavy
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Průběh utkání ({completedGames}/{totalGames})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Typ zápasu</TableHead>
                    <TableHead className="w-40">Formát</TableHead>
                    <TableHead className="w-48">Střídání</TableHead>
                    <TableHead className="w-32">Domácí</TableHead>
                    <TableHead className="w-32">Hosté</TableHead>
                    <TableHead className="w-24">Výsledek</TableHead>
                    <TableHead className="w-32">Stav</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {HSL_GAMES.filter(game => !game.onlyIfTied || isTied || tiebreakStarted).map((game) => {
                    const result = gameResults[game.id];
                    const isCompleted = !!result;
                    
                    // Calculate progressive score for this game
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

                    // Subtle game type styling (like standings) - no hover
                    const getGameTypeBadge = (type: string) => {
                      switch (type) {
                        case 'single': return 'bg-slate-100 text-slate-700 border-slate-200';
                        case 'double_cricket': return 'bg-purple-50 text-purple-700 border-purple-200';
                        case 'double_501': return 'bg-green-50 text-green-700 border-green-200';
                        case 'triple_301': return 'bg-orange-50 text-orange-700 border-orange-200';
                        case 'tiebreak_701': return 'bg-red-50 text-red-700 border-red-200';
                        default: return 'bg-slate-100 text-slate-700 border-slate-200';
                      }
                    };
                    
                    const progressiveScore = getProgressiveScore(game.id);
                    
                    return (
                      <TableRow 
                        key={game.id} 
                        className={`border-b border-slate-100 ${
                          isCompleted 
                            ? 'bg-green-50/50 hover:bg-green-50' 
                            : 'hover:bg-slate-50'
                        } transition-all duration-200`}
                      >
                        <TableCell>
                          <div className={`size-8 rounded-lg grid place-items-center font-bold text-sm ${
                            isCompleted 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {game.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-900">{game.name}</div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-1">
                                <div className="size-2 rounded-full bg-primary"></div>
                                <span className="text-primary font-medium">
                                  {game.positions.home.includes('+') 
                                    ? game.positions.home.split('+').map(pos => {
                                        const effectivePlayerId = getEffectivePlayer(pos, game.id, 'home');
                                        const playerName = match.homeTeam.players?.find((p: any) => p.id === effectivePlayerId)?.name || pos;
                                        return playerName.split(' ')[0]; // First name only
                                      }).join('+')
                                    : (() => {
                                        const effectivePlayerId = getEffectivePlayer(game.positions.home, game.id, 'home');
                                        const playerName = match.homeTeam.players?.find((p: any) => p.id === effectivePlayerId)?.name || game.positions.home;
                                        return playerName.split(' ')[0]; // First name only
                                      })()
                                  }
                                </span>
                              </div>
                              <span className="text-slate-400 font-medium">vs</span>
                              <div className="flex items-center gap-1">
                                <div className="size-2 rounded-full bg-accent"></div>
                                <span className="text-accent font-medium">
                                  {game.positions.away.includes('+') 
                                    ? game.positions.away.split('+').map(pos => {
                                        const effectivePlayerId = getEffectivePlayer(pos, game.id, 'away');
                                        const playerName = match.awayTeam.players?.find((p: any) => p.id === effectivePlayerId)?.name || pos;
                                        return playerName.split(' ')[0]; // First name only
                                      }).join('+')
                                    : (() => {
                                        const effectivePlayerId = getEffectivePlayer(game.positions.away, game.id, 'away');
                                        const playerName = match.awayTeam.players?.find((p: any) => p.id === effectivePlayerId)?.name || game.positions.away;
                                        return playerName.split(' ')[0]; // First name only
                                      })()
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`text-sm font-semibold whitespace-nowrap border px-3 py-1 pointer-events-none ${getGameTypeBadge(game.type)}`}
                          >
                            {game.format}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {/* Home substitution */}
                            <div className="flex items-center gap-1">
                              <div className="size-3 rounded-full bg-primary"></div>
                              {substitutions[game.id]?.home ? (
                                <div className="flex flex-col gap-1 text-xs">
                                  {substitutions[game.id].home!.split(', ').map((sub, idx) => (
                                    <div key={idx} className="flex items-center gap-1">
                                      <Badge variant="outline" className="h-6 text-xs">
                                        {sub}
                                      </Badge>
                                    </div>
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSubstitution(game.id, 'home', '')}
                                    className="h-6 w-6 p-0 self-start"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openQuickSubstitution(game.id, 'home')}
                                  className="h-6 px-2 text-xs"
                                  disabled={!lineupsValid}
                                >
                                  <ArrowUpDown className="h-3 w-3 mr-1" />
                                  Střídání
                                </Button>
                              )}
                            </div>

                            {/* Away substitution */}
                            <div className="flex items-center gap-1">
                              <div className="size-3 rounded-full bg-accent"></div>
                              {substitutions[game.id]?.away ? (
                                <div className="flex flex-col gap-1 text-xs">
                                  {substitutions[game.id].away!.split(', ').map((sub, idx) => (
                                    <div key={idx} className="flex items-center gap-1">
                                      <Badge variant="outline" className="h-6 text-xs">
                                        {sub}
                                      </Badge>
                                    </div>
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSubstitution(game.id, 'away', '')}
                                    className="h-6 w-6 p-0 self-start"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openQuickSubstitution(game.id, 'away')}
                                  className="h-6 px-2 text-xs"
                                  disabled={!lineupsValid}
                                >
                                  <ArrowUpDown className="h-3 w-3 mr-1" />
                                  Střídání
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="size-4 rounded-full bg-primary/20 grid place-items-center">
                              <div className="size-2 rounded-full bg-primary"></div>
                            </div>
                            <Select 
                              value={result?.homeScore?.toString() || ''} 
                              onValueChange={(value) => {
                                const homeScore = parseInt(value);
                                const awayScore = result?.awayScore || 0;
                                updateGameResult(game.id, homeScore, awayScore);
                              }}
                            >
                              <SelectTrigger className="w-16 h-9 border border-slate-200 focus:border-primary">
                                <SelectValue placeholder="0" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0</SelectItem>
                                <SelectItem value="1">1</SelectItem>
                                {(game.type === 'double_cricket' || game.type === 'tiebreak_701') ? null : (
                                  <SelectItem value="2">2</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="size-4 rounded-full bg-accent/20 grid place-items-center">
                              <div className="size-2 rounded-full bg-accent"></div>
                            </div>
                            <Select 
                              value={result?.awayScore?.toString() || ''} 
                              onValueChange={(value) => {
                                const awayScore = parseInt(value);
                                const homeScore = result?.homeScore || 0;
                                updateGameResult(game.id, homeScore, awayScore);
                              }}
                            >
                              <SelectTrigger className="w-16 h-9 border border-slate-200 focus:border-accent">
                                <SelectValue placeholder="0" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0</SelectItem>
                                <SelectItem value="1">1</SelectItem>
                                {(game.type === 'double_cricket' || game.type === 'tiebreak_701') ? null : (
                                  <SelectItem value="2">2</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          {result ? (
                            <Badge className={`font-bold px-2 py-1 ${
                              result.winner === 'home' 
                                ? 'bg-primary text-white' 
                                : 'bg-accent text-white'
                            }`}>
                              {result.homeScore}:{result.awayScore}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 font-medium">-:-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                              <div className="font-bold text-slate-800">
                                {progressiveScore.home}:{progressiveScore.away}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Summary Row */}
                  <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-slate-300">
                    <TableCell>
                      <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-black text-sm">
                        Σ
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-black text-lg text-slate-900">CELKEM</div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-200 text-slate-700 font-bold">
                        KONEČNÝ
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* Empty substitution column for summary */}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                          <div className="font-bold text-primary">
                            {Object.values(gameResults).reduce((sum, result) => sum + (result?.homeScore || 0), 0)}
                          </div>
                          <div className="text-xs text-slate-600">legy</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                          <div className="font-bold text-accent">
                            {Object.values(gameResults).reduce((sum, result) => sum + (result?.awayScore || 0), 0)}
                          </div>
                          <div className="text-xs text-slate-600">legy</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Empty - final score only in last column */}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-primary to-accent rounded-lg px-6 py-3 min-w-24">
                          <div className="font-black text-white text-xl whitespace-nowrap">
                            {homeWins} : {awayWins}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={editLineups}
                  variant="outline"
                  className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Upravit sestavy
                </Button>
                <Button 
                  onClick={saveMatch}
                  disabled={saving || completedGames === 0}
                  className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Ukládám...' : 'Uložit průběh'}
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white font-bold"
                  disabled={completedGames < 16}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Home Team Stats */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-white shadow-sm border p-1">
                    <TeamLogo teamName={match.homeTeam.name} className="w-full h-full object-contain" />
                  </div>
                  Statistiky - {match.homeTeam.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].filter(pos => homeLineup[pos] && homeLineup[pos] !== 'none').map(pos => {
                    const playerId = homeLineup[pos];
                    const playerName = match.homeTeam.players?.find((p: any) => p.id === playerId)?.name || pos;
                    
                    return (
                      <div key={pos} className="bg-slate-50 rounded-xl p-4">
                        <h4 className="font-bold text-slate-900 mb-3">{playerName} ({pos})</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {['95+', '133+', '170+', 'Asfalt'].map(stat => (
                            <div key={stat} className="text-center">
                              <div className="text-xs font-semibold text-slate-600 mb-1">{stat}</div>
                              <Input
                                className="h-8 text-center text-sm"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={playerStats[playerId]?.[stat === 'Asfalt' ? 'Asfalt' : stat.replace('+', '')] || ''}
                                onChange={(e) => updatePlayerStat(playerId, stat === 'Asfalt' ? 'Asfalt' : stat.replace('+', ''), parseInt(e.target.value) || 0)}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          {['CO3', 'CO4', 'CO5', 'CO6', 'Nejvyšší zavření'].map(stat => (
                            <div key={stat} className="text-center">
                              <div className="text-xs font-semibold text-slate-600 mb-1">{stat === 'Nejvyšší zavření' ? 'Max CO' : stat}</div>
                              <Input
                                className="h-8 text-center text-sm"
                                type="number"
                                min="0"
                                max={stat === 'Nejvyšší zavření' ? '170' : undefined}
                                placeholder="0"
                                value={playerStats[playerId]?.[stat === 'Nejvyšší zavření' ? 'highestCheckout' : stat] || ''}
                                onChange={(e) => updatePlayerStat(playerId, stat === 'Nejvyšší zavření' ? 'highestCheckout' : stat, parseInt(e.target.value) || 0)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Away Team Stats */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-white shadow-sm border p-1">
                    <TeamLogo teamName={match.awayTeam.name} className="w-full h-full object-contain" />
                  </div>
                  Statistiky - {match.awayTeam.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].filter(pos => awayLineup[pos] && awayLineup[pos] !== 'none').map(pos => {
                    const playerId = awayLineup[pos];
                    const playerName = match.awayTeam.players?.find((p: any) => p.id === playerId)?.name || pos;
                    
                    return (
                      <div key={pos} className="bg-slate-50 rounded-xl p-4">
                        <h4 className="font-bold text-slate-900 mb-3">{playerName} ({pos})</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {['95+', '133+', '170+', 'Asfalt'].map(stat => (
                            <div key={stat} className="text-center">
                              <div className="text-xs font-semibold text-slate-600 mb-1">{stat}</div>
                              <Input
                                className="h-8 text-center text-sm"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={playerStats[playerId]?.[stat === 'Asfalt' ? 'Asfalt' : stat.replace('+', '')] || ''}
                                onChange={(e) => updatePlayerStat(playerId, stat === 'Asfalt' ? 'Asfalt' : stat.replace('+', ''), parseInt(e.target.value) || 0)}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          {['CO3', 'CO4', 'CO5', 'CO6', 'Nejvyšší zavření'].map(stat => (
                            <div key={stat} className="text-center">
                              <div className="text-xs font-semibold text-slate-600 mb-1">{stat === 'Nejvyšší zavření' ? 'Max CO' : stat}</div>
                              <Input
                                className="h-8 text-center text-sm"
                                type="number"
                                min="0"
                                max={stat === 'Nejvyšší zavření' ? '170' : undefined}
                                placeholder="0"
                                value={playerStats[playerId]?.[stat === 'Nejvyšší zavření' ? 'highestCheckout' : stat] || ''}
                                onChange={(e) => updatePlayerStat(playerId, stat === 'Nejvyšší zavření' ? 'highestCheckout' : stat, parseInt(e.target.value) || 0)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <Button 
              onClick={editLineups}
              variant="outline"
              className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-100 font-bold"
            >
              <Edit className="h-4 w-4 mr-2" />
              Upravit sestavy
            </Button>
            <Button 
              onClick={saveMatch}
              disabled={saving || completedGames === 0}
              className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Ukládám...' : 'Uložit vše'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Improved Substitution Dialog */}
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