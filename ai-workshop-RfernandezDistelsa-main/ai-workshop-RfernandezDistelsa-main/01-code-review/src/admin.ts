import { Router, type Request, type Response, type NextFunction } from "express"
import { readFileSync } from "fs"
import path from "path"
import jwt from "jsonwebtoken"
import { cacheStats, cacheClear } from "./utils/cache"
import { recentSearches } from "./store"
import { log } from "./utils/logger"
import { JWT_SECRET } from "./config"

const router = Router()

const seedPath = path.join(__dirname, "..", "books.seed.json")
const seed = JSON.parse(readFileSync(seedPath, "utf8"))

function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing token" })
    return
  }
  const token = auth.slice(7)
  try {
    jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] })
    next()
  } catch {
    res.status(401).json({ error: "invalid token" })
  }
}

router.use(verifyAdminToken)

router.get("/stats", (_req: Request, res: Response) => {
  res.json({
    books: seed.books.length,
    authors: seed.authors.length,
    users: seed.users.length,
    cache: cacheStats(),
    recentSearchCount: recentSearches.length,
  })
})

router.get("/users", (_req: Request, res: Response) => {
  const safe = seed.users.map((u: { password?: string; [k: string]: unknown }) => {
    const { password: _pw, ...rest } = u
    return rest
  })
  res.json(safe)
})

router.delete("/cache", (_req: Request, res: Response) => {
  recentSearches.length = 0
  cacheClear()
  log("info", "cache cleared by admin")
  res.json({ ok: true })
})

export default router
