"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

/**
 * Kam po přihlášení. Výchozí callbackUrl je titulní stránka (tam vede tlačítko
 * v hlavičce), a ta pro přihlášeného nic nového nenabízí — v tom případě
 * posíláme podle role. Konkrétní stránku, ze které middleware uživatele
 * vyhodil, respektujeme. Jen relativní cesty, ať se z parametru nedá udělat
 * open redirect.
 */
function resolveTarget(callbackUrl: string | null, role?: string) {
  const fallback = role === 'admin' ? '/admin' : '/profile';
  if (!callbackUrl) return fallback;
  try {
    const url = new URL(callbackUrl, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    const path = url.pathname + url.search + url.hash;
    return path === '/' || path.startsWith('/auth/') ? fallback : path;
  } catch {
    return fallback;
  }
}

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        // Do sloupce email se ukládá i prosté jméno (např. admin) — formát se nekontroluje.
        email: email.trim(),
        password,
        redirect: false
      });

      if (result?.error) {
        // Kód chyby z NextAuth ("CredentialsSignin") uživateli nic neřekne.
        setError('Nesprávné přihlašovací jméno nebo heslo.');
        setIsLoading(false);
        return;
      }

      const session = await fetch('/api/auth/session').then(res => res.json());
      router.push(resolveTarget(searchParams.get('callbackUrl'), session?.user?.role));
      router.refresh();
      // isLoading necháváme zapnuté až do přesměrování, ať nejde odeslat podruhé.
    } catch {
      setError('Přihlášení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
          Přihlašovací jméno
        </Label>
        <Input
          id="email"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          aria-invalid={!!error}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
          Heslo
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={!!error}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isLoading}
            aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" className="h-10 w-full font-semibold" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Přihlašuji…
          </>
        ) : (
          'Přihlásit se'
        )}
      </Button>
    </form>
  );
}

export default function SignIn() {
  return (
    <div className="flex justify-center pt-6 pb-10 sm:pt-12">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-lg border border-border bg-white card-shadow">
          {/* Vínový proužek nahoře navazuje na lištu webu. */}
          <div className="h-1 bg-gradient-to-r from-primary to-[#9F1239]" />

          <div className="px-6 pt-6 pb-5 sm:px-8">
            <div className="mb-5 flex flex-col items-center text-center">
              <img
                src="/logo-hsl-full.png"
                alt="Hospodská šipková liga"
                className="h-14 w-auto"
              />
              <h1 className="mt-4 text-lg font-bold tracking-tight text-slate-900">
                Přihlášení
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pro kapitány týmů a správce ligy
              </p>
            </div>

            <Suspense fallback={<div className="h-[188px]" />}>
              <SignInForm />
            </Suspense>
          </div>

          <div className="border-t border-border bg-muted px-6 py-3 text-center text-xs text-muted-foreground sm:px-8">
            Přístup přiděluje technický správce.
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Tabulky, rozpis a výsledky jsou veřejné i bez přihlášení.
        </p>
        <div className="mt-2 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" />
            Zpět na úvod
          </Link>
        </div>
      </div>
    </div>
  );
}
