import { Router, type Request, type Response } from "express"
import { readFileSync } from "fs"
import path from "path"
import { books, bumpBookId, recentSearches } from "./store"
import { sanitizeString } from "./utils/validation"

const router = Router()

const seedPath = path.join(__dirname, "..", "books.seed.json")
const seed = JSON.parse(readFileSync(seedPath, "utf8"))

const MAX_PAGE_LIMIT = 100

router.get("/", (req: Request, res: Response) => {
  const all = [...seed.books, ...books]

  const page = parseInt(String(req.query.page ?? "1"), 10)
  const limit = parseInt(String(req.query.limit ?? "10"), 10)

  if (isNaN(page) || page < 1) {
    res.status(400).json({ error: "Invalid page" })
    return
  }
  if (isNaN(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
    res.status(400).json({ error: `Invalid limit (1-${MAX_PAGE_LIMIT})` })
    return
  }

  const start = (page - 1) * limit
  const end = start + limit
  const items = all.slice(start, end)

  if (typeof req.query.q === "string") {
    recentSearches.push(req.query.q)
    if (recentSearches.length > 100) recentSearches.splice(0, recentSearches.length - 100)
  }

  res.json({ page, limit, total: all.length, items })
})

router.get("/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return }
  const all = [...seed.books, ...books]
  const found = all.find((b) => b.id === id)
  if (!found) {
    res.status(404).json({ error: "not found" })
    return
  }
  res.json(found)
})

router.post("/", async (req: Request, res: Response) => {
  const body = req.body as any

  if (!body.title) {
    res.status(400).json({ error: "title is required" })
    return
  }

  const book = {
    id: bumpBookId(),
    title: sanitizeString(body.title),
    authorId: body.authorId,
    year: body.year,
    price: body.price,
  }

  await saveBook(book)
  res.status(201).json(book)
})

async function saveBook(book: any): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      books.push(book)
      resolve()
    }, 5)
  })
}

router.patch("/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return }
  const idx = books.findIndex((b) => b.id === id)
  if (idx === -1) {
    res.status(404).json({ error: "not found" })
    return
  }
  const updates = req.body as any
  const sanitized = { ...updates }
  if (typeof sanitized.title === "string") {
    sanitized.title = sanitizeString(sanitized.title)
  }
  books[idx] = { ...books[idx], ...sanitized }
  res.json(books[idx])
})

router.delete("/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return }
  const idx = books.findIndex((b) => b.id === id)
  if (idx === -1) {
    res.status(404).json({ error: "not found" })
    return
  }
  books.splice(idx, 1)
  res.status(204).send()
})

export function priceTier(price: number): string {
  switch (true) {
    case price < 10:
      return "budget"
    case price < 20:
      return "standard"
    case price < 50:
      return "premium"
    default:
      return "luxury"
  }
}

export default router
