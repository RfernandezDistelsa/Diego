import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../src/index"

describe("GET /books", () => {
  it("responds with a list of books", async () => {
    const res = await request(app).get("/books")
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("items")
    expect(Array.isArray(res.body.items)).toBe(true)
  })

  it("first page contains the first books from the catalog", async () => {
    const res = await request(app).get("/books?page=1&limit=3")
    expect(res.status).toBe(200)
    expect(res.body.items.map((b: { id: number }) => b.id)).toEqual([1, 2, 3])
  })
})

describe("POST /books", () => {
  it("returns 400 when the title is missing", async () => {
    const res = await request(app)
      .post("/books")
      .send({ year: 2020, price: 10 })
    expect(res.status).toBe(400)
  })
})
