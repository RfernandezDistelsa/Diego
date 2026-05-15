import { Router, type Request, type Response } from "express"
import { readFileSync } from "fs"
import path from "path"
import type { InventoryEntry } from "./types"

const router = Router()

const inventory: Map<number, InventoryEntry> = new Map()

function seedInventory() {
  if (inventory.size > 0) return
  const seedPath = path.join(__dirname, "..", "books.seed.json")
  const data = JSON.parse(readFileSync(seedPath, "utf8"))
  data.books.forEach((b: any, index: number) => {
    inventory.set(b.id, {
      bookId: b.id,
      stock: 10 + (index % 40),
      reserved: 0,
      lastRestocked: new Date().toISOString(),
    })
  })
}

seedInventory()

router.get("/", (_req: Request, res: Response) => {
  const entries = Array.from(inventory.values())
  res.json(entries)
})

router.get("/:bookId", (req: Request, res: Response) => {
  const bookId = parseInt(req.params.bookId, 10)
  const entry = inventory.get(bookId)
  if (!entry) {
    res.status(404).json({ error: "not found" })
    return
  }
  res.json(entry)
})

router.post("/:bookId/restock", (req: Request, res: Response) => {
  const bookId = parseInt(req.params.bookId, 10)
  const { quantity } = req.body as { quantity: number }
  const entry = inventory.get(bookId)
  if (!entry) {
    res.status(404).json({ error: "not found" })
    return
  }
  if (!quantity || quantity < 1) {
    res.status(400).json({ error: "quantity must be a positive integer" })
    return
  }
  entry.stock += quantity
  entry.lastRestocked = new Date().toISOString()
  res.json(entry)
})

router.post("/:bookId/reserve", (req: Request, res: Response) => {
  const bookId = parseInt(req.params.bookId, 10)
  const { quantity } = req.body as { quantity: number }
  const entry = inventory.get(bookId)
  if (!entry) {
    res.status(404).json({ error: "not found" })
    return
  }
  if (entry.stock - entry.reserved < quantity) {
    res.status(409).json({ error: "insufficient stock" })
    return
  }
  entry.reserved += quantity
  res.json(entry)
})

export function decrementStock(bookId: number, quantity: number): boolean {
  const entry = inventory.get(bookId)
  if (!entry) return false
  entry.stock -= quantity
  entry.reserved = Math.max(0, entry.reserved - quantity)
  return true
}

export default router
