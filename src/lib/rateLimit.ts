type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __yaskravaRateLimitStore?: Map<string, RateLimitEntry>;
};

function getStore() {
  if (!globalStore.__yaskravaRateLimitStore) {
    globalStore.__yaskravaRateLimitStore = new Map();
  }

  return globalStore.__yaskravaRateLimitStore;
}

export function assertRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const store = getStore();
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (current.count >= limit) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }

  current.count += 1;
  store.set(key, current);
}
