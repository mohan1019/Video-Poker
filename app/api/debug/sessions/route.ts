/**
 * Debug endpoint to check session store status
 * Only available in development mode
 */

import { NextResponse } from 'next/server';
import { getActiveSessionCount } from '@/lib/game/sessionStore';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    activeSessionCount: getActiveSessionCount(),
    timestamp: new Date().toISOString(),
  });
}
