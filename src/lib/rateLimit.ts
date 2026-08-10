type RateLimitRecord = {
  count: number;
  resetTime: number;
};

type RateLimitStore = Map<string, RateLimitRecord>;

const rateLimitGlobal = globalThis as typeof globalThis & {
  __rees52RateLimitStore?: RateLimitStore;
};

function getStore(): RateLimitStore {
  rateLimitGlobal.__rees52RateLimitStore ??= new Map<string, RateLimitRecord>();
  return rateLimitGlobal.__rees52RateLimitStore;
}

// Periodically clean up expired keys to prevent memory leaks
function cleanupExpiredKeys(now: number) {
  const store = getStore();
  if (store.size > 5000) {
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }
}

export async function getClientIp(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const reqHeaders = await headers();
    const xForwardedFor = reqHeaders.get("x-forwarded-for");
    if (xForwardedFor) {
      return xForwardedFor.split(",")[0].trim();
    }
    const xRealIp = reqHeaders.get("x-real-ip");
    if (xRealIp) {
      return xRealIp.trim();
    }
    const cfConnectingIp = reqHeaders.get("cf-connecting-ip");
    if (cfConnectingIp) {
      return cfConnectingIp.trim();
    }
  } catch {
    // If headers() is called outside request context, fallback to default
  }
  return "127.0.0.1";
}

export type RateLimitOptions = {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Identifier suffix (e.g. action name like 'login', 'otp', 'review', 'ai') */
  action: string;
  /** Optional key (e.g. user email or IP). If omitted, client IP is resolved automatically */
  key?: string;
};

export type RateLimitResult = {
  success: boolean;
  error?: string;
  remaining: number;
  resetInSeconds: number;
};

/**
 * Checks and enforces sliding window rate limit for sensitive server actions.
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { limit, windowSeconds, action, key } = options;
  const now = Date.now();
  cleanupExpiredKeys(now);

  const identifier = key ? key.trim().toLowerCase() : await getClientIp();
  const storeKey = `${action}:${identifier}`;
  const windowMs = windowSeconds * 1000;

  const store = getStore();
  const record = store.get(storeKey);

  if (!record || now > record.resetTime) {
    store.set(storeKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetInSeconds: windowSeconds,
    };
  }

  if (record.count >= limit) {
    const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      error: `Too many requests. Please wait ${resetInSeconds} second${resetInSeconds === 1 ? "" : "s"} before trying again.`,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.count += 1;
  const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);

  return {
    success: true,
    remaining: limit - record.count,
    resetInSeconds,
  };
}
