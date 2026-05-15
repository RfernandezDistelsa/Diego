import { Router, type Request, type Response } from "express"
import jwt from "jsonwebtoken"
import { readFileSync } from "fs"
import path from "path"
import { timingSafeEqual } from "crypto"
import { JWT_SECRET } from "./config"

const router = Router()

interface User {
  id: number
  username: string
  password: string
}

const seedPath = path.join(__dirname, "..", "books.seed.json")
const users: User[] = JSON.parse(readFileSync(seedPath, "utf8")).users

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string }
  const user = users.find((u) => u.username === username)

  if (!user) {
    res.status(401).json({ error: "invalid credentials" })
    return
  }

  try {
    timingSafeEqual(Buffer.from(user.password), Buffer.from(password))
  } catch {
    res.status(401).json({ error: "invalid credentials" })
    return
  }

  const token = jwt.sign(
    { sub: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "1h" },
  )
  res.json({ token })
})

router.get("/me", (req: Request, res: Response) => {
  const auth = req.headers.authorization
  if (!auth) {
    res.status(401).json({ error: "missing token" })
    return
  }
  const token = auth.replace(/^Bearer /, "")

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    })
    res.json({ user: payload })
  } catch {
    res.status(401).json({ error: "invalid token" })
  }
})

export default router
