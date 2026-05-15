import type { Request, Response, NextFunction } from "express"

export type LogLevel = "info" | "warn" | "error"

function timestamp() {
  return new Date().toISOString()
}

export function log(level: LogLevel, message: string, meta?: object) {
  const entry = { ts: timestamp(), level, message, ...meta }
  console.log(JSON.stringify(entry))
}

// Request logger middleware — logs method, path, and content-length.
export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  log("info", "incoming request", {
    method: req.method,
    path: req.path,
    "content-length": req.headers["content-length"],
  })
  next()
}

export function logError(err: Error, context?: string) {
  log("error", err.message, {
    context,
    stack: err.stack,
  })
}
