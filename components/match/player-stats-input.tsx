"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Target } from 'lucide-react';
import { getTeamLogo } from '@/lib/team-logos';

interface PlayerStatsInputProps {
  homeTeam: any;
  awayTeam: any;
  homeLineup: string[];
  awayLineup: string[];
  gameResults: Record<number, any>;
  events: Record<string, any>;
  onEventsChange: (events: Record<string, any>) => void;
}

const SCORE_EVENTS = [
  { key: 'S95', label: '95+', description: 'Skóre 95 a více' },
  { key: 'S133', label: '133+', description: 'Skóre 133 a více' },
  { key: 'S170', label: '170+', description: 'Skóre 170 a více' },
  { key: 'Asfalt', label: 'Asfalt', description: 'Úplně mimo terč (0 bodů)' },
];

const CHECKOUT_EVENTS = [
  { key: 'CO3', label: 'CO3', description: 'Checkout na 3 šipky' },
  { key: 'CO4', label: 'CO4', description: 'Checkout na 4 šipky' },
  { key: 'CO5', label: 'CO5', description: 'Checkout na 5 šipky' },
  { key: 'CO6', label: 'CO6', description: 'Checkout na 6 šipky' },
  { key: 'highestCheckout', label: 'Nejvyšší zavření', description: 'Nejvyšší zavřená hodnota', isSpecial: true },
];

