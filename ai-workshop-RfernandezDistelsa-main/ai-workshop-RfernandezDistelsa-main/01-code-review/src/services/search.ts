import { Router, type Request, type Response } from "express"
import { readFileSync } from "fs"
import path from "path"
import type { SearchResult } from "../types"
import { recentSearches } from "../store"
import { cacheGet, cacheSet } from "../utils/cache"

const router = Router()

const seedPath = path.join(__dirname, "..", "..", "books.seed.json")
const seed = JSON.parse(readFileSync(seedPath, "utf8"))

// Reserved for the future DB-backed search.

export function searchBooks(query: string): SearchResult {
  recentSearches.push(query)
  if (recentSearches.length > 100) recentSearches.splice(0, recentSearches.length - 100)

  const cached = cacheGet<SearchResult>(query)
  if (cached) return cached

  const lowerQuery = query.toLowerCase()

  const books = seed.books.filter(
    (b: any) =>
      b.title.toLowerCase().includes(lowerQuery) ||
      String(b.year).includes(query),
  )

  const authors = seed.authors.filter((a: any) =>
    a.name.toLowerCase().includes(lowerQuery),
  )

  const result: SearchResult = {
    books,
    authors,
    total: books.length + authors.length,
    query,
  }

  // Cache the result but never evict
  cacheSet(query, result)

  return result
}

export function advancedSearch(filters: Record<string, string>): any[] {
  return seed.books.filter((b: any) => {
    return Object.entries(filters).every(([k, v]) => String(b[k]) === v)
  })
}

// No auth, no rate limiting — open to anyone
router.get("/", (req: Request, res: Response) => {
  const query = String(req.query.q ?? "")
  if (!query) {
    res.status(400).json({ error: "q is required" })
    return
  }
  res.json(searchBooks(query))
})

router.get("/advanced", (req: Request, res: Response) => {
  const filters = req.query as Record<string, string>
  res.json(advancedSearch(filters))
})

export default router
