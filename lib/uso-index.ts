export type UsoInputs = {
  // zápasy (singles)
  matchesPlayed: number; // Zápasy C
  matchesWon: number;    // Zápasy V

  // legy (singles)
  legsWon: number;       // Legy V
  legsLost: number;      // Legy O

  // high scores per leg (Př/leg)
  h95PerLeg: number;     // Náhozy 95+ Př/leg
  h133PerLeg: number;    // Náhozy 133+ Př/leg
  h170PerLeg: number;    // Náhozy 170+ Př/leg

  // rychlá zavření (počty)
  co3: number;           // Zavření v 3. kole
  co4: number;           // Zavření v 4. kole
  co5: number;           // Zavření v 5. kole
  co6: number;           // Zavření v 6. kole
};

export function computeUsoIndex(i: UsoInputs): number {
  const WRm = i.matchesPlayed ? i.matchesWon / i.matchesPlayed : 0;
  const totalLegs = i.legsWon + i.legsLost;
  const WRl = totalLegs ? i.legsWon / totalLegs : 0;

  const h95  = i.h95PerLeg;
  const h133 = i.h133PerLeg;
  const h170 = i.h170PerLeg;

  const COscore = 4 * i.co3 + 2 * i.co4 + 1 * i.co5 + 0.5 * i.co6;

  // Koeficienty z reverse-engineeringu
  const a = -13.34;
  const b = 312.34;
  const c =   3.43;
  const d =  15.19;
  const e =  93.75;
  const f =   0.94;
  const g = -55.96;

  const raw =
    a * WRm + b * WRl + c * h95 + d * h133 + e * h170 + f * COscore + g;

  return Math.round(raw * 10) / 10;
}

/**
 * Enhanced HŠL index with reliability weighting for players with more matches
 * Now includes ALL games (singles, doubles, triples) with singles weighted more heavily
 */
export type HslIndexInputs = {
  // Core performance - SINGLES
  matchesPlayed: number;
  matchesWon: number;
  legsWon: number;
  legsLost: number;

  // Total games (all types)
  totalGamesPlayed?: number;
  totalGamesWon?: number;

  // High finishes (absolute counts - singles only)
  s95: number;
  s133: number;
  s170: number;

  // Checkouts (absolute counts - singles only)
  co3: number;
  co4: number;
  co5: number;
  co6: number;
};

export function computeHslIndex(inputs: HslIndexInputs): number {
  // Singles rates (main component)
  const singlesWinRate = inputs.matchesPlayed > 0 ? inputs.matchesWon / inputs.matchesPlayed : 0;
  const totalLegs = inputs.legsWon + inputs.legsLost;
  const legWinRate = totalLegs > 0 ? inputs.legsWon / totalLegs : 0;

  // Overall game win rate (all game types) - lower weight
  const totalGamesPlayed = inputs.totalGamesPlayed ?? inputs.matchesPlayed;
  const totalGamesWon = inputs.totalGamesWon ?? inputs.matchesWon;
  const overallWinRate = totalGamesPlayed > 0 ? totalGamesWon / totalGamesPlayed : 0;

  // Per-leg rates for high finishes (singles only)
  const s95PerLeg = totalLegs > 0 ? inputs.s95 / totalLegs : 0;
  const s133PerLeg = totalLegs > 0 ? inputs.s133 / totalLegs : 0;
  const s170PerLeg = totalLegs > 0 ? inputs.s170 / totalLegs : 0;

  // Weighted checkout score (singles only)
  const coScore = 4 * inputs.co3 + 2 * inputs.co4 + 1 * inputs.co5 + 0.5 * inputs.co6;

  // Reliability factor - based on total games played
  // Reaches 95% effectiveness at 30 games, full effectiveness at 50+ games
  const reliabilityFactor = Math.min(1, (totalGamesPlayed + 10) / 60);

  // Coefficients balancing singles (70%) and overall performance (30%)
  const coefficients = {
    singlesWinRate: -10.0,     // Singles match win rate (negative to balance)
    legWinRate: 280.0,         // Singles leg win rate (MAIN component)
    overallWinRate: 80.0,      // Overall game win rate (includes doubles/triples)
    s95PerLeg: 2.5,            // High scores from singles
    s133PerLeg: 8.0,
    s170PerLeg: 25.0,
    coScore: 0.6,              // Checkouts from singles
    base: -30.0                // Adjusted base
  };

  // Calculate base index
  const baseIndex =
    coefficients.singlesWinRate * singlesWinRate +
    coefficients.legWinRate * legWinRate +
    coefficients.overallWinRate * overallWinRate +
    coefficients.s95PerLeg * s95PerLeg +
    coefficients.s133PerLeg * s133PerLeg +
    coefficients.s170PerLeg * s170PerLeg +
    coefficients.coScore * coScore +
    coefficients.base;

  // Apply reliability factor
  const adjustedIndex = baseIndex * reliabilityFactor;

  // Ensure minimum floor for active players
  const minIndex = Math.max(0, totalGamesPlayed * 1.5);

  return Math.round(Math.max(adjustedIndex, minIndex) * 10) / 10;
}

/**
 * Legacy BPI calculation for comparison/migration
 */
export function computeLegacyBpi(inputs: HslIndexInputs): number {
  const singlesWinRate = inputs.matchesPlayed > 0 ? inputs.matchesWon / inputs.matchesPlayed : 0;

  const s95Component = 20 * Math.min(1, inputs.s95 / 10);
  const s133Component = 15 * Math.min(1, inputs.s133 / 5);
  const s170Component = 15 * Math.min(1, inputs.s170 / 2);

  const checkoutComponent = inputs.matchesPlayed > 0
    ? 10 * (0.5 * inputs.co3 + 0.35 * inputs.co4 + 0.15 * inputs.co5) / Math.max(1, inputs.matchesPlayed)
    : 0;

  const bpi = 60 * singlesWinRate + s95Component + s133Component + s170Component + checkoutComponent;

  return Math.round(bpi * 100) / 100;
}