'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Trophy } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-500" />
            Rychlé zadání výsledku
          </CardTitle>
          <CardDescription>
            Zadejte pouze celkový počet výher a legů. Statistiky hráčů nebudou aktualizovány, ale tabulka ano.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Home Team */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{homeTeam.name} (Domácí)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeWins">Počet výher</Label>
                  <Input
                    id="homeWins"
                    type="number"
                    min="0"
                    max="19"
                    value={homeWins}
                    onChange={(e) => setHomeWins(e.target.value)}
                    placeholder="0"
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeLegs">Počet legů</Label>
                  <Input
                    id="homeLegs"
                    type="number"
                    min="0"
                    value={homeLegs}
                    onChange={(e) => setHomeLegs(e.target.value)}
                    placeholder="0"
                    className="text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="flex items-center justify-center text-muted-foreground">
              <div className="h-px bg-border flex-1" />
              <span className="px-4 text-sm font-medium">VS</span>
              <div className="h-px bg-border flex-1" />
            </div>

            {/* Away Team */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{awayTeam.name} (Hosté)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="awayWins">Počet výher</Label>
                  <Input
                    id="awayWins"
                    type="number"
                    min="0"
                    max="19"
                    value={awayWins}
                    onChange={(e) => setAwayWins(e.target.value)}
                    placeholder="0"
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awayLegs">Počet legů</Label>
                  <Input
                    id="awayLegs"
                    type="number"
                    min="0"
                    value={awayLegs}
                    onChange={(e) => setAwayLegs(e.target.value)}
                    placeholder="0"
                    className="text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            {(totalHomeWins > 0 || totalAwayWins > 0) && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Přehled výsledku:</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{totalHomeWins}</div>
                        <div className="text-xs text-muted-foreground">{homeTeam.shortName} - Výhry</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{totalAwayWins}</div>
                        <div className="text-xs text-muted-foreground">{awayTeam.shortName} - Výhry</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-semibold text-muted-foreground">{totalHomeLegs}</div>
                        <div className="text-xs text-muted-foreground">Legy</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-sm text-muted-foreground">:</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-muted-foreground">{totalAwayLegs}</div>
                        <div className="text-xs text-muted-foreground">Legy</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Body do tabulky:</span>
                        <span className="font-semibold">
                          {homeTeam.shortName} {homePoints} : {awayPoints} {awayTeam.shortName}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Zrušit
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !homeWins || !awayWins || !homeLegs || !awayLegs}
                className="flex-1"
              >
                {isSubmitting ? 'Ukládání...' : 'Uložit výsledek'}
              </Button>
            </div>

            {/* Warning about player stats */}
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
              ⚠️ Upozornění: Při rychlém zadání nebudou aktualizovány statistiky jednotlivých hráčů (BPI, HSL Index, checkout atd.).
              Pro plné statistiky použijte podrobné zadání výsledků.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
