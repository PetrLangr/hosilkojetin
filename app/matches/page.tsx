import { redirect } from 'next/navigation';

/**
 * Rozpis a výsledky byly sloučené do /schedule — ukazovaly tytéž zápasy dvakrát.
 * Adresa zůstává funkční kvůli odkazům, které už někdo může mít uložené.
 */
export default function MatchesRedirect() {
  redirect('/schedule');
}
