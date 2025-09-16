"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';

interface PinAccessProps {
  match: any;
  onAccessGranted: () => void;
}

export function PinAccess({ match, onAccessGranted }: PinAccessProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/match/${match.id}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      if (response.ok) {
        onAccessGranted();
      } else {
        const data = await response.json();
        setError(data.error || 'Neplatný PIN kód');
      }
    } catch (error) {
      setError('Chyba při ověřování PIN kódu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card className="rounded-3xl bg-white border border-gray-100 card-shadow">
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="size-20 rounded-full bg-primary/10 grid place-items-center mx-auto mb-6">
                <KeyRound className="h-10 w-10 text-primary" />
              </div>
              
              <Badge className="bg-primary text-white px-4 py-2 font-bold mb-4">
                PIN POŽADOVÁN
              </Badge>
              
              <h1 className="text-2xl font-black text-slate-900 mb-4">
                ZADEJTE <span className="text-primary">KAPITÁNSKÝ PIN</span>
              </h1>
              
              <p className="text-slate-600 mb-6">
                Pro zadávání výsledků tohoto zápasu potřebujete PIN kód od kapitána vašeho týmu.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 mb-6">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="size-8 rounded-lg bg-white shadow-sm border border-slate-200 p-1">
                    <img 
                      src={`/logos/dcstopchropyne_logo.png`}
                      alt={match.homeTeam.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-sm font-black text-slate-900">VS</div>
                  <div className="size-8 rounded-lg bg-white shadow-sm border border-slate-200 p-1">
                    <img 
                      src={`/logos/rychlisnecivlkos_logo.png`}
                      alt={match.awayTeam.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </div>
                <div className="text-xs text-slate-600">
                  {match.round}. kolo • Sezóna 2025/2026
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Zadejte PIN kód"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.slice(0, 6))} // Max 6 digits
                  className="text-center text-2xl font-bold tracking-widest rounded-xl border-2 border-primary/30 focus:border-primary h-16"
                  maxLength={6}
                  autoComplete="off"
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              )}
              
              <Button 
                type="submit" 
                disabled={loading || pin.length < 4}
                className="w-full rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold py-4 text-lg"
              >
                {loading ? 'Ověřuji...' : 'Ověřit PIN'}
                <Lock className="h-5 w-5 ml-2" />
              </Button>
            </form>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-sm text-blue-700">
                <strong>Pro kapitány:</strong> PIN kód si můžete nastavit ve svém profilu. 
                Sdílejte ho pouze s důvěryhodnými členy týmu.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}