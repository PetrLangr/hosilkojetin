"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ArrowRight, Users, UserMinus, UserPlus, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImprovedSubstitutionProps {
  open: boolean;
  onClose: () => void;
  team: 'home' | 'away';
  teamName: string;
  activePlayers: Array<{ id: string; name: string; position: string }>;
  benchPlayers: Array<{ id: string; name: string; position?: string }>;
  onSubstitute: (substitutions: Array<{ outPlayerId: string; inPlayerId: string }>) => void;
  substitutionPairs?: Record<string, string>; // Track position pairings
  gameId?: number; // Current game ID
  allPositionPlayers?: Record<string, { id: string; name: string }>; // All players by position
}

export function ImprovedSubstitution({
  open,
  onClose,
  team,
  teamName,
  activePlayers,
  benchPlayers,
  onSubstitute,
  substitutionPairs = {},
  gameId = 0,
  allPositionPlayers = {},
}: ImprovedSubstitutionProps) {
  const [substitutions, setSubstitutions] = useState<Array<{ outPlayerId: string; inPlayerId: string }>>([]);

  const handlePlayerSwap = (outPlayerId: string, inPlayerId: string) => {
    setSubstitutions(prev => {
      // Remove any existing substitution for these players
      const filtered = prev.filter(sub =>
        sub.outPlayerId !== outPlayerId && sub.inPlayerId !== inPlayerId
      );
      // Add new substitution
      return [...filtered, { outPlayerId, inPlayerId }];
    });
  };

  const removeSubstitution = (outPlayerId: string) => {
    setSubstitutions(prev => prev.filter(sub => sub.outPlayerId !== outPlayerId));
  };

  const getPlayerSubstitution = (playerId: string) => {
    return substitutions.find(sub => sub.outPlayerId === playerId);
  };

  const isPlayerBeingSubbedIn = (playerId: string) => {
    return substitutions.some(sub => sub.inPlayerId === playerId);
  };

  const handleConfirm = () => {
    if (substitutions.length > 0) {
      onSubstitute(substitutions);
      setSubstitutions([]);
      onClose();
    }
  };

  const handleCancel = () => {
    setSubstitutions([]);
    onClose();
  };

  // Get available substitute options for a position
  const getAvailableSubstitutesForPosition = (activePlayer: { id: string; position: string }) => {
    const isGame9 = gameId === 9; // Game 9 (301 triple) allows any substitutions

    if (isGame9) {
      // Game 9: Can substitute with any bench player
      return benchPlayers.filter(player => !isPlayerBeingSubbedIn(player.id));
    }

    // Check if this position already has a pair
    if (substitutionPairs[activePlayer.position]) {
      // This position is paired - can only substitute with their pair
      const pairedPosition = substitutionPairs[activePlayer.position];

      // Check if paired player is on bench
      const pairedOnBench = benchPlayers.find(p => p.position === pairedPosition);
      if (pairedOnBench && !isPlayerBeingSubbedIn(pairedOnBench.id)) {
        return [pairedOnBench];
      }

      // Check if paired player is currently active (already playing)
      const pairedActive = activePlayers.find(p => p.position === pairedPosition);
      if (pairedActive && !isPlayerBeingSubbedIn(pairedActive.id)) {
        // They can swap positions
        return [{
          id: pairedActive.id,
          name: pairedActive.name,
          position: pairedPosition
        }];
      }

      // Paired player exists but not available in this game
      return [];
    }

    // Not paired yet - can substitute with any unpaired bench player
    return benchPlayers.filter(player =>
      player.position && // Must have a position
      !substitutionPairs[player.position] && // Their position must not be paired
      !isPlayerBeingSubbedIn(player.id)
    );
  };

  const availableBenchPlayers = benchPlayers.filter(player => !isPlayerBeingSubbedIn(player.id));

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-primary" />
            Střídání - {teamName}
          </DialogTitle>
          <DialogDescription>
            Klikněte na hráče na hřišti a vyberte náhradníka z lavičky. Můžete vystřídat více hráčů najednou.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Active Players */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-lg">Hráči na hřišti</h3>
            </div>
            <div className="space-y-2">
              {activePlayers.map((player) => {
                const substitution = getPlayerSubstitution(player.id);
                const benchPlayer = substitution ? benchPlayers.find(p => p.id === substitution.inPlayerId) : null;

                return (
                  <div
                    key={player.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      substitution
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={substitution ? "default" : "outline"}
                          className={cn(
                            "w-12 justify-center",
                            substitution && "bg-green-500"
                          )}
                        >
                          {player.position}
                        </Badge>
                        <span className={cn(
                          "font-medium",
                          substitution && "text-green-700"
                        )}>
                          {player.name}
                        </span>
                      </div>

                      {substitution ? (
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-green-600" />
                          <Badge className="bg-green-500">
                            {benchPlayer?.name}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSubstitution(player.id)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500 mr-2">Vystřídat za:</span>
                          {(() => {
                            const availableSubs = getAvailableSubstitutesForPosition(player);
                            if (availableSubs.length > 0) {
                              return availableSubs.map((subPlayer) => (
                                <Button
                                  key={subPlayer.id}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePlayerSwap(player.id, subPlayer.id)}
                                  className="h-8 px-3 text-xs"
                                >
                                  {subPlayer.name}
                                  {subPlayer.position && (
                                    <span className="ml-1 text-gray-400">({subPlayer.position})</span>
                                  )}
                                </Button>
                              ));
                            }

                            // Show appropriate message based on pairing status
                            if (substitutionPairs[player.position]) {
                              const pairedPos = substitutionPairs[player.position];
                              return (
                                <span className="text-xs text-gray-400 italic">
                                  Spárován s {pairedPos} - není v této hře
                                </span>
                              );
                            }
                            return (
                              <span className="text-xs text-gray-400 italic">
                                Žádní volní náhradníci
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Bench Players */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-lg">Dostupní náhradníci</h3>
            </div>
            {availableBenchPlayers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableBenchPlayers.map((player) => (
                  <Badge
                    key={player.id}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    {player.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border-2 border-dashed border-gray-200 text-center">
                <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  {benchPlayers.length === 0
                    ? "Žádní náhradníci na lavičce"
                    : "Všichni náhradníci jsou již vybráni"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Substitution Summary */}
          {substitutions.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-700">
                  Plánovaná střídání ({substitutions.length})
                </h4>
              </div>
              <div className="space-y-2">
                {substitutions.map((sub, index) => {
                  const outPlayer = activePlayers.find(p => p.id === sub.outPlayerId);
                  const inPlayer = benchPlayers.find(p => p.id === sub.inPlayerId);
                  return (
                    <div key={index} className="flex items-center justify-center gap-3 text-sm">
                      <Badge variant="outline" className="bg-white">
                        {outPlayer?.name}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-green-600" />
                      <Badge className="bg-green-500 text-white">
                        {inPlayer?.name}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Zrušit
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={substitutions.length === 0}
            className="bg-primary"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Potvrdit střídání ({substitutions.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}