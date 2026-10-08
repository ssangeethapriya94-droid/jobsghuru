// Server-side AI request tracker & rate-limiting monitor
interface AIUsageLog {
  timestamp: Date;
  userId?: string;
  ip?: string;
  query: string;
  intent: string;
  resultsCount: number;
}

const memoryLogs: AIUsageLog[] = [];
const rateLimitMap: Map<string, { count: number; resetAt: number }> = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP/user

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

export function logAIUsage(log: AIUsageLog) {
  memoryLogs.push(log);
  if (memoryLogs.length > 500) {
    memoryLogs.shift();
  }
}

export function getAIUsageStats() {
  return {
    totalRequests: memoryLogs.length,
    recentLogs: memoryLogs.slice(-10),
  };
}
