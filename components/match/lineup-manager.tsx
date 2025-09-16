"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, ArrowRight } from 'lucide-react';
import { getTeamLogo } from '@/lib/team-logos';

interface LineupManagerProps {
  match: any;
  homeLineup: string[];
  awayLineup: string[];
  onHomeLineupChange: (lineup: string[]) => void;
  onAwayLineupChange: (lineup: string[]) => void;
  onComplete: () => void;
}

export function LineupManager({
  match,
  homeLineup,
  awayLineup,
  onHomeLineupChange,
  onAwayLineupChange,
  onComplete
}: LineupManagerProps) {
  // HŠL positions: D1-D6 for home team and H1-H6 for away team (max 6 players)
  const [homePositions, setHomePositions] = useState<Record<string, string>>({
    D1: homeLineup[0] || '',
    D2: homeLineup[1] || '',
    D3: homeLineup[2] || '',
    D4: homeLineup[3] || '',
    D5: homeLineup[4] || '',
    D6: homeLineup[5] || ''
  });
  
  const [awayPositions, setAwayPositions] = useState<Record<string, string>>({
    H1: awayLineup[0] || '',
    H2: awayLineup[1] || '',
    H3: awayLineup[2] || '',
    H4: awayLineup[3] || '',
    H5: awayLineup[4] || '',
    H6: awayLineup[5] || ''
  });
  
  useEffect(() => {
    // Convert positions back to array format for parent component (all 6 positions)
    const homeArray = [homePositions.D1, homePositions.D2, homePositions.D3, homePositions.D4, homePositions.D5, homePositions.D6].filter(Boolean);
    onHomeLineupChange(homeArray);
  }, [homePositions]);

  useEffect(() => {
    const awayArray = [awayPositions.H1, awayPositions.H2, awayPositions.H3, awayPositions.H4, awayPositions.H5, awayPositions.H6].filter(Boolean);
    onAwayLineupChange(awayArray);
  }, [awayPositions]);

  const handlePlayerSelect = (team: 'home' | 'away', position: string, playerId: string) => {
    const actualPlayerId = playerId === 'none' ? '' : playerId;
    if (team === 'home') {
      setHomePositions(prev => ({ ...prev, [position]: actualPlayerId }));
    } else {
      setAwayPositions(prev => ({ ...prev, [position]: actualPlayerId }));
    }
  };

  const isLineupComplete = homePositions.D1 && homePositions.D2 && homePositions.D3 && 
                          awayPositions.H1 && awayPositions.H2 && awayPositions.H3;

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Home Team Lineup */}
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 rounded-t-2xl">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-white shadow-sm border border-slate-200 p-1">
                <img 
                  src={getTeamLogo(match.homeTeam.name)}
                  alt={match.homeTeam.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                  {match.homeTeam.name}
                  <Badge className="bg-primary text-white font-bold">DOMÁCÍ</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  3 základní + až 3 náhradní hráče (D1-D6)
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Základní sestava D1-D3 */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">ZÁKLADNÍ</Badge>
                Pozice D1-D3
              </h4>
              {['D1', 'D2', 'D3'].map((position) => (
                <div key={position} className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-12 h-8 flex items-center justify-center">
                    {position}
                  </Badge>
                  <Select
                    value={homePositions[position] || ''}
                    onValueChange={(playerId) => handlePlayerSelect('home', position, playerId)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Vyberte hráče" />
                    </SelectTrigger>
                    <SelectContent>
                      {(match.homeTeam.players || [])
                        .filter((player: any) => 
                          !Object.values(homePositions).includes(player.id) || 
                          homePositions[position] === player.id
                        )
                        .map((player: any) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                            {player.nickname && <span className="text-muted-foreground ml-2">"{player.nickname}"</span>}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Náhradníci D4-D6 */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">NÁHRADNÍCI</Badge>
                Pozice D4-D6 (volitelné)
              </h4>
              {['D4', 'D5', 'D6'].map((position) => (
                <div key={position} className="flex items-center gap-3">
                  <Badge variant="outline" className="w-12 h-8 flex items-center justify-center border-accent text-accent">
                    {position}
                  </Badge>
                  <Select
                    value={homePositions[position] || ''}
                    onValueChange={(playerId) => handlePlayerSelect('home', position, playerId)}
                  >
                    <SelectTrigger className="flex-1 rounded-xl border-accent/30">
                      <SelectValue placeholder="Volitelný náhradník" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-slate-500">Nevybráno</SelectItem>
                      {(match.homeTeam.players || [])
                        .filter((player: any) => 
                          !Object.values(homePositions).includes(player.id) || 
                          homePositions[position] === player.id
                        )
                        .map((player: any) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                            {player.nickname && <span className="text-muted-foreground ml-2">"{player.nickname}"</span>}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Away Team Lineup */}
        <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 rounded-t-2xl">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-white shadow-sm border border-slate-200 p-1">
                <img 
                  src={getTeamLogo(match.awayTeam.name)}
                  alt={match.awayTeam.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                  {match.awayTeam.name}
                  <Badge className="bg-accent text-white font-bold">HOSTÉ</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  3 základní + až 3 náhradní hráče (H1-H6)
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Základní sestava H1-H3 */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">ZÁKLADNÍ</Badge>
                Pozice H1-H3
              </h4>
              {['H1', 'H2', 'H3'].map((position) => (
                <div key={position} className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-12 h-8 flex items-center justify-center">
                    {position}
                  </Badge>
                  <Select
                    value={awayPositions[position] || ''}
                    onValueChange={(playerId) => handlePlayerSelect('away', position, playerId)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Vyberte hráče" />
                    </SelectTrigger>
                    <SelectContent>
                      {(match.awayTeam.players || [])
                        .filter((player: any) => 
                          !Object.values(awayPositions).includes(player.id) || 
                          awayPositions[position] === player.id
                        )
                        .map((player: any) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                            {player.nickname && <span className="text-muted-foreground ml-2">"{player.nickname}"</span>}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Náhradníci H4-H6 */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">NÁHRADNÍCI</Badge>
                Pozice H4-H6 (volitelné)
              </h4>
              {['H4', 'H5', 'H6'].map((position) => (
                <div key={position} className="flex items-center gap-3">
                  <Badge variant="outline" className="w-12 h-8 flex items-center justify-center border-accent text-accent">
                    {position}
                  </Badge>
                  <Select
                    value={awayPositions[position] || ''}
                    onValueChange={(playerId) => handlePlayerSelect('away', position, playerId)}
                  >
                    <SelectTrigger className="flex-1 rounded-xl border-accent/30">
                      <SelectValue placeholder="Volitelný náhradník" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-slate-500">Nevybráno</SelectItem>
                      {(match.awayTeam.players || [])
                        .filter((player: any) => 
                          !Object.values(awayPositions).includes(player.id) || 
                          awayPositions[position] === player.id
                        )
                        .map((player: any) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                            {player.nickname && <span className="text-muted-foreground ml-2">"{player.nickname}"</span>}
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

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={onComplete}
          disabled={!isLineupComplete}
          size="lg"
          className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold px-12 py-4 text-lg"
        >
          Pokračovat ke hrám
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}