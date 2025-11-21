/**
 * Video Poker Strategy Engine
 * Calculates optimal plays for Jacks or Better 9/6
 */

import type { Card, Rank, Suit, HandRank } from '@/lib/types';
import { evaluateHand } from '@/lib/game/handEvaluator';

// 9/6 Jacks or Better Pay Table (for 1 coin)
const PAY_TABLE: Record<HandRank, number> = {
  ROYAL_FLUSH: 800,
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

export interface HoldStrategy {
  holdIndices: number[];
  holdCards: string[];
  ev: number;
  evPercent: number;
  mostLikelyOutcome: string;
  explanation: string;
}

// Parse card string like "AS" to Card object
function parseCard(cardStr: string): Card {
  const rank = cardStr.slice(0, -1) as Rank;
  const suitChar = cardStr.slice(-1);
  const suitMap: Record<string, Suit> = {
    'H': 'hearts',
    'D': 'diamonds',
    'C': 'clubs',
    'S': 'spades',
  };
  const suit = suitMap[suitChar];
  return { rank, suit, id: cardStr };
}

// Convert Card object to string like "AS"
function cardToString(card: Card): string {
  const suitMap: Record<Suit, string> = {
    hearts: 'H',
    diamonds: 'D',
    clubs: 'C',
    spades: 'S',
  };
  return card.rank + suitMap[card.suit];
}

// Generate full 52-card deck
function generateDeck(): Card[] {
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        rank,
        suit,
        id: `${rank}${suit[0]}`,
      });
    }
  }

  return deck;
}

// Get all combinations of k items from array
function* combinations<T>(array: T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  if (k > array.length) return;

  for (let i = 0; i <= array.length - k; i++) {
    for (const combo of combinations(array.slice(i + 1), k - 1)) {
      yield [array[i], ...combo];
    }
  }
}

// Calculate EV for a specific hold pattern
function calculateEV(hand: Card[], holdIndices: number[]): {
  ev: number;
  outcomeCounts: Map<HandRank, number>;
  totalCombinations: number;
} {
  const deck = generateDeck();
  const handStrings = hand.map(cardToString);

  // Get remaining deck (exclude held cards)
  const heldCards = holdIndices.map(i => hand[i]);
  const heldStrings = new Set(heldCards.map(cardToString));
  const remainingDeck = deck.filter(card => !heldStrings.has(cardToString(card)));

  const numToDraw = 5 - holdIndices.length;

  let totalPayout = 0;
  let totalCombinations = 0;
  const outcomeCounts = new Map<HandRank, number>();

  // Initialize outcome counts
  Object.keys(PAY_TABLE).forEach(rank => {
    outcomeCounts.set(rank as HandRank, 0);
  });

  // Enumerate all possible draws
  for (const drawnCards of combinations(remainingDeck, numToDraw)) {
    // Build final hand
    const finalHand: Card[] = [];
    let drawnIndex = 0;

    for (let i = 0; i < 5; i++) {
      if (holdIndices.includes(i)) {
        finalHand.push(hand[i]);
      } else {
        finalHand.push(drawnCards[drawnIndex++]);
      }
    }

    // Evaluate hand
    const handRank = evaluateHand(finalHand);
    const payout = PAY_TABLE[handRank];

    totalPayout += payout;
    totalCombinations++;
    outcomeCounts.set(handRank, (outcomeCounts.get(handRank) || 0) + 1);
  }

  const ev = totalCombinations > 0 ? totalPayout / totalCombinations : 0;

  return { ev, outcomeCounts, totalCombinations };
}

// Determine most likely outcome from counts
function getMostLikelyOutcome(outcomeCounts: Map<HandRank, number>): HandRank {
  let maxCount = 0;
  let mostLikely: HandRank = 'NOTHING';

  outcomeCounts.forEach((count, rank) => {
    if (count > maxCount && rank !== 'NOTHING') {
      maxCount = count;
      mostLikely = rank;
    }
  });

  // If nothing else, return the most common outcome
  if (mostLikely === 'NOTHING') {
    outcomeCounts.forEach((count, rank) => {
      if (count > maxCount) {
        maxCount = count;
        mostLikely = rank;
      }
    });
  }

  return mostLikely;
}

