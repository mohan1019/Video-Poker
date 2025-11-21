/**
 * Server-side session store for active poker hands
 *
 * SECURITY NOTES:
 * - This store keeps the full shuffled deck secret from the client
 * - Client only sees the 5 cards they are dealt
 * - On draw, server uses the stored deck to deal replacement cards
 * - This prevents client from knowing or manipulating future cards
 * - Sessions are stored in Vercel KV (production) or in-memory (development)
 * - Sessions expire after 1 hour automatically
 * - Completed hands cannot be replayed (prevents replay attacks)
 */

import type { ServerHandSession } from '../types';

/**
 * Session expiration time
 */
const SESSION_EXPIRY_SECONDS = 3600;
const SESSION_EXPIRY_MS = SESSION_EXPIRY_SECONDS * 1000;

/**
 * Check if Vercel KV is available
 */
const isKVAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

/**
 * In-memory store for local development
 */
const globalForSessions = globalThis as unknown as {
  sessions: Map<string, ServerHandSession> | undefined;
};

const sessions = globalForSessions.sessions ?? new Map<string, ServerHandSession>();

if (process.env.NODE_ENV !== 'production') {
  globalForSessions.sessions = sessions;
}

/**
 * Lazy-load KV only if environment variables are available
 */
let kv: any = null;
async function getKV() {
  if (!kv && isKVAvailable) {
    const { kv: vercelKV } = await import('@vercel/kv');
    kv = vercelKV;
  }
  return kv;
}

/**
 * Stores a new hand session
 *
 * @param session - The hand session to store
 */
export async function storeSession(session: ServerHandSession): Promise<void> {
  if (isKVAvailable) {
    // Use Vercel KV in production
    const kvStore = await getKV();
    await kvStore.set(`session:${session.handId}`, JSON.stringify(session), {
      ex: SESSION_EXPIRY_SECONDS,
    });
  } else {
    // Use in-memory storage for local development
    sessions.set(session.handId, session);

    // Schedule cleanup after expiry
    setTimeout(() => {
      sessions.delete(session.handId);
    }, SESSION_EXPIRY_MS);
  }
}

/**
 * Retrieves a hand session by ID
 *
 * SECURITY: Validates that session exists and is not expired
 *
 * @param handId - The hand ID to retrieve
 * @returns The session or null if not found/expired
 */
export async function getSession(handId: string): Promise<ServerHandSession | null> {
  if (isKVAvailable) {
    // Use Vercel KV in production
    const kvStore = await getKV();
    const data = await kvStore.get(`session:${handId}`) as string | null;

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as ServerHandSession;
    } catch {
      return null;
    }
  } else {
    // Use in-memory storage for local development
    const session = sessions.get(handId);

    if (!session) {
      return null;
    }

    // Check if session has expired
    const age = Date.now() - session.timestamp;
    if (age > SESSION_EXPIRY_MS) {
      sessions.delete(handId);
      return null;
    }

    return session;
  }
}

/**
 * Updates a session (used after draw to mark as completed)
 *
 * @param handId - The hand ID to update
 * @param updates - Partial session updates
 */
export async function updateSession(
  handId: string,
  updates: Partial<ServerHandSession>
): Promise<void> {
  const session = await getSession(handId);
  if (session) {
    await storeSession({ ...session, ...updates });
  }
}

/**
 * Deletes a session
 *
 * @param handId - The hand ID to delete
 */
export async function deleteSession(handId: string): Promise<void> {
  if (isKVAvailable) {
    const kvStore = await getKV();
    await kvStore.del(`session:${handId}`);
  } else {
    sessions.delete(handId);
  }
}

/**
 * Validates that a session can be used for drawing
 *
 * SECURITY CHECKS:
 * - Session must exist
 * - Session must not be completed (prevents replay)
 * - Session must not be expired (handled by KV TTL)
 *
 * @param handId - The hand ID to validate
 * @returns Error message if invalid, null if valid
 */
export async function validateSession(handId: string): Promise<string | null> {
  const session = await getSession(handId);

  if (!session) {
    return 'Invalid or expired hand session';
  }

  if (session.completed) {
    return 'Hand already completed - cannot replay';
  }

  return null;
}

/**
 * Cleans up expired sessions
 * With KV, sessions expire automatically via TTL - no manual cleanup needed
 */
export async function cleanupExpiredSessions(): Promise<void> {
  if (isKVAvailable) {
    // KV automatically expires sessions, no manual cleanup needed
  } else {
    // Clean up expired in-memory sessions
    const now = Date.now();
    for (const [handId, session] of sessions.entries()) {
      const age = now - session.timestamp;
      if (age > SESSION_EXPIRY_MS) {
        sessions.delete(handId);
      }
    }
  }
}

/**
 * Gets the current number of active sessions (for monitoring)
 */
export async function getActiveSessionCount(): Promise<number> {
  if (isKVAvailable) {
    const kvStore = await getKV();
    const keys = await kvStore.keys('session:*');
    return keys.length;
  } else {
    return sessions.size;
  }
}
