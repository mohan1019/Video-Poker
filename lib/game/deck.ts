/**
 * Deck generation and manipulation
 * All shuffling is done server-side with cryptographic randomness
 */

import { randomInt } from 'crypto';
import type { Card, Suit, Rank } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * Creates a standard 52-card deck in order
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  let idCounter = 0;

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}-${idCounter++}`,
      });
    }
  }

  return deck;
}

/**
 * Fisher-Yates shuffle using Node.js crypto.randomInt for CSPRNG
 * This is cryptographically secure and tamper-proof
 *
 * SECURITY: Uses crypto.randomInt which provides cryptographically strong
 * random numbers from the operating system's CSPRNG
 *
 * @param deck - The deck to shuffle (mutates in place)
 * @returns The shuffled deck
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const deckCopy = [...deck];

  // Fisher-Yates shuffle algorithm
  for (let i = deckCopy.length - 1; i > 0; i--) {
    // Generate cryptographically secure random index from 0 to i (inclusive)
    const j = randomInt(0, i + 1);

    // Swap elements
    [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
  }

  return deckCopy;
}

/**
 * Seeded shuffle using a seed string for provably fair gaming
 * Converts seed into a deterministic sequence of random numbers
 *
 * PROVABLY FAIR: Given the same seed, this will always produce the same shuffle
 * This allows players to verify the shuffle was not manipulated after they made decisions
 *
 * @param deck - The deck to shuffle
 * @param seed - The seed string (should be cryptographically random)
 * @returns The shuffled deck
 */
export function seededShuffleDeck(deck: Card[], seed: string): Card[] {
  const deckCopy = [...deck];

  // Create a simple but effective PRNG from the seed
  // Using a multiplicative congruential generator
  let seedNum = 0;
  for (let i = 0; i < seed.length; i++) {
    seedNum = ((seedNum << 5) - seedNum + seed.charCodeAt(i)) | 0;
  }

  // Make sure seed is positive
  seedNum = Math.abs(seedNum);

  // Fisher-Yates with seeded random
  for (let i = deckCopy.length - 1; i > 0; i--) {
    // Generate pseudo-random number deterministically from seed
    seedNum = (seedNum * 1103515245 + 12345) & 0x7fffffff;
    const j = seedNum % (i + 1);

    // Swap elements
    [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
  }

  return deckCopy;
}

/**
 * Gets the rank value for hand evaluation
 */
export function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return values[rank];
}
