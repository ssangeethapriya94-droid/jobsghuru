import { db } from "@/lib/db";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory cache for fast local access
const localRateLimitMap = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Universal rate limiter supporting both synchronous in-memory checks
 * and asynchronous DB-backed RateLimitBucket synchronization for multi-instance deployments.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = localRateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    localRateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    // Fire-and-forget sync to DB
    syncToDb(key, 1, new Date(now + windowMs)).catch(() => {});
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSec: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  syncToDb(key, record.count, new Date(record.resetAt)).catch(() => {});
  return { allowed: true, remaining: maxAttempts - record.count, retryAfterSec: 0 };
}

/**
 * Async rate limiter reading directly from the shared database table (RateLimitBucket)
 */
export async function checkRateLimitAsync(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const now = new Date();
  try {
    const bucket = await db.rateLimitBucket.findUnique({
      where: { key },
    });

    if (!bucket || bucket.resetAt <= now) {
      const resetAt = new Date(now.getTime() + windowMs);
      await db.rateLimitBucket.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      localRateLimitMap.set(key, { count: 1, resetAt: resetAt.getTime() });
      return { allowed: true, remaining: maxAttempts - 1, retryAfterSec: 0 };
    }

    if (bucket.count >= maxAttempts) {
      const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000));
      return { allowed: false, remaining: 0, retryAfterSec };
    }

    const updated = await db.rateLimitBucket.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    localRateLimitMap.set(key, { count: updated.count, resetAt: updated.resetAt.getTime() });
    return { allowed: true, remaining: maxAttempts - updated.count, retryAfterSec: 0 };
  } catch (err) {
    // Fallback to local in-memory limiter on any DB error
    return checkRateLimit(key, maxAttempts, windowMs);
  }
}

async function syncToDb(key: string, count: number, resetAt: Date) {
  try {
    await db.rateLimitBucket.upsert({
      where: { key },
      create: { key, count, resetAt },
      update: { count, resetAt },
    });
  } catch {}
}

export async function resetRateLimitAsync(key: string): Promise<void> {
  localRateLimitMap.delete(key);
  try {
    await db.rateLimitBucket.delete({ where: { key } }).catch(() => {});
  } catch {}
}

export function resetRateLimit(key: string): void {
  localRateLimitMap.delete(key);
  resetRateLimitAsync(key).catch(() => {});
}
