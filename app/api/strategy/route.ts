/**
 * /api/strategy - Strategy analysis endpoint
 *
 * Accepts a 5-card hand and returns optimal hold strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeHand } from '@/lib/strategy/strategyEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hand } = body;

    // Validate input
    if (!Array.isArray(hand) || hand.length !== 5) {
      return NextResponse.json(
        { error: 'Hand must be an array of 5 cards' },
        { status: 400 }
      );
    }

    // Validate card format (if strings)
    if (typeof hand[0] === 'string') {
      const cardRegex = /^(2|3|4|5|6|7|8|9|10|J|Q|K|A)(H|D|C|S)$/;
      for (const card of hand) {
        if (!cardRegex.test(card)) {
          return NextResponse.json(
            { error: `Invalid card format: ${card}. Expected format like "AS", "KH", etc.` },
            { status: 400 }
          );
        }
      }
    }

    // Analyze hand
    const strategies = analyzeHand(hand);

    return NextResponse.json({
      success: true,
      strategies,
    });
  } catch (error) {
    console.error('Strategy analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
