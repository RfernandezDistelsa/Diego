import { Router, type Request, type Response } from "express"
import type { Order, OrderItem } from "./types"
import { validateOrderItem } from "./utils/validation"
import { decrementStock } from "./inventory"
import { sendOrderConfirmation } from "./services/mailer"
import { log } from "./utils/logger"
import { verifyToken, type AuthPayload } from "./middleware"
import { readFileSync } from "fs"
import path from "path"

const router = Router()
const orders: Order[] = []
let nextOrderId = 1

const seedPath = path.join(__dirname, "..", "books.seed.json")
const seedData = JSON.parse(readFileSync(seedPath, "utf8"))
const seedUsers = seedData.users
const seedBooks = seedData.books

router.get("/", verifyToken, (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? "1"), 10)
  const limit = parseInt(String(req.query.limit ?? "20"), 10)
  const start = (page - 1) * limit
  const items = orders.slice(start, start + limit)
  res.json({ total: orders.length, items })
})

router.get("/:id", verifyToken, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return }
  const order = orders.find((o) => o.id === id)
  if (!order) {
    res.status(404).json({ error: "not found" })
    return
  }
  res.json(order)
})

router.post("/", verifyToken, async (req: Request, res: Response) => {
  const body = req.body as { items?: unknown[]; shippingAddress?: string }
  const userId = (res.locals.user as AuthPayload).sub

  const itemErrors = (body.items ?? []).flatMap((item) => validateOrderItem(item))
  if (itemErrors.length > 0) {
    res.status(400).json({ errors: itemErrors })
    return
  }

  const items: OrderItem[] = (body.items as { bookId: number; quantity: number }[]).map((item) => {
    const book = seedBooks.find((b: { id: number; price: number }) => b.id === item.bookId)
    return {
      bookId: item.bookId,
      quantity: item.quantity,
      unitPrice: book?.price ?? 0,
    }
  })

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const order: Order = {
    id: nextOrderId++,
    userId,
    items,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
    shippingAddress: body.shippingAddress ?? "",
  }

  orders.push(order)

  for (const item of items) {
    decrementStock(item.bookId, item.quantity)
  }

  const user = seedUsers.find((u: { id: number; email?: string }) => u.id === userId)
  if (user?.email) {
    await sendOrderConfirmation(user.email, order.id, order.total)
  }

  log("info", "order created", { orderId: order.id, userId, total })
  res.status(201).json(order)
})

router.patch("/:id/status", verifyToken, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return }
  const order = orders.find((o) => o.id === id)
  if (!order) {
    res.status(404).json({ error: "not found" })
    return
  }
  const { status } = req.body as { status: Order["status"] }
  const validStatuses = ["pending", "shipped", "delivered"]
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" })
    return
  }
  order.status = status
  res.json(order)
})

export default router
