'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { ErrorBanner } from '@/components/admin/admin-ui'

interface QuickResultEntryProps {
  matchId: string
  homeTeam: {
    id: string
    name: string
    shortName: string
  }
  awayTeam: {
    id: string
    name: string
    shortName: string
  }
  onSubmit: (result: QuickResultData) => Promise<void>
  onCancel?: () => void
}

export interface QuickResultData {
  homeWins: number
  awayWins: number
  homeLegs: number
  awayLegs: number
}

export function QuickResultEntry({ matchId, homeTeam, awayTeam, onSubmit, onCancel }: QuickResultEntryProps) {
  const [homeWins, setHomeWins] = useState<string>('')
  const [awayWins, setAwayWins] = useState<string>('')
  const [homeLegs, setHomeLegs] = useState<string>('')
  const [awayLegs, setAwayLegs] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const validateInputs = (): boolean => {
    setError('')

    // Check if all fields are filled
    if (!homeWins || !awayWins || !homeLegs || !awayLegs) {
      setError('Všechna pole musí být vyplněna')
      return false
    }

    const hw = parseInt(homeWins)
    const aw = parseInt(awayWins)
    const hl = parseInt(homeLegs)
    const al = parseInt(awayLegs)

    // Check if values are valid numbers
    if (isNaN(hw) || isNaN(aw) || isNaN(hl) || isNaN(al)) {
      setError('Všechny hodnoty musí být čísla')
      return false
    }

    // Check if values are non-negative
    if (hw < 0 || aw < 0 || hl < 0 || al < 0) {
      setError('Hodnoty nesmí být záporné')
      return false
    }

    // Check if total games is reasonable (HŠL has 19 games max, but with tiebreak could be 19)
    const totalGames = hw + aw
    if (totalGames > 19) {
      setError('Celkový počet výher nesmí přesáhnout 19 (9 singlů + 3 dvojky 501 + 3 dvojky Cricket + 1 trojka + 1 rozstřel)')
      return false
    }

    // Check if there's at least one game played
    if (totalGames === 0) {
      setError('Musí být odehrána alespoň jedna hra')
      return false
    }

    // Check if legs count is reasonable (each game max 3 legs typically, except Cricket)
    if (hl > 60 || al > 60) {
      setError('Počet legů se zdá být příliš vysoký')
      return false
    }

    // Check if legs is at least as many as games won (each win requires at least 1 leg)
    if (hl < hw) {
      setError(`${homeTeam.shortName} musí mít alespoň ${hw} legů (počet výher)`)
      return false
    }
    if (al < aw) {
      setError(`${awayTeam.shortName} musí mít alespoň ${aw} legů (počet výher)`)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateInputs()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        homeWins: parseInt(homeWins),
        awayWins: parseInt(awayWins),
        homeLegs: parseInt(homeLegs),
        awayLegs: parseInt(awayLegs),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se uložit výsledek')
      setIsSubmitting(false)
    }
  }

  const totalHomeWins = parseInt(homeWins) || 0
  const totalAwayWins = parseInt(awayWins) || 0
  const totalHomeLegs = parseInt(homeLegs) || 0
  const totalAwayLegs = parseInt(awayLegs) || 0

  // Calculate match points based on HŠL rules
  let homePoints = 0
  let awayPoints = 0

  if (totalHomeWins > totalAwayWins) {
    homePoints = 3
    awayPoints = 0
  } else if (totalAwayWins > totalHomeWins) {
    homePoints = 0
    awayPoints = 3
  } else {
    // Draw - not typical in HŠL due to tiebreaker, but handle it
    homePoints = 1
    awayPoints = 1
  }

  const sides = [
    { team: homeTeam, label: 'Domácí', wins: homeWins, setWins: setHomeWins, legs: homeLegs, setLegs: setHomeLegs, winsId: 'homeWins', legsId: 'homeLegs' },
    { team: awayTeam, label: 'Hosté', wins: awayWins, setWins: setAwayWins, legs: awayLegs, setLegs: setAwayLegs, winsId: 'awayWins', legsId: 'awayLegs' },
  ]

  return (
    <section className="mx-auto max-w-xl overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex h-10 items-center border-b border-border bg-muted px-3">
        <h2 className="text-sm font-semibold text-slate-900">Rychlé zadání výsledku</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 p-3">
        {/* Dva řádky × dva sloupce: stejná mřížka jako výsledek v tabulce */}
        <div className="overflow-hidden rounded-md border border-border">
          <div className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2 border-b border-border bg-slate-50 px-3 py-1.5">
            <span className="label-muted">Tým</span>
            <span className="label-muted text-center">Výhry</span>
            <span className="label-muted text-center">Legy</span>
          </div>
          {sides.map((s) => (
            <div
              key={s.winsId}
              className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2 border-b border-border px-3 py-1.5 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{s.team.name}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
              <Input
                id={s.winsId}
                aria-label={`${s.team.shortName} – počet výher`}
                type="number"
                min="0"
                max="19"
                value={s.wins}
                onChange={(e) => s.setWins(e.target.value)}
                placeholder="0"
                className="tnum h-9 text-center text-base font-semibold"
              />
              <Input
                id={s.legsId}
                aria-label={`${s.team.shortName} – počet legů`}
                type="number"
                min="0"
                value={s.legs}
                onChange={(e) => s.setLegs(e.target.value)}
                placeholder="0"
                className="tnum h-9 text-center text-base font-semibold"
              />
            </div>
          ))}
        </div>

        {(totalHomeWins > 0 || totalAwayWins > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-md bg-muted px-3 py-2 text-sm">
            <span>
              <span className="label-muted mr-2">Hry</span>
              <span className="tnum font-semibold text-slate-900">{totalHomeWins} : {totalAwayWins}</span>
              <span className="label-muted ml-4 mr-2">Legy</span>
              <span className="tnum font-semibold text-slate-900">{totalHomeLegs} : {totalAwayLegs}</span>
            </span>
            <span>
              <span className="label-muted mr-2">Body</span>
              <span className="tnum font-semibold text-primary">
                {homeTeam.shortName} {homePoints} : {awayPoints} {awayTeam.shortName}
              </span>
            </span>
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-9 flex-1 font-semibold"
            >
              Zrušit
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !homeWins || !awayWins || !homeLegs || !awayLegs}
            className="h-9 flex-1 bg-primary font-semibold text-white hover:bg-[#9F1239]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Ukládám…' : 'Uložit výsledek'}
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Statistiky hráčů (BPI, náhozy, checkouty) se při rychlém zadání neaktualizují.
        </p>
      </form>
    </section>
  )
}