export function PlayerStatsInput({
  homeTeam,
  awayTeam,
  homeLineup,
  awayLineup,
  gameResults,
  events,
  onEventsChange
}: PlayerStatsInputProps) {
  const showStatsInterface = homeTeam && awayTeam && homeLineup.length >= 3 && awayLineup.length >= 3;

  // Get only players who played singles games
  const getSinglesPlayers = (lineup: string[], team: any) => {
    // In HŠL rules, D1-D3 and H1-H3 play singles
    const singlesPlayerIds = lineup.slice(0, 3);
    return team.players.filter((p: any) => singlesPlayerIds.includes(p.id));
  };

  const homeSinglesPlayers = getSinglesPlayers(homeLineup, homeTeam);
  const awaySinglesPlayers = getSinglesPlayers(awayLineup, awayTeam);

  const updatePlayerEvent = (gameId: number, playerId: string, eventType: string, value: number) => {
    const updatedEvents = { ...events };
    if (!updatedEvents[gameId]) {
      updatedEvents[gameId] = {};
    }
    if (!updatedEvents[gameId][playerId]) {
      updatedEvents[gameId][playerId] = {};
    }
    updatedEvents[gameId][playerId][eventType] = Math.max(0, value);
    onEventsChange(updatedEvents);
  };

  const incrementEvent = (gameId: number, playerId: string, eventType: string) => {
    const currentValue = events[gameId]?.[playerId]?.[eventType] || 0;
    updatePlayerEvent(gameId, playerId, eventType, currentValue + 1);
  };

  const decrementEvent = (gameId: number, playerId: string, eventType: string) => {
    const currentValue = events[gameId]?.[playerId]?.[eventType] || 0;
    updatePlayerEvent(gameId, playerId, eventType, currentValue - 1);
  };

  // Get singles games from gameResults
  const singlesGames = Object.entries(gameResults).filter(([gameId, result]) => {
    const gameNum = parseInt(gameId);
    // Singles are games 1-3, 6-8, 12-14 in HŠL structure
    return [1,2,3,6,7,8,12,13,14].includes(gameNum);
  });

  if (!showStatsInterface) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nejprve nastavte sestavy týmů a dokončete singles</p>
        </CardContent>
      </Card>
    );
  }

  const renderTeamStats = (team: any, teamName: string) => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-12 rounded-xl bg-white shadow-sm border border-slate-200 p-1">
          <img
            src={getTeamLogo(team.name)}
            alt={team.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">{team.name}</h3>
          <p className="text-sm text-muted-foreground">
            {teamName === "Domácí tým" ? homeSinglesPlayers.length : awaySinglesPlayers.length} hráčů v singlových hrách
          </p>
        </div>
      </div>

      {(teamName === "Domácí tým" ? homeSinglesPlayers : awaySinglesPlayers).map((player: any) => (
        <Card key={player.id} className="rounded-2xl bg-white border border-gray-100 card-shadow hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              {player.name}
              {player.nickname && (
                <span className="text-sm font-normal text-muted-foreground">
                  "{player.nickname}"
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xs text-muted-foreground mb-3">
              Statistiky se zadávají pouze pro singly (hry 1-3, 6-8, 12-14)
            </div>

            {/* Show stats for each singles game this player participated in */}
            {singlesGames.map(([gameId, result]) => {
              const gameNum = parseInt(gameId);
              const playerParticipated =
                (result.participants?.home?.includes(player.id)) ||
                (result.participants?.away?.includes(player.id));

              if (!playerParticipated) return null;

              return (
                <Card key={gameId} className="p-4 bg-slate-50 rounded-xl">
                  <div className="font-bold text-sm mb-3">
                    Hra {gameId} - {result.winner === 'home' ? homeTeam.name : awayTeam.name} vyhrál {result.homeLegs}:{result.awayLegs}
                  </div>

                  {/* Score Events Row */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Skóre</Label>
                    <div className="grid grid-cols-4 gap-4">
                      {SCORE_EVENTS.map((eventType) => {
                        const currentValue = events[gameNum]?.[player.id]?.[eventType.key] || 0;

                        return (
                          <div key={eventType.key} className="space-y-2">
                            <Label className="text-xs font-medium">{eventType.label}</Label>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => decrementEvent(gameNum, player.id, eventType.key)}
                                disabled={currentValue === 0}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>

                              <div className="flex-1 text-center">
                                <Badge variant="secondary" className="w-full h-8 flex items-center justify-center font-bold">
                                  {currentValue}
                                </Badge>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => incrementEvent(gameNum, player.id, eventType.key)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* Checkout Events Row */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Checkouty</Label>
                    <div className="grid grid-cols-5 gap-3">
                      {CHECKOUT_EVENTS.map((eventType) => {
                        const currentValue = events[gameNum]?.[player.id]?.[eventType.key] || 0;

                        // Special handling for highestCheckout (number input)
                        if (eventType.isSpecial) {
                          return (
                            <div key={eventType.key} className="space-y-2">
                              <Label className="text-xs font-medium">{eventType.label}</Label>
                              <Input
                                type="number"
                                min="0"
                                max="170"
                                value={currentValue}
                                onChange={(e) => updatePlayerEvent(gameNum, player.id, eventType.key, parseInt(e.target.value) || 0)}
                                className="h-8 text-center font-bold"
                                placeholder="0"
                              />
                            </div>
                          );
                        }

                        // Regular checkout events (buttons)
                        return (
                          <div key={eventType.key} className="space-y-2">
                            <Label className="text-xs font-medium">{eventType.label}</Label>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => decrementEvent(gameNum, player.id, eventType.key)}
                                disabled={currentValue === 0}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>

                              <div className="flex-1 text-center">
                                <Badge variant="secondary" className="w-full h-8 flex items-center justify-center font-bold">
                                  {currentValue}
                                </Badge>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => incrementEvent(gameNum, player.id, eventType.key)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Info Box */}
      {singlesGames.length === 0 ? (
        <Card className="rounded-2xl bg-yellow-50 border-yellow-200">
          <CardContent className="py-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-yellow-800 font-semibold">
              Nejprve dokončete alespoň jednu singlovou hru (1-3, 6-8, 12-14)
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Statistiky (95+, 133+, 170+, Asfalt, CO3-6) se zadávají pouze pro singlové hry.
              Dokončeno {singlesGames.length} z 9 možných singlů.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Teams Statistics */}
      {singlesGames.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            {renderTeamStats(homeTeam, "Domácí tým")}
          </div>

          <div>
            {renderTeamStats(awayTeam, "Hostující tým")}
          </div>
        </div>
      )}
    </div>
  );
}