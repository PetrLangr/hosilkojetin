"use client";

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, LogIn, Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Attempting login with:', email);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        console.log('Login error:', result.error);
        setError(`Neplatné přihlašovací údaje: ${result.error}`);
      } else {
        console.log('Login successful, redirecting...');
        // Get the session to check user role
        const session = await fetch('/api/auth/session').then(res => res.json());
        
        // Redirect based on user role
        if (session?.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/profile');
        }
        router.refresh();
      }
    } catch (error) {
      console.error('Login exception:', error);
      setError('Chyba při přihlašování');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Target className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Přihlášení do HŠL
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hospodská Šipková Liga
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Přihlásit se</CardTitle>
            <CardDescription>
              Zadejte své přihlašovací údaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Heslo</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  'Přihlašuji...'
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Přihlásit se
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nemáte účet? Kontaktujte administrátora ligy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}