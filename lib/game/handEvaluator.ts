/**
 * Poker hand evaluation logic
 * Determines the rank of a 5-card poker hand
 */

import type { Card, HandRank } from '../types';
import { getRankValue } from './deck';

interface RankCount {
  [rank: string]: number;
}

/**
 * Evaluates a 5-card poker hand and returns its rank
 *
 * @param hand - Array of 5 cards
 * @returns The hand rank
 */
export function evaluateHand(hand: Card[]): HandRank {
  if (hand.length !== 5) {
    throw new Error('Hand must contain exactly 5 cards');
  }

  const isFlush = checkFlush(hand);
  const isStraight = checkStraight(hand);
  const rankCounts = getRankCounts(hand);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  // Royal Flush: A, K, Q, J, 10 of same suit
  if (isFlush && isStraight && hasRank(hand, 'A') && hasRank(hand, 'K')) {
    return 'ROYAL_FLUSH';
  }

  // Straight Flush: 5 cards in sequence, same suit
  if (isFlush && isStraight) {
    return 'STRAIGHT_FLUSH';
  }

  // Four of a Kind: 4 cards of same rank
  if (counts[0] === 4) {
    return 'FOUR_OF_A_KIND';
  }

  // Full House: 3 of a kind + pair
  if (counts[0] === 3 && counts[1] === 2) {
    return 'FULL_HOUSE';
  }

  // Flush: 5 cards of same suit
  if (isFlush) {
    return 'FLUSH';
  }

  // Straight: 5 cards in sequence
  if (isStraight) {
    return 'STRAIGHT';
  }

  // Three of a Kind: 3 cards of same rank
  if (counts[0] === 3) {
    return 'THREE_OF_A_KIND';
  }

  // Two Pair: 2 pairs
  if (counts[0] === 2 && counts[1] === 2) {
    return 'TWO_PAIR';
  }

  // Jacks or Better: Pair of J, Q, K, or A
  if (counts[0] === 2) {
    const pairRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 2);
    if (pairRank && ['J', 'Q', 'K', 'A'].includes(pairRank)) {
      return 'JACKS_OR_BETTER';
    }
  }

  return 'NOTHING';
}

/**
 * Checks if all cards are of the same suit
 */
function checkFlush(hand: Card[]): boolean {
  const firstSuit = hand[0].suit;
  return hand.every(card => card.suit === firstSuit);
}

/**
 * Checks if cards form a straight (5 consecutive ranks)
 * Handles both regular straights and the special A-2-3-4-5 straight
 */
function checkStraight(hand: Card[]): boolean {
  const values = hand.map(card => getRankValue(card.rank)).sort((a, b) => a - b);

  // Check for regular straight
  let isRegularStraight = true;
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) {
      isRegularStraight = false;
      break;
    }
  }

  if (isRegularStraight) {
    return true;
  }

  // Check for A-2-3-4-5 straight (wheel)
  const ranks = hand.map(card => card.rank).sort();
  const wheelStraight = ['2', '3', '4', '5', 'A'];
  return JSON.stringify(ranks) === JSON.stringify(wheelStraight);
}

/**
 * Counts occurrences of each rank
 */
function getRankCounts(hand: Card[]): RankCount {
  const counts: RankCount = {};
  for (const card of hand) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return counts;
}

/**
 * Checks if hand contains a specific rank
 */
function hasRank(hand: Card[], rank: string): boolean {
  return hand.some(card => card.rank === rank);
}

/**
 * Returns the indices of cards that are part of the winning combination
 */
export function getWinningCardIndices(hand: Card[], handRank: HandRank): number[] {
  if (handRank === 'NOTHING') {
    return [];
  }

  const rankCounts = getRankCounts(hand);

  // For flushes and straights, all cards are winners
  if (['ROYAL_FLUSH', 'STRAIGHT_FLUSH', 'FLUSH', 'STRAIGHT'].includes(handRank)) {
    return [0, 1, 2, 3, 4];
  }

  // For pairs, three of a kind, four of a kind, full house, two pair
  const winningIndices: number[] = [];

  if (handRank === 'FOUR_OF_A_KIND') {
    // Find the rank that appears 4 times
    const fourRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 4);
    hand.forEach((card, index) => {
      if (card.rank === fourRank) winningIndices.push(index);
    });
  } else if (handRank === 'FULL_HOUSE') {
    // All cards in full house (3 of a kind + pair)
    return [0, 1, 2, 3, 4];
  } else if (handRank === 'THREE_OF_A_KIND') {
    // Find the rank that appears 3 times
    const threeRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 3);
    hand.forEach((card, index) => {
      if (card.rank === threeRank) winningIndices.push(index);
    });
  } else if (handRank === 'TWO_PAIR') {
    // Find both pair ranks
    const pairRanks = Object.keys(rankCounts).filter(rank => rankCounts[rank] === 2);
    hand.forEach((card, index) => {
      if (pairRanks.includes(card.rank)) winningIndices.push(index);
    });
  } else if (handRank === 'JACKS_OR_BETTER') {
    // Find the pair rank (J, Q, K, or A)
    const pairRank = Object.keys(rankCounts).find(rank =>
      rankCounts[rank] === 2 && ['J', 'Q', 'K', 'A'].includes(rank)
    );
    hand.forEach((card, index) => {
      if (card.rank === pairRank) winningIndices.push(index);
    });
  }

  return winningIndices;
}
