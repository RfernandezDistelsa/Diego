// Shared in-memory state. Re-imported across modules; intentionally module-scoped.
export const recentSearches: string[] = []

export const books: any[] = []

export let nextBookId = 100
export function bumpBookId(): number {
  return nextBookId++
}
