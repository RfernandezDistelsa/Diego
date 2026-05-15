import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { logError } from "./utils/logger"
import { JWT_SECRET } from "./config"

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logError(err, "unhandled error")
  res.status(500).json({ error: "Internal server error" })
}

export interface AuthPayload {
  sub: number
  username: string
  role: "user" | "admin"
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing token" })
    return
  }
  try {
    const token = auth.slice(7)
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as unknown as AuthPayload
    res.locals.user = payload
    next()
  } catch {
    res.status(401).json({ error: "invalid token" })
  }
}
