'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, ListChecks, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResultModeSelectorProps {
  onModeSelected: (mode: 'quick' | 'detailed') => void
  matchInfo: {
    homeTeam: { name: string; shortName: string }
    awayTeam: { name: string; shortName: string }
    round?: number
  }
}

export function ResultModeSelector({ onModeSelected, matchInfo }: ResultModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'quick' | 'detailed' | null>(null)

  const handleModeClick = (mode: 'quick' | 'detailed') => {
    setSelectedMode(mode)
    // Small delay for visual feedback
    setTimeout(() => onModeSelected(mode), 200)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Zadání výsledku zápasu</h1>
        <p className="text-muted-foreground">
          {matchInfo.homeTeam.name} vs {matchInfo.awayTeam.name}
          {matchInfo.round && ` • ${matchInfo.round}. kolo`}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Mode Card */}
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg hover:border-orange-500',
            selectedMode === 'quick' && 'border-orange-500 ring-2 ring-orange-500/20'
          )}
          onClick={() => handleModeClick('quick')}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8 text-orange-500" />
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded">
                RYCHLÉ
              </span>
            </div>
            <CardTitle className="text-xl">Rychlé zadání</CardTitle>
            <CardDescription>
              Jen celkový výsledek a počet legů
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-green-600">✓ Výhody:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Zadání za 1-2 minuty</li>
                <li>• Pouze 4 čísla (výhry + legy)</li>
                <li>• Okamžitá aktualizace tabulky</li>
                <li>• Ideální pro rychlé zadání</li>
              </ul>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-orange-600">⚠ Omezení:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Statistiky hráčů se neaktualizují</li>
                <li>• Bez BPI/HSL Index změn</li>
                <li>• Bez detailů jednotlivých her</li>
              </ul>
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Rychlé zadání
            </Button>
          </CardContent>
        </Card>

        {/* Detailed Mode Card */}
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg hover:border-primary',
            selectedMode === 'detailed' && 'border-primary ring-2 ring-primary/20'
          )}
          onClick={() => handleModeClick('detailed')}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <ListChecks className="h-8 w-8 text-primary" />
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                KOMPLETNÍ
              </span>
            </div>
            <CardTitle className="text-xl">Podrobné zadání</CardTitle>
            <CardDescription>
              Detailní výsledky všech her a statistiky
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-green-600">✓ Výhody:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Kompletní statistiky hráčů</li>
                <li>• Aktualizace BPI/HSL Index</li>
                <li>• High finishes (95+, 133+, 170+)</li>
                <li>• Checkouts (CO3-CO6)</li>
                <li>• Detail každé hry</li>
              </ul>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-blue-600">ℹ Info:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Zadání trvá 10-15 minut</li>
                <li>• Všech 19 her individuálně</li>
                <li>• Profesionální zápis</li>
              </ul>
            </div>
            <Button
              className="w-full"
              size="lg"
            >
              <ListChecks className="h-4 w-4 mr-2" />
              Podrobné zadání
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">
              💡 Kdy použít jaký režim?
            </p>
            <ul className="space-y-1">
              <li>
                <strong>Rychlé:</strong> Pokud chcete jen aktualizovat tabulku a nemáte čas na detaily.
              </li>
              <li>
                <strong>Podrobné:</strong> Pokud chcete mít kompletní statistiky a historii všech her.
              </li>
            </ul>
            <p className="text-xs italic pt-2">
              Tip: Pro oficiální zápasy doporučujeme použít podrobné zadání pro zachování kompletních záznamů.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
