"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorBanner, TeamMark } from '@/components/admin/admin-ui';
import { getTeamLogo } from '@/lib/team-logos';

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

  const meta = [match.round ? `${match.round}. kolo` : null, match.season?.name].filter(Boolean).join(' · ');

  return (
    <div>
      <PageHeader title="Zadání výsledku" subtitle={meta || undefined} />

      <section className="mx-auto max-w-sm overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex h-10 items-center gap-2 border-b border-border bg-muted px-3 text-sm">
          <TeamMark name={match.homeTeam.name} shortName={match.homeTeam.shortName} logoUrl={getTeamLogo(match.homeTeam.name)} />
          <span className="truncate font-semibold text-slate-900">{match.homeTeam.shortName || match.homeTeam.name}</span>
          <span className="text-muted-foreground">–</span>
          <span className="truncate font-semibold text-slate-900">{match.awayTeam.shortName || match.awayTeam.name}</span>
          <TeamMark name={match.awayTeam.name} shortName={match.awayTeam.shortName} logoUrl={getTeamLogo(match.awayTeam.name)} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-4">
          <div className="space-y-1.5">
            <label htmlFor="match-pin" className="block text-xs font-semibold text-slate-700">
              PIN kapitána
            </label>
            <Input
              id="match-pin"
              type="text"
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 6))} // Max 6 digits
              className="tnum h-10 text-center text-lg font-semibold tracking-[0.4em]"
              maxLength={6}
              autoComplete="off"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              PIN nastavuje kapitán v profilu a sdílí ho jen se svým týmem.
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          <Button
            type="submit"
            disabled={loading || pin.length < 4}
            className="h-9 w-full bg-primary font-semibold text-white hover:bg-[#9F1239]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Ověřuji…' : 'Ověřit PIN'}
          </Button>
        </form>
      </section>
    </div>
  );
}
