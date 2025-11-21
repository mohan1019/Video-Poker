/**
 * Provably Fair Gaming Implementation
 *
 * This module implements a cryptographic commitment scheme to ensure
 * that the game outcome cannot be manipulated after the player makes decisions.
 *
 * PROCESS:
 * 1. Server generates a cryptographically random seed S and nonce N
 * 2. Server creates commitment: SHA-256(S + N)
 * 3. Server sends commitment to client BEFORE dealing cards
 * 4. Server uses S+N to deterministically shuffle the deck
 * 5. Client plays the hand (holds cards, draws)
 * 6. After hand completes, server reveals S and N
 * 7. Client can verify: SHA-256(S + N) matches original commitment
 * 8. Client can verify the shuffle using the revealed seed
 *
 * This proves the server did not change the deck after seeing player decisions.
 */

import { randomBytes, createHash } from 'crypto';

/**
 * Generates a cryptographically secure random seed
 * Uses 32 bytes (256 bits) of entropy from Node's CSPRNG
 *
 * @returns Hex-encoded random seed
 */
export function generateSeed(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generates a random nonce (number used once)
 * Used to ensure each hand has a unique seed even if same base seed is used
 *
 * @returns Random integer nonce
 */
export function generateNonce(): number {
  // Generate a random 32-bit integer
  return randomBytes(4).readUInt32BE(0);
}

/**
 * Creates a SHA-256 commitment hash of seed + nonce
 * This hash is sent to the client before dealing
 *
 * SECURITY: SHA-256 is a one-way function - given the hash,
 * it's computationally infeasible to determine the seed.
 * This prevents the server from choosing a favorable seed after
 * seeing player decisions.
 *
 * @param seed - The secret seed
 * @param nonce - The unique nonce for this hand
 * @returns SHA-256 hash as hex string
 */
export function createSeedCommitment(seed: string, nonce: number): string {
  const combined = `${seed}:${nonce}`;
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Combines seed and nonce to create the shuffle seed
 * This is the actual seed used for the deterministic shuffle
 *
 * @param seed - The secret seed
 * @param nonce - The unique nonce
 * @returns Combined seed string
 */
export function combineSeedAndNonce(seed: string, nonce: number): string {
  return `${seed}:${nonce}`;
}

/**
 * Verifies that a revealed seed matches the original commitment
 * Clients can use this to verify the game was fair
 *
 * @param seed - The revealed seed
 * @param nonce - The revealed nonce
 * @param commitment - The original commitment hash
 * @returns True if seed matches commitment
 */
export function verifySeedCommitment(
  seed: string,
  nonce: number,
  commitment: string
): boolean {
  const calculatedCommitment = createSeedCommitment(seed, nonce);
  return calculatedCommitment === commitment;
}

/**
 * Generates a unique hand ID
 * Format: timestamp-randomhex
 *
 * @returns Unique hand identifier
 */
export function generateHandId(): string {
  const timestamp = Date.now();
  const random = randomBytes(8).toString('hex');
  return `${timestamp}-${random}`;
}
