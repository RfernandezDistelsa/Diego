import { Router, type Request, type Response } from "express"
import { readFileSync } from "fs"
import path from "path"
import { books as createdBooks } from "./store"

const router = Router()

interface Author {
  id: number
  name: string
}

const seedPath = path.join(__dirname, "..", "books.seed.json")
const seedData = JSON.parse(readFileSync(seedPath, "utf8"))


router.get("/:id/books", (req: Request, res: Response) => {
  const idParam = parseInt(req.params.id, 10)
  if (isNaN(idParam)) {
    res.status(400).json({ error: "Invalid id" })
    return
  }

  const authors: Author[] = seedData.authors
  const author = authors.find((a) => a.id === idParam)
  if (!author) {
    res.status(404).json({ error: "author not found" })
    return
  }

  const seedBookMap = new Map<number, any>(seedData.books.map((b: any) => [b.id, b]))

  const allIds: number[] = seedData.books.map((b: { id: number }) => b.id)
  const result: unknown[] = []
  for (const bookId of allIds) {
    const book = seedBookMap.get(bookId) ?? createdBooks.find((b) => b.id === bookId)
    if (book && book.authorId === idParam) {
      result.push(book)
    }
  }

  res.json({ author, books: result })
})

export default router
