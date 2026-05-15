import express from "express"
import cors from "cors"
import { PORT, CORS_ORIGIN } from "./config"
import booksRouter from "./books"
import authorsRouter from "./authors"
import authRouter from "./auth"
import ordersRouter from "./orders"
import reviewsRouter from "./reviews"
import inventoryRouter from "./inventory"
import recommendationsRouter from "./recommendations"
import adminRouter from "./admin"
import { errorHandler } from "./middleware"
import { requestLogger } from "./utils/logger"
import searchRouter from "./services/search"

const app = express()

app.use(express.json({ limit: "10kb" }))
app.use(cors({ origin: [CORS_ORIGIN] }))
app.use(requestLogger)

app.get("/health", (_req, res) => {
  res.json({ ok: true })
})

app.use("/books", booksRouter)
app.use("/authors", authorsRouter)
app.use("/auth", authRouter)
app.use("/orders", ordersRouter)
app.use("/reviews", reviewsRouter)
app.use("/inventory", inventoryRouter)
app.use("/recommendations", recommendationsRouter)
app.use("/admin", adminRouter)
app.use("/search", searchRouter)

app.use(errorHandler)

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Bookshop API listening on http://localhost:${PORT}`)
  })
}

export default app
