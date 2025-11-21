/**
 * Core type definitions for Video Poker game
 */

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // Unique identifier for React keys
}

export type HandRank =
  | 'ROYAL_FLUSH'
  | 'STRAIGHT_FLUSH'
  | 'FOUR_OF_A_KIND'
  | 'FULL_HOUSE'
  | 'FLUSH'
  | 'STRAIGHT'
  | 'THREE_OF_A_KIND'
  | 'TWO_PAIR'
  | 'JACKS_OR_BETTER'
  | 'NOTHING';

export interface HandEvaluation {
  rank: HandRank;
  multiplier: number;
  payout: number;
  winningCardIndices: number[];
}

export interface GameState {
  balance: number;
  bet: number;
  hand: Card[];
  held: boolean[];
  phase: 'BETTING' | 'DEALT' | 'DRAWN';
  lastResult: HandEvaluation | null;
  handId: string | null;
  seedCommitment: string | null; // SHA-256 hash of seed for provably fair
}

export interface DealResponse {
  handId: string;
  hand: Card[];
  balance: number;
  seedCommitment: string;
}

export interface DrawResponse {
  hand: Card[];
  evaluation: HandEvaluation;
  balance: number;
  seed: string; // Revealed after hand completes
  nonce: number;
}

/**
 * Server-side session data (never sent to client until hand is complete)
 */
export interface ServerHandSession {
  handId: string;
  fullDeck: Card[]; // The full shuffled deck
  dealtCards: Card[]; // The initial 5 cards
  nextCardIndex: number; // Position in deck for next draw
  bet: number;
  seed: string; // Secret seed
  nonce: number; // Nonce for this hand
  timestamp: number;
  completed: boolean;
}
