# Deploying to Vercel

## Prerequisites

The app builds successfully for production, but requires external storage for sessions.

## Session Storage Issue

The current implementation uses in-memory sessions stored in a JavaScript Map. This works fine for local development but **will not work on Vercel** because:

1. Vercel runs API routes as serverless functions
2. Each request may execute on a different instance
3. In-memory data is not shared between instances
4. Sessions will be lost between deal and draw

## Solution: Use Vercel KV

Vercel KV is a Redis-compatible key-value store that integrates seamlessly with Vercel deployments.

### Step 1: Install Vercel KV

```bash
npm install @vercel/kv
```

### Step 2: Set up Vercel KV in Dashboard

1. Go to your Vercel project dashboard
2. Navigate to Storage tab
3. Create a new KV store
4. Vercel will automatically add environment variables

### Step 3: Update Session Store

Replace the contents of `lib/game/sessionStore.ts`:

```typescript
import { kv } from '@vercel/kv';
import type { ServerHandSession } from '../types';

const SESSION_EXPIRY_SECONDS = 3600; // 1 hour

export async function storeSession(session: ServerHandSession): Promise<void> {
  await kv.set(`session:${session.handId}`, JSON.stringify(session), {
    ex: SESSION_EXPIRY_SECONDS,
  });
}

export async function getSession(handId: string): Promise<ServerHandSession | null> {
  const data = await kv.get<string>(`session:${handId}`);
  if (!data) return null;

  try {
    return JSON.parse(data) as ServerHandSession;
  } catch {
    return null;
  }
}

export async function updateSession(
  handId: string,
  updates: Partial<ServerHandSession>
): Promise<void> {
  const session = await getSession(handId);
  if (session) {
    await storeSession({ ...session, ...updates });
  }
}

export async function deleteSession(handId: string): Promise<void> {
  await kv.del(`session:${handId}`);
}

export function validateSession(handId: string): string | null {
  // Validation logic remains the same, but now async
  // You'll need to refactor the API routes to handle this
  return null; // Placeholder
}

export async function getActiveSessionCount(): Promise<number> {
  const keys = await kv.keys('session:*');
  return keys.length;
}

export async function cleanupExpiredSessions(): Promise<void> {
  // KV automatically expires sessions, no manual cleanup needed
}
```

### Step 4: Update API Routes to Async

Both `/api/deal/route.ts` and `/api/draw/route.ts` need to be updated to use async session functions:

```typescript
// Example for deal route
const session = await getSession(handId); // Add await
await storeSession(newSession); // Add await
```

### Step 5: Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## Alternative: Use Upstash Redis

If you don't want to use Vercel KV, you can use Upstash Redis (also Redis-compatible):

1. Sign up at https://upstash.com
2. Create a Redis database
3. Get your connection URL and token
4. Add to `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=your-url
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```
5. Use `@upstash/redis` package instead of `@vercel/kv`

## Testing Locally with KV

To test with Vercel KV locally:

1. Run `vercel env pull .env.local` to get KV credentials
2. Restart your dev server
3. The app will use the remote KV store

## Deployment Checklist

- [ ] Install `@vercel/kv` package
- [ ] Create Vercel KV store in dashboard
- [ ] Update `lib/game/sessionStore.ts` with KV implementation
- [ ] Update API routes to await async session functions
- [ ] Test locally with `vercel dev`
- [ ] Deploy with `vercel --prod`
- [ ] Test deal and draw functionality
- [ ] Verify sessions persist between requests

## Environment Variables

No manual environment variables needed if using Vercel KV - they're added automatically when you create the KV store in the dashboard.

For Upstash or other Redis providers:
```
REDIS_URL=your-redis-url
REDIS_TOKEN=your-token (if required)
```

## Performance Considerations

- KV operations add ~10-50ms latency per request
- Sessions auto-expire after 1 hour (no cleanup needed)
- KV is globally distributed for fast access
- No cold start issues with Redis connections

## Cost

Vercel KV free tier includes:
- 256 MB storage
- 100,000 commands per month
- More than enough for development and small-scale production

## Troubleshooting

**"Session not found" errors after deployment**
- Make sure KV environment variables are set
- Check that you're awaiting all session operations
- Verify KV store is created and linked to project

**Slow response times**
- Check if you're in a supported region
- Consider using Vercel's Edge Functions for lower latency
- Monitor KV usage in Vercel dashboard

**Development vs Production**
- Use `vercel dev` instead of `npm run dev` to test with real KV
- Or keep in-memory storage for dev, KV for production using env check
