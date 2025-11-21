/**
 * Server-side session store for active poker hands
 *
 * SECURITY NOTES:
 * - This store keeps the full shuffled deck secret from the client
 * - Client only sees the 5 cards they are dealt
 * - On draw, server uses the stored deck to deal replacement cards
 * - This prevents client from knowing or manipulating future cards
 * - Sessions are stored in-memory (can be swapped to Redis later)
 * - Sessions expire after 1 hour to prevent memory leaks
 * - Completed hands cannot be replayed (prevents replay attacks)
 */

import type { ServerHandSession } from '../types';

/**
 * In-memory store for active hand sessions
 * Key: handId
 * Value: ServerHandSession
 *
 * PRODUCTION NOTE: Replace with Redis for multi-server deployments
 * Redis.set(handId, JSON.stringify(session), 'EX', 3600)
 *
 * DEVELOPMENT NOTE: Uses globalThis to persist across Next.js hot reloads
 */

// Persist sessions across hot reloads in development
const globalForSessions = globalThis as unknown as {
  sessions: Map<string, ServerHandSession> | undefined;
};

const sessions = globalForSessions.sessions ?? new Map<string, ServerHandSession>();

if (process.env.NODE_ENV !== 'production') {
  globalForSessions.sessions = sessions;
}

/**
 * Session expiration time (1 hour in milliseconds)
 */
const SESSION_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Stores a new hand session
 *
 * @param session - The hand session to store
 */
export function storeSession(session: ServerHandSession): void {
  sessions.set(session.handId, session);
  console.log(`[SessionStore] Stored session ${session.handId}, total sessions: ${sessions.size}`);

  // Schedule cleanup after expiry
  setTimeout(() => {
    deleteSession(session.handId);
  }, SESSION_EXPIRY_MS);
}

/**
 * Retrieves a hand session by ID
 *
 * SECURITY: Validates that session exists and is not expired
 *
 * @param handId - The hand ID to retrieve
 * @returns The session or null if not found/expired
 */
export function getSession(handId: string): ServerHandSession | null {
  console.log(`[SessionStore] Getting session ${handId}, total sessions: ${sessions.size}`);
  const session = sessions.get(handId);

  if (!session) {
    console.log(`[SessionStore] Session ${handId} not found`);
    return null;
  }

  // Check if session has expired
  const age = Date.now() - session.timestamp;
  if (age > SESSION_EXPIRY_MS) {
    console.log(`[SessionStore] Session ${handId} expired (age: ${age}ms)`);
    deleteSession(handId);
    return null;
  }

  console.log(`[SessionStore] Session ${handId} retrieved successfully`);
  return session;
}

/**
 * Updates a session (used after draw to mark as completed)
 *
 * @param handId - The hand ID to update
 * @param updates - Partial session updates
 */
export function updateSession(
  handId: string,
  updates: Partial<ServerHandSession>
): void {
  const session = sessions.get(handId);
  if (session) {
    sessions.set(handId, { ...session, ...updates });
  }
}

/**
 * Deletes a session
 *
 * @param handId - The hand ID to delete
 */
export function deleteSession(handId: string): void {
  sessions.delete(handId);
}

/**
 * Validates that a session can be used for drawing
 *
 * SECURITY CHECKS:
 * - Session must exist
 * - Session must not be completed (prevents replay)
 * - Session must not be expired
 *
 * @param handId - The hand ID to validate
 * @returns Error message if invalid, null if valid
 */
export function validateSession(handId: string): string | null {
  const session = getSession(handId);

  if (!session) {
    return 'Invalid or expired hand session';
  }

  if (session.completed) {
    return 'Hand already completed - cannot replay';
  }

  return null;
}

/**
 * Cleans up expired sessions (can be called periodically)
 * In production, this would be handled by Redis TTL
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [handId, session] of sessions.entries()) {
    const age = now - session.timestamp;
    if (age > SESSION_EXPIRY_MS) {
      sessions.delete(handId);
    }
  }
}

/**
 * Gets the current number of active sessions (for monitoring)
 */
export function getActiveSessionCount(): number {
  return sessions.size;
}
