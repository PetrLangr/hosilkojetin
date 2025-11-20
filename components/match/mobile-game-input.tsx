"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Trophy, Target, Plus, Minus, Check, X } from 'lucide-react';

interface MobileGameInputProps {
  gameNumber: number;
  gameName: string;
  homeTeam: { id: string; name: string; shortName: string };
  awayTeam: { id: string; name: string; shortName: string };
  onComplete: (result: {
    winner: 'home' | 'away';
    homeLegs: number;
    awayLegs: number;
    stats?: any;
  }) => void;
  format: 'bo3' | 'bo1' | 'bo1_15rounds';
}

export function MobileGameInput({
  gameNumber,
  gameName,
  homeTeam,
  awayTeam,
  onComplete,
  format
}: MobileGameInputProps) {
  const [homeLegs, setHomeLegs] = useState(0);
  const [awayLegs, setAwayLegs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const maxLegs = format === 'bo3' ? 2 : 1;
  const canFinish = homeLegs === maxLegs || awayLegs === maxLegs;

  const handleLegChange = (team: 'home' | 'away', delta: number) => {
    if (team === 'home') {
      const newValue = Math.max(0, Math.min(maxLegs, homeLegs + delta));
      setHomeLegs(newValue);
    } else {
      const newValue = Math.max(0, Math.min(maxLegs, awayLegs + delta));
      setAwayLegs(newValue);
    }
  };

  const handleComplete = () => {
    const winner = homeLegs > awayLegs ? 'home' : 'away';
    onComplete({
      winner,
      homeLegs,
      awayLegs
    });
    setIsComplete(true);
  };

  const handleReset = () => {
    setHomeLegs(0);
    setAwayLegs(0);
    setIsComplete(false);
  };

  return (
    <Card className={cn(
      "rounded-2xl transition-all",
      isComplete && "bg-green-50 border-green-200"
    )}>
      <CardContent className="p-0">
        {/* Game header */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="text-lg px-3 py-1">
                {gameNumber}
              </Badge>
              <div>
                <h3 className="font-semibold text-lg">{gameName}</h3>
                <p className="text-sm text-muted-foreground">
                  {format === 'bo3' ? 'Best of 3' : format === 'bo1_15rounds' ? '15 kol' : 'Best of 1'}
                </p>
              </div>
            </div>
            {isComplete && (
              <Badge className="bg-green-500 text-white">
                <Check className="mr-1 h-3 w-3" />
                Dokončeno
              </Badge>
            )}
          </div>
        </div>

        {/* Score input */}
        <div className="p-6 space-y-6">
          {/* Home team */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{homeTeam.name}</h4>
              <Badge variant="outline" className="text-xs">DOMÁCÍ</Badge>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleLegChange('home', -1)}
                disabled={homeLegs === 0 || isComplete}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <div className="text-4xl font-black text-primary">
                  {homeLegs}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {homeLegs === 1 ? 'leg' : 'legy'}
                </p>
              </div>

              <Button
                size="icon"
                variant="outline"
                onClick={() => handleLegChange('home', 1)}
                disabled={homeLegs === maxLegs || isComplete}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">VS</span>
            </div>
          </div>

          {/* Away team */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{awayTeam.name}</h4>
              <Badge variant="outline" className="text-xs">HOSTÉ</Badge>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleLegChange('away', -1)}
                disabled={awayLegs === 0 || isComplete}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <div className="text-4xl font-black text-primary">
                  {awayLegs}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {awayLegs === 1 ? 'leg' : 'legy'}
                </p>
              </div>

              <Button
                size="icon"
                variant="outline"
                onClick={() => handleLegChange('away', 1)}
                disabled={awayLegs === maxLegs || isComplete}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!isComplete ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReset}
                  disabled={homeLegs === 0 && awayLegs === 0}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-[#9F1239]"
                  onClick={handleComplete}
                  disabled={!canFinish}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Potvrdit
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                Upravit výsledek
              </Button>
            )}
          </div>

          {/* Winner display */}
          {isComplete && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">
                  Vítěz: {homeLegs > awayLegs ? homeTeam.name : awayTeam.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick score buttons for mobile
export function QuickScoreButtons({
  onHomeWin,
  onAwayWin,
  homeTeam,
  awayTeam,
  disabled = false
}: {
  onHomeWin: () => void;
  onAwayWin: () => void;
  homeTeam: string;
  awayTeam: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        size="lg"
        variant="outline"
        onClick={onHomeWin}
        disabled={disabled}
        className="h-20 flex flex-col gap-2"
      >
        <Trophy className="h-6 w-6 text-blue-500" />
        <span className="text-sm font-semibold">{homeTeam}</span>
        <span className="text-xs text-muted-foreground">vyhrál</span>
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={onAwayWin}
        disabled={disabled}
        className="h-20 flex flex-col gap-2"
      >
        <Trophy className="h-6 w-6 text-red-500" />
        <span className="text-sm font-semibold">{awayTeam}</span>
        <span className="text-xs text-muted-foreground">vyhrál</span>
      </Button>
    </div>
  );
}

// Swipe gesture handler for quick navigation
export function SwipeableGameCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft = true,
  canSwipeRight = true
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  canSwipeLeft?: boolean;
  canSwipeRight?: boolean;
}) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && canSwipeLeft && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && canSwipeRight && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="touch-pan-y"
    >
      {children}
    </div>
  );
}