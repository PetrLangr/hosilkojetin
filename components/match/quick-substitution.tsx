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
import { RefreshCw, ArrowRight, Users, UserMinus, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickSubstitutionProps {
  open: boolean;
  onClose: () => void;
  team: 'home' | 'away';
  teamName: string;
  activePlayers: Array<{ id: string; name: string; position: string }>;
  benchPlayers: Array<{ id: string; name: string }>;
  onSubstitute: (outPlayerId: string, inPlayerId: string) => void;
}

export function QuickSubstitution({
  open,
  onClose,
  team,
  teamName,
  activePlayers,
  benchPlayers,
  onSubstitute,
}: QuickSubstitutionProps) {
  const [selectedOut, setSelectedOut] = useState<string | null>(null);
  const [selectedIn, setSelectedIn] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedOut && selectedIn) {
      onSubstitute(selectedOut, selectedIn);
      setSelectedOut(null);
      setSelectedIn(null);
      onClose();
    }
  };

  const canConfirm = selectedOut && selectedIn;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-primary" />
            Rychlé střídání - {teamName}
          </DialogTitle>
          <DialogDescription>
            Vyberte hráče, který odchází z hřiště a hráče z lavičky, který ho nahradí.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-6">
          {/* Active Players - Who's going out */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <UserMinus className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-lg">Odchází z hřiště</h3>
            </div>
            <div className="space-y-2">
              {activePlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedOut(player.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all text-left",
                    selectedOut === player.id
                      ? "border-red-500 bg-red-50 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={selectedOut === player.id ? "destructive" : "outline"}
                        className="w-12 justify-center"
                      >
                        {player.position}
                      </Badge>
                      <span className={cn(
                        "font-medium",
                        selectedOut === player.id && "text-red-700"
                      )}>
                        {player.name}
                      </span>
                    </div>
                    {selectedOut === player.id && (
                      <div className="size-6 rounded-full bg-red-500 flex items-center justify-center">
                        <UserMinus className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bench Players - Who's coming in */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-lg">Přichází z lavičky</h3>
            </div>
            {benchPlayers.length > 0 ? (
              <div className="space-y-2">
                {benchPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedIn(player.id)}
                    disabled={!selectedOut}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all text-left",
                      selectedIn === player.id
                        ? "border-green-500 bg-green-50 shadow-lg"
                        : selectedOut
                        ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        : "border-gray-100 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={selectedIn === player.id ? "default" : "secondary"}
                          className={cn(
                            "w-12 justify-center",
                            selectedIn === player.id && "bg-green-500"
                          )}
                        >
                          SUB
                        </Badge>
                        <span className={cn(
                          "font-medium",
                          selectedIn === player.id && "text-green-700",
                          !selectedOut && "text-gray-400"
                        )}>
                          {player.name}
                        </span>
                      </div>
                      {selectedIn === player.id && (
                        <div className="size-6 rounded-full bg-green-500 flex items-center justify-center">
                          <UserPlus className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl border-2 border-dashed border-gray-200 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Žádní náhradníci na lavičce</p>
                <p className="text-sm text-gray-400 mt-1">
                  Přidejte náhradníky v sestavě týmu
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Preview of substitution */}
        {selectedOut && selectedIn && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-green-50 border border-gray-200">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Odchází</p>
                <Badge variant="destructive" className="text-base py-1 px-3">
                  {activePlayers.find(p => p.id === selectedOut)?.name}
                </Badge>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Přichází</p>
                <Badge className="text-base py-1 px-3 bg-green-500">
                  {benchPlayers.find(p => p.id === selectedIn)?.name}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Zrušit
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="bg-primary hover:bg-[#9F1239]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Potvrdit střídání
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline substitution component for quick in-game changes
export function InlineSubstitution({
  teamName,
  position,
  currentPlayer,
  benchPlayers,
  onSubstitute,
}: {
  teamName: string;
  position: string;
  currentPlayer: { id: string; name: string };
  benchPlayers: Array<{ id: string; name: string }>;
  onSubstitute: (inPlayerId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (benchPlayers.length === 0) return null;

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-64 rounded-xl bg-white shadow-xl border border-gray-200 p-2">
          <div className="mb-2 px-2 py-1">
            <p className="text-xs text-gray-500">Střídání za {currentPlayer.name}</p>
          </div>
          {benchPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => {
                onSubstitute(player.id);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <UserPlus className="h-3 w-3 text-green-500" />
              {player.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}