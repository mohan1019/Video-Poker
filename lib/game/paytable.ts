/**
 * Jacks or Better pay table
 * Standard 9/6 pay table (Full House pays 9x, Flush pays 6x)
 * Royal Flush pays 800x on max bet (5 credits), otherwise 250x
 */

import type { HandRank, HandEvaluation } from '../types';

/**
 * Gets the multiplier for a given hand rank and bet amount
 *
 * @param rank - The evaluated hand rank
 * @param bet - The bet amount (1-5 credits)
 * @returns The payout multiplier
 */
export function getMultiplier(rank: HandRank, bet: number): number {
  // Royal Flush has special payout on max bet
  if (rank === 'ROYAL_FLUSH' && bet === 5) {
    return 800;
  }

  const multipliers: Record<HandRank, number> = {
    ROYAL_FLUSH: 250,
    STRAIGHT_FLUSH: 50,
    FOUR_OF_A_KIND: 25,
    FULL_HOUSE: 9,
    FLUSH: 6,
    STRAIGHT: 4,
    THREE_OF_A_KIND: 3,
    TWO_PAIR: 2,
    JACKS_OR_BETTER: 1,
    NOTHING: 0,
  };

  return multipliers[rank];
}

/**
 * Calculates the full hand evaluation with payout
 *
 * @param rank - The evaluated hand rank
 * @param bet - The bet amount
 * @returns Complete evaluation with multiplier and payout
 */
export function calculatePayout(rank: HandRank, bet: number): HandEvaluation {
  const multiplier = getMultiplier(rank, bet);
  const payout = multiplier * bet;

  return {
    rank,
    multiplier,
    payout,
    winningCardIndices: [], // Will be populated by caller
  };
}

/**
 * Gets a human-readable name for a hand rank
 */
export function getHandName(rank: HandRank): string {
  const names: Record<HandRank, string> = {
    ROYAL_FLUSH: 'Royal Flush',
    STRAIGHT_FLUSH: 'Straight Flush',
    FOUR_OF_A_KIND: 'Four of a Kind',
    FULL_HOUSE: 'Full House',
    FLUSH: 'Flush',
    STRAIGHT: 'Straight',
    THREE_OF_A_KIND: 'Three of a Kind',
    TWO_PAIR: 'Two Pair',
    JACKS_OR_BETTER: 'Jacks or Better',
    NOTHING: 'No Win',
  };

  return names[rank];
}

/**
 * Returns the full pay table for display
 */
export function getPayTable(): Array<{ hand: string; payouts: number[] }> {
  return [
    { hand: 'Royal Flush', payouts: [250, 500, 750, 1000, 4000] },
    { hand: 'Straight Flush', payouts: [50, 100, 150, 200, 250] },
    { hand: 'Four of a Kind', payouts: [25, 50, 75, 100, 125] },
    { hand: 'Full House', payouts: [9, 18, 27, 36, 45] },
    { hand: 'Flush', payouts: [6, 12, 18, 24, 30] },
    { hand: 'Straight', payouts: [4, 8, 12, 16, 20] },
    { hand: 'Three of a Kind', payouts: [3, 6, 9, 12, 15] },
    { hand: 'Two Pair', payouts: [2, 4, 6, 8, 10] },
    { hand: 'Jacks or Better', payouts: [1, 2, 3, 4, 5] },
  ];
}
