type CacheEntry<T> = {
  expiry: number;
  value: T;
};

const globalCache = globalThis as typeof globalThis & {
  __terminalCache?: Map<string, CacheEntry<unknown>>;
};

const cache = globalCache.__terminalCache ?? new Map<string, CacheEntry<unknown>>();
globalCache.__terminalCache = cache;

export async function withCache<T>(key: string, ttlMs: number, factory: () => Promise<T>) {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (hit && hit.expiry > now) {
    return hit.value;
  }

  const value = await factory();
  cache.set(key, {
    value,
    expiry: now + ttlMs
  });
  return value;
}

