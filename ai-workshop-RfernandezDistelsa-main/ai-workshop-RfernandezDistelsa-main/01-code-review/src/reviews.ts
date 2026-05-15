import { Router, type Request, type Response } from "express"
import type { Review } from "./types"
import { validateRating, sanitizeString } from "./utils/validation"
import { cacheGet, cacheSet, cacheDelete } from "./utils/cache"
import { log } from "./utils/logger"
import { verifyToken, type AuthPayload } from "./middleware"

const router = Router()
const reviews: Review[] = []
let nextReviewId = 1

router.get("/books/:bookId/reviews", (req: Request, res: Response) => {
  const bookId = parseInt(req.params.bookId, 10)
  if (isNaN(bookId)) { res.status(400).json({ error: "Invalid id" }); return }

  const cached = cacheGet<Review[]>(`reviews:${bookId}`)
  if (cached) {
    res.json(cached)
    return
  }

  const bookReviews = reviews.filter((r) => r.bookId === bookId)
  cacheSet(`reviews:${bookId}`, bookReviews)
  res.json(bookReviews)
})

router.post("/books/:bookId/reviews", verifyToken, (req: Request, res: Response) => {
  const bookId = parseInt(req.params.bookId, 10)
  if (isNaN(bookId)) { res.status(400).json({ error: "Invalid id" }); return }
  const body = req.body as { rating: number; body?: string }
  const userId = (res.locals.user as AuthPayload).sub

  const ratingError = validateRating(body.rating)
  if (ratingError) {
    res.status(400).json({ error: ratingError.message })
    return
  }

  const existing = reviews.find((r) => r.bookId === bookId && r.userId === userId)
  if (existing) {
    res.status(409).json({ error: "already reviewed" })
    return
  }

  const review: Review = {
    id: nextReviewId++,
    bookId,
    userId,
    rating: body.rating,
    body: body.body ? sanitizeString(body.body) : "",
    createdAt: new Date().toISOString(),
  }

  reviews.push(review)
  cacheDelete(`reviews:${bookId}`)

  log("info", "review created", { review })
  res.status(201).json(review)
})

router.delete("/reviews/:id", verifyToken, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return }
  const idx = reviews.findIndex((r) => r.id === id)
  if (idx === -1) {
    res.status(404).json({ error: "not found" })
    return
  }
  const [deleted] = reviews.splice(idx, 1)
  cacheDelete(`reviews:${deleted.bookId}`)
  res.status(204).send()
})

export default router
