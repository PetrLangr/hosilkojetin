'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Zap, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'

interface ResultModeSelectorProps {
  onModeSelected: (mode: 'quick' | 'detailed') => void
  matchInfo: {
    homeTeam: { name: string; shortName: string }
    awayTeam: { name: string; shortName: string }
    round?: number
  }
}

const MODES = [
  {
    mode: 'quick' as const,
    icon: Zap,
    title: 'Rychlé zadání',
    time: '1–2 min',
    lines: [
      'Jen výhry a legy obou týmů',
      'Tabulka se aktualizuje hned',
      'Bez her a statistik hráčů',
    ],
    note: 'Podrobnosti lze doplnit později.',
  },
  {
    mode: 'detailed' as const,
    icon: ListChecks,
    title: 'Podrobné zadání',
    time: '10–15 min',
    lines: [
      'Všech 19 her: sestavy, legy, vítězové',
      'Náhozy 95+ / 133+ / 170+, checkouty CO3–CO6',
      'Aktualizuje BPI a statistiky hráčů',
    ],
    note: 'Doporučeno pro oficiální zápis.',
  },
]

export function ResultModeSelector({ onModeSelected, matchInfo }: ResultModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'quick' | 'detailed' | null>(null)

  const handleModeClick = (mode: 'quick' | 'detailed') => {
    setSelectedMode(mode)
    // Krátká prodleva, ať je vidět, co bylo zvoleno
    setTimeout(() => onModeSelected(mode), 200)
  }

  return (
    <div>
      <PageHeader
        title="Zadání výsledku"
        subtitle={`${matchInfo.homeTeam.name} – ${matchInfo.awayTeam.name}${matchInfo.round ? ` · ${matchInfo.round}. kolo` : ''}`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {MODES.map(({ mode, icon: Icon, title, time, lines, note }) => {
          const active = selectedMode === mode
          return (
            <section
              key={mode}
              role="button"
              tabIndex={0}
              onClick={() => handleModeClick(mode)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleModeClick(mode)
                }
              }}
              className={cn(
                'flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-white transition-colors hover:border-primary/60',
                active ? 'border-primary ring-1 ring-primary/30' : 'border-border'
              )}
            >
              <div className="flex h-10 items-center justify-between gap-2 border-b border-border bg-muted px-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                </div>
                <span className="tnum text-xs text-muted-foreground">{time}</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-3">
                <ul className="space-y-1 text-sm text-slate-700">
                  {lines.map((l) => (
                    <li key={l} className="flex gap-2">
                      <span className="text-slate-300">–</span>
                      {l}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">{note}</p>
                <Button
                  tabIndex={-1}
                  variant={mode === 'detailed' ? 'default' : 'outline'}
                  className={cn(
                    'mt-auto h-9 w-full font-semibold',
                    mode === 'detailed' && 'bg-primary text-white hover:bg-[#9F1239]'
                  )}
                >
                  {title}
                </Button>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
