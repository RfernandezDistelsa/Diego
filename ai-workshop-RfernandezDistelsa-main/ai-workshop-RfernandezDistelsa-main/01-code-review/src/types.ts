export interface Book {
  id: number
  title: string
  authorId: number
  year: number
  price: number
  isbn?: string
  genre?: string
}

export interface Author {
  id: number
  name: string
  country?: string
}

export interface User {
  id: number
  username: string
  password: string
  email: string
  role: "user" | "admin"
}

export interface OrderItem {
  bookId: number
  quantity: number
  unitPrice: number
}

export interface Order {
  id: number
  userId: number
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "shipped" | "cancelled"
  createdAt: string
  shippingAddress: string
}

export interface Review {
  id: number
  bookId: number
  userId: number
  rating: number
  body: string
  createdAt: string
}

export interface InventoryEntry {
  bookId: number
  stock: number
  reserved: number
  lastRestocked: string
}

export interface SearchResult {
  books: Book[]
  authors: Author[]
  total: number
  query: string
}
