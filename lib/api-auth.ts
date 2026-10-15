import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Kontrola oprávnění pro zapisující API.
 *
 * Skrytá tlačítka v UI nestačí — kdo zná adresu, pošle požadavek napřímo.
 * Každý POST/PUT/DELETE proto musí projít jedním z těchto strážců.
 *
 * Použití:
 *   const auth = await requireAdmin();
 *   if (auth.error) return auth.error;
 */
type AuthResult =
  | { session: Session; error?: undefined }
  | { session?: undefined; error: NextResponse };

export async function requireUser(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Nepřihlášený uživatel' }, { status: 401 }) };
  }
  return { session };
}

export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireUser();
  if (auth.error) return auth;
  if (auth.session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Pouze pro administrátora' }, { status: 403 }) };
  }
  return auth;
}

/**
 * Smí uživatel zapisovat výsledek tohoto zápasu? Admin vždy, jinak jen člen
 * jednoho z obou týmů. Stejná pravidla jako na stránce /match/[id].
 */
export function canEditMatch(
  session: Session,
  match: { homeTeamId: string; awayTeamId: string },
) {
  if (session.user.role === 'admin') return true;
  const teamId = session.user.player?.team?.id;
  return teamId === match.homeTeamId || teamId === match.awayTeamId;
}
