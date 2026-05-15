function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

export const PORT = Number(process.env.PORT ?? 3000)

export const JWT_SECRET = requireEnv("JWT_SECRET")

export const ADMIN_USER = requireEnv("ADMIN_USER")
export const ADMIN_PASS = requireEnv("ADMIN_PASS")

export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000"
