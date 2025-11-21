/**
 * /api/draw - Server-side draw logic
 *
 * SECURITY & FAIRNESS:
 * 1. Validates handId and session
 * 2. Prevents replay attacks (hand can only be completed once)
 * 3. Validates hold array (must be 5 booleans)
 * 4. Retrieves stored deck from session
 * 5. Replaces non-held cards with next cards from stored deck
 * 6. Evaluates final hand
 * 7. Calculates payout
 * 8. Marks session as completed
 * 9. Reveals seed for provably fair verification
 *
 * CLIENT RECEIVES:
 * - Final 5 cards
 * - Hand evaluation and payout
 * - Updated balance
 * - Revealed seed and nonce (for verification)
 *
 * ANTI-TAMPER MEASURES:
 * - Session must exist and not be expired
 * - Session must not be already completed (no replay)
 * - Hold array must be exactly 5 booleans
 * - Uses stored deck (client cannot influence remaining cards)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession, validateSession } from '@/lib/game/sessionStore';
import { evaluateHand, getWinningCardIndices } from '@/lib/game/handEvaluator';
import { calculatePayout } from '@/lib/game/paytable';
import type { DrawResponse, Card } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handId, held, balance } = body;

    console.log('Draw request received:', { handId, held, balance });

    // STEP 1: Validate request
    if (!handId || typeof handId !== 'string') {
      console.error('Invalid handId:', handId);
      return NextResponse.json(
        { error: 'Invalid hand ID' },
        { status: 400 }
      );
    }

    if (!Array.isArray(held) || held.length !== 5) {
      console.error('Invalid held array:', held);
      return NextResponse.json(
        { error: 'Hold array must contain exactly 5 boolean values' },
        { status: 400 }
      );
    }

    if (!held.every(h => typeof h === 'boolean')) {
      console.error('Held array contains non-boolean values:', held);
      return NextResponse.json(
        { error: 'All hold values must be boolean' },
        { status: 400 }
      );
    }

    // STEP 2: Validate session (anti-tamper checks)
    const validationError = validateSession(handId);
    if (validationError) {
      console.error('Session validation failed:', validationError, 'handId:', handId);
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // STEP 3: Retrieve session (contains the secret deck)
    const session = getSession(handId);
    if (!session) {
      console.error('Session not found for handId:', handId);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('Session retrieved successfully, nextCardIndex:', session.nextCardIndex);

    // STEP 4: Build final hand by replacing non-held cards
    // This uses the pre-shuffled deck stored server-side
    // Client has no influence over which cards are drawn
    const finalHand: Card[] = [...session.dealtCards];
    let nextCardIndex = session.nextCardIndex;

    for (let i = 0; i < 5; i++) {
      if (!held[i]) {
        // Replace this card with next card from deck
        if (nextCardIndex >= session.fullDeck.length) {
          return NextResponse.json(
            { error: 'Not enough cards in deck' },
            { status: 500 }
          );
        }
        finalHand[i] = session.fullDeck[nextCardIndex];
        nextCardIndex++;
      }
    }

    // STEP 5: Evaluate the final hand
    console.log('Evaluating hand:', finalHand.map(c => `${c.rank}${c.suit[0]}`).join(' '));
    const handRank = evaluateHand(finalHand);
    const winningCardIndices = getWinningCardIndices(finalHand, handRank);
    const evaluation = {
      ...calculatePayout(handRank, session.bet),
      winningCardIndices,
    };
    console.log('Hand evaluation:', handRank, 'payout:', evaluation.payout, 'winning cards:', winningCardIndices);

    // STEP 6: Calculate new balance
    const newBalance = balance + evaluation.payout;

    // STEP 7: Mark session as completed (prevents replay)
    updateSession(handId, { completed: true });

    // STEP 8: Reveal seed for provably fair verification
    // Client can now verify that:
    // - SHA-256(seed:nonce) matches the original commitment
    // - Using seed:nonce to shuffle produces the same deck
    const response: DrawResponse = {
      hand: finalHand,
      evaluation,
      balance: newBalance,
      seed: session.seed,
      nonce: session.nonce,
    };

    console.log('Draw completed successfully');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Draw error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
