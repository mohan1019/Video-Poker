/**
 * /api/deal - Server-side dealing logic
 *
 * SECURITY & FAIRNESS:
 * 1. Generates cryptographically random seed and nonce
 * 2. Creates SHA-256 commitment hash (sent to client BEFORE dealing)
 * 3. Uses seed+nonce to deterministically shuffle a full 52-card deck
 * 4. Stores full deck server-side in session
 * 5. Sends only first 5 cards to client
 * 6. Deducts bet from balance
 * 7. Session is stored with timestamp and marked as incomplete
 *
 * CLIENT RECEIVES:
 * - handId (unique session identifier)
 * - 5 dealt cards
 * - seedCommitment (hash for verification)
 * - updated balance
 *
 * CLIENT DOES NOT RECEIVE:
 * - Full deck
 * - Remaining 47 cards
 * - Actual seed (revealed only after hand completes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDeck, seededShuffleDeck } from '@/lib/game/deck';
import {
  generateSeed,
  generateNonce,
  createSeedCommitment,
  combineSeedAndNonce,
  generateHandId,
} from '@/lib/game/provablyFair';
import { storeSession } from '@/lib/game/sessionStore';
import type { DealResponse, ServerHandSession } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bet, balance } = body;

    // Validate bet amount
    if (!bet || bet < 1 || bet > 5 || !Number.isInteger(bet)) {
      return NextResponse.json(
        { error: 'Invalid bet amount. Must be 1-5 credits.' },
        { status: 400 }
      );
    }

    // Validate balance
    if (!balance || balance < bet) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // STEP 1: Generate provably fair seed and nonce
    const seed = generateSeed();
    const nonce = generateNonce();
    const shuffleSeed = combineSeedAndNonce(seed, nonce);

    // STEP 2: Create commitment BEFORE shuffling
    // This proves we're not changing the deck after client sees it
    const seedCommitment = createSeedCommitment(seed, nonce);

    // STEP 3: Create and shuffle deck using the seed
    const deck = createDeck();
    const shuffledDeck = seededShuffleDeck(deck, shuffleSeed);

    // STEP 4: Deal first 5 cards to player
    const dealtCards = shuffledDeck.slice(0, 5);

    // STEP 5: Generate unique hand ID
    const handId = generateHandId();

    // STEP 6: Store session server-side with full deck
    // This deck is secret - client only knows their 5 cards
    const session: ServerHandSession = {
      handId,
      fullDeck: shuffledDeck,
      dealtCards,
      nextCardIndex: 5, // Next card to deal is at index 5
      bet,
      seed,
      nonce,
      timestamp: Date.now(),
      completed: false,
    };

    await storeSession(session);

    // STEP 7: Calculate new balance after bet
    const newBalance = balance - bet;

    // STEP 8: Send response to client
    // IMPORTANT: We do NOT send the full deck or seed yet
    const response: DealResponse = {
      handId,
      hand: dealtCards,
      balance: newBalance,
      seedCommitment, // Hash only - proves fairness later
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Deal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
