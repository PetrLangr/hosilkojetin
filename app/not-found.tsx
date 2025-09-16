import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* 404 Hero */}
        <div className="relative mb-12">
          <div className="text-9xl md:text-[12rem] font-black text-slate-200 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-32 md:size-40 rounded-full border-8 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 grid place-items-center">
              <Target className="h-16 w-16 md:h-20 md:w-20 text-primary" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-6 mb-12">
          <Badge className="bg-primary text-white px-6 py-3 text-lg font-bold">
            ASFALT!
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            STRÁNKA <span className="text-primary">NENALEZENA</span>
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed">
            Hledáte něco, co tu není? Možná jste se spletli v adrese, 
            nebo stránka byla přesunuta jinam.
          </p>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100">
            <div className="text-sm text-slate-600">
              <strong>Tip:</strong> Zkuste se vrátit na homepage nebo použijte navigaci v horní části stránky.
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Button asChild className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold py-4">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Domů
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white font-bold py-4">
            <Link href="/teams">
              <Target className="h-5 w-5 mr-2" />
              Týmy
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-100 font-bold py-4">
            <Link href="/standings">
              <Search className="h-5 w-5 mr-2" />
              Tabulka
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900">POPULÁRNÍ STRÁNKY</h3>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Link 
              href="/players" 
              className="text-sm text-slate-600 hover:text-primary transition-colors font-semibold px-3 py-1 rounded-lg hover:bg-slate-50"
            >
              Žebříček hráčů
            </Link>
            <Link 
              href="/schedule" 
              className="text-sm text-slate-600 hover:text-primary transition-colors font-semibold px-3 py-1 rounded-lg hover:bg-slate-50"
            >
              Rozpis kol
            </Link>
            <Link 
              href="/matches" 
              className="text-sm text-slate-600 hover:text-primary transition-colors font-semibold px-3 py-1 rounded-lg hover:bg-slate-50"
            >
              Všechny zápasy
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full border-4 border-primary/10 -z-10" />
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 rounded-full border-2 border-accent/20 -z-10" />
        <div className="absolute top-1/2 right-1/6 w-8 h-8 rounded-full bg-primary/5 -z-10" />
      </div>
    </div>
  );
}