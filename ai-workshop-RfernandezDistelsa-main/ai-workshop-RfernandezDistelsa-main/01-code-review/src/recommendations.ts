import { Router, type Request, type Response } from "express"
import { readFileSync } from "fs"
import path from "path"
import { cacheGet, cacheSet } from "./utils/cache"

const router = Router()

const seedPath = path.join(__dirname, "..", "books.seed.json")
const seed = JSON.parse(readFileSync(seedPath, "utf8"))

router.get("/books/:bookId", (req: Request, res: Response) => {
  const bookId = parseInt(req.params.bookId, 10)

  const cached = cacheGet<any[]>(`recs:${bookId}`)
  if (cached) {
    res.json(cached)
    return
  }

  const book = seed.books.find((b: any) => b.id === bookId)

  if (!book) {
    res.status(404).json({ error: "not found" })
    return
  }

  const sameAuthorIds: number[] = seed.books
    .filter((b: any) => b.authorId === book.authorId && b.id !== bookId)
    .map((b: any) => b.id)

  const recommendations = sameAuthorIds.map((id) => {
    const rec = seed.books.find((b: any) => b.id === id)
    const author = seed.authors.find((a: any) => a.id === rec?.authorId)
    return { ...rec, author }
  })

  cacheSet(`recs:${bookId}`, recommendations)
  res.json(recommendations)
})

router.get("/users/:userId", (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10)

  const cached = cacheGet<any[]>(`recs:user:${userId}`)
  if (cached) {
    res.json(cached)
    return
  }

  const allBooks: any[] = seed.books
    .slice()
    .sort((a: any, b: any) => b.year - a.year)

  const enriched = allBooks.map((b) => {
    const author = seed.authors.find((a: any) => a.id === b.authorId)
    return { ...b, author }
  })

  cacheSet(`recs:user:${userId}`, enriched)
  res.json(enriched)
})

export default router
