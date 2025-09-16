export interface PlayerBPIStats {
  singlesPlayed: number;
  singlesWon: number;
  S95: number;
  S133: number;
  S170: number;
  CO3: number;
  CO4: number;
  CO5: number;
  CO6: number;
}

export function calculateBPI(stats: PlayerBPIStats): number {
  const singlesWinRate = stats.singlesPlayed > 0 ? stats.singlesWon / stats.singlesPlayed : 0;
  
  const s95Component = 20 * Math.min(1, stats.S95 / 10);
  const s133Component = 15 * Math.min(1, stats.S133 / 5);
  const s170Component = 15 * Math.min(1, stats.S170 / 2);
  
  const checkoutComponent = stats.singlesPlayed > 0 
    ? 10 * (0.5 * stats.CO3 + 0.35 * stats.CO4 + 0.15 * stats.CO5) / Math.max(1, stats.singlesPlayed)
    : 0;
  
  const bpi = 60 * singlesWinRate + s95Component + s133Component + s170Component + checkoutComponent;
  
  return Math.round(bpi * 100) / 100;
}