// Get friendly name for hand rank
function getHandName(rank: HandRank): string {
  const names: Record<HandRank, string> = {
    ROYAL_FLUSH: 'Royal Flush',
    STRAIGHT_FLUSH: 'Straight Flush',
    FOUR_OF_A_KIND: 'Four of a Kind',
    FULL_HOUSE: 'Full House',
    FLUSH: 'Flush',
    STRAIGHT: 'Straight',
    THREE_OF_A_KIND: 'Three of a Kind',
    TWO_PAIR: 'Two Pair',
    JACKS_OR_BETTER: 'High Pair',
    NOTHING: 'Nothing',
  };
  return names[rank];
}

// Generate explanation for a hold strategy
function generateExplanation(
  holdIndices: number[],
  ev: number,
  mostLikely: HandRank,
  hand: Card[]
): string {
  if (holdIndices.length === 0) {
    return 'Draw 5 new cards for best chance at a winning hand';
  }

  if (holdIndices.length === 5) {
    const currentRank = evaluateHand(hand);
    return `Keep your ${getHandName(currentRank).toLowerCase()}`;
  }

  const heldCards = holdIndices.map(i => hand[i]);

  // Check for pairs
  const rankCounts = new Map<Rank, number>();
  heldCards.forEach(card => {
    rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
  });

  const pairs = Array.from(rankCounts.entries()).filter(([_, count]) => count === 2);

  if (pairs.length > 0) {
    const pairRank = pairs[0][0];
    const isHighPair = ['J', 'Q', 'K', 'A'].includes(pairRank);
    if (isHighPair) {
      return `Hold high pair, draw 3 for improved hand`;
    }
    return `Hold low pair, draw 3 for potential three/four of a kind`;
  }

  // Check for flush draw
  const suits = new Set(heldCards.map(c => c.suit));
  if (suits.size === 1 && holdIndices.length === 4) {
    return `Hold 4-card flush draw for 19.1% chance of flush`;
  }

  // Check for straight draw
  if (holdIndices.length === 4) {
    return `Hold straight draw or high cards for multiple winning paths`;
  }

  // High cards
  const highCards = heldCards.filter(c => ['J', 'Q', 'K', 'A'].includes(c.rank));
  if (highCards.length === holdIndices.length) {
    return `Hold high cards for pair potential`;
  }

  return `Draw ${5 - holdIndices.length} cards for ${getHandName(mostLikely).toLowerCase()}`;
}

/**
 * Main strategy engine function
 * Returns top 3 optimal hold strategies for a given hand
 */
export function analyzeHand(handInput: string[] | Card[]): HoldStrategy[] {
  // Parse input
  const hand: Card[] = typeof handInput[0] === 'string'
    ? (handInput as string[]).map(parseCard)
    : handInput as Card[];

  const strategies: HoldStrategy[] = [];

  // Generate all 32 hold combinations (2^5)
  for (let mask = 0; mask < 32; mask++) {
    const holdIndices: number[] = [];

    for (let i = 0; i < 5; i++) {
      if (mask & (1 << i)) {
        holdIndices.push(i);
      }
    }

    // Calculate EV for this hold pattern
    const { ev, outcomeCounts, totalCombinations } = calculateEV(hand, holdIndices);
    const mostLikely = getMostLikelyOutcome(outcomeCounts);
    const holdCards = holdIndices.map(i => cardToString(hand[i]));
    const explanation = generateExplanation(holdIndices, ev, mostLikely, hand);

    strategies.push({
      holdIndices,
      holdCards,
      ev: parseFloat(ev.toFixed(4)),
      evPercent: parseFloat((ev * 100).toFixed(2)),
      mostLikelyOutcome: getHandName(mostLikely),
      explanation,
    });
  }

  // Sort by EV descending and return top 3
  strategies.sort((a, b) => b.ev - a.ev);

  return strategies.slice(0, 3);
}
