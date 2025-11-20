import { computeHslIndex, computeUsoIndex, computeLegacyBpi, type HslIndexInputs, type UsoInputs } from './uso-index';

export interface PlayerBPIStats {
  totalGamesPlayed?: number;
  totalGamesWon?: number;
  singlesPlayed: number;
  singlesWon: number;
  legsWon: number;
  legsLost: number;
  S95: number;
  S133: number;
  S170: number;
  CO3: number;
  CO4: number;
  CO5: number;
  CO6: number;
}

/**
 * Legacy BPI calculation - kept for compatibility
 */
export function calculateBPI(stats: PlayerBPIStats): number {
  const inputs: HslIndexInputs = {
    matchesPlayed: stats.singlesPlayed,
    matchesWon: stats.singlesWon,
    legsWon: stats.legsWon,
    legsLost: stats.legsLost,
    s95: stats.S95,
    s133: stats.S133,
    s170: stats.S170,
    co3: stats.CO3,
    co4: stats.CO4,
    co5: stats.CO5,
    co6: stats.CO6
  };

  return computeLegacyBpi(inputs);
}

/**
 * New HSL Index - reliability-weighted performance index
 * This is the main ranking index for players
 * Now includes all games (singles, doubles, triples) with singles weighted more heavily
 */
export function calculateHSLIndex(stats: PlayerBPIStats): number {
  const inputs: HslIndexInputs = {
    matchesPlayed: stats.singlesPlayed,
    matchesWon: stats.singlesWon,
    totalGamesPlayed: stats.totalGamesPlayed,
    totalGamesWon: stats.totalGamesWon,
    legsWon: stats.legsWon,
    legsLost: stats.legsLost,
    s95: stats.S95,
    s133: stats.S133,
    s170: stats.S170,
    co3: stats.CO3,
    co4: stats.CO4,
    co5: stats.CO5,
    co6: stats.CO6
  };

  return computeHslIndex(inputs);
}

/**
 * UŠO Index - pure implementation for comparison
 */
export function calculateUSOIndex(stats: PlayerBPIStats): number {
  const totalLegs = stats.legsWon + stats.legsLost;

  const inputs: UsoInputs = {
    matchesPlayed: stats.singlesPlayed,
    matchesWon: stats.singlesWon,
    legsWon: stats.legsWon,
    legsLost: stats.legsLost,
    h95PerLeg: totalLegs > 0 ? stats.S95 / totalLegs : 0,
    h133PerLeg: totalLegs > 0 ? stats.S133 / totalLegs : 0,
    h170PerLeg: totalLegs > 0 ? stats.S170 / totalLegs : 0,
    co3: stats.CO3,
    co4: stats.CO4,
    co5: stats.CO5,
    co6: stats.CO6
  };

  return computeUsoIndex(inputs);
}