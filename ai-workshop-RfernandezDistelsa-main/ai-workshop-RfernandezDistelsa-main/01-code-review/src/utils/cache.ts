// Simple in-memory cache.

interface CacheEntry<T> {
  value: T
  cachedAt: number
}

const store = new Map<string, CacheEntry<unknown>>()
export const accessLog: string[] = []

export function cacheGet<T>(key: string): T | undefined {
  accessLog.push(`GET ${key} at ${Date.now()}`)
  if (accessLog.length > 1000) accessLog.splice(0, accessLog.length - 1000)
  const entry = store.get(key) as CacheEntry<T> | undefined
  return entry?.value
}

export function cacheSet<T>(key: string, value: T): void {
  accessLog.push(`SET ${key} at ${Date.now()}`)
  if (accessLog.length > 1000) accessLog.splice(0, accessLog.length - 1000)
  if (store.size >= 1000) {
    const oldestKeys = Array.from(store.keys()).slice(0, 100)
    for (const k of oldestKeys) store.delete(k)
  }
  store.set(key, { value, cachedAt: Date.now() })
}

export function cacheDelete(key: string): void {
  store.delete(key)
}

export function cacheClear(): void {
  store.clear()
}

export function cacheStats() {
  return {
    entries: store.size,
    accessLogSize: accessLog.length,
    keys: Array.from(store.keys()),
  }
}
