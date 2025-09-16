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
  events: Record<string, any>;
  onEventsChange: (events: Record<string, any>) => void;
}

const SCORE_EVENTS = [
  { key: 'S95', label: '95+', description: 'Skóre 95 a více' },
  { key: 'S133', label: '133+', description: 'Skóre 133 a více' },
  { key: 'S170', label: '170+', description: 'Skóre 170 a více' },
];

const CHECKOUT_EVENTS = [
  { key: 'CO3', label: 'CO3', description: 'Checkout na 3 šipky' },
  { key: 'CO4', label: 'CO4', description: 'Checkout na 4 šipky' },
  { key: 'CO5', label: 'CO5', description: 'Checkout na 5 šipky' },
  { key: 'CO6', label: 'CO6', description: 'Checkout na 6 šipky' },
];

export function PlayerStatsInput({ homeTeam, awayTeam, events, onEventsChange }: PlayerStatsInputProps) {
  const showStatsInterface = homeTeam && awayTeam;

  const updatePlayerEvent = (playerId: string, eventType: string, value: number) => {
    const updatedEvents = { ...events };
    if (!updatedEvents[playerId]) {
      updatedEvents[playerId] = {};
    }
    updatedEvents[playerId][eventType] = Math.max(0, value);
    onEventsChange(updatedEvents);
  };

  const incrementEvent = (playerId: string, eventType: string) => {
    const currentValue = events[playerId]?.[eventType] || 0;
    updatePlayerEvent(playerId, eventType, currentValue + 1);
  };

  const decrementEvent = (playerId: string, eventType: string) => {
    const currentValue = events[playerId]?.[eventType] || 0;
    updatePlayerEvent(playerId, eventType, currentValue - 1);
  };

  if (!showStatsInterface) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nejprve nastavte sestavy týmů</p>
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
            {team.players.length} hráčů • {teamName}
          </p>
        </div>
      </div>

      {team.players.map((player: any) => (
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
            {/* Score Events Row */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Skóre</Label>
              <div className="grid grid-cols-3 gap-4">
                {SCORE_EVENTS.map((eventType) => {
                  const currentValue = events[player.id]?.[eventType.key] || 0;
                  
                  return (
                    <div key={eventType.key} className="space-y-2">
                      <Label className="text-xs font-medium">{eventType.label}</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => decrementEvent(player.id, eventType.key)}
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
                          onClick={() => incrementEvent(player.id, eventType.key)}
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

            <Separator />

            {/* Checkout Events Row */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Checkouty</Label>
              <div className="grid grid-cols-4 gap-4">
                {CHECKOUT_EVENTS.map((eventType) => {
                  const currentValue = events[player.id]?.[eventType.key] || 0;
                  
                  return (
                    <div key={eventType.key} className="space-y-2">
                      <Label className="text-xs font-medium">{eventType.label}</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => decrementEvent(player.id, eventType.key)}
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
                          onClick={() => incrementEvent(player.id, eventType.key)}
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
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Teams Statistics */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          {renderTeamStats(homeTeam, "Domácí tým")}
        </div>
        
        <div>
          {renderTeamStats(awayTeam, "Hostující tým")}
        </div>
      </div>
    </div>
  );
}