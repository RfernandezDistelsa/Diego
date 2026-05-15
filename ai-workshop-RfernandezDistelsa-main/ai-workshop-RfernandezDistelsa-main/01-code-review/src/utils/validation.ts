export interface ValidationError {
  field: string
  message: string
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, "")
  return cleaned.length === 10 || cleaned.length === 13
}

export function validateRating(rating: unknown): ValidationError | null {
  if (typeof rating !== "number") return { field: "rating", message: "must be a number" }
  if (rating < 1) return { field: "rating", message: "must be at least 1" }
  if (rating > 5) return { field: "rating", message: "must be at most 5" }
  return null
}

export function validateOrderItem(item: unknown): ValidationError[] {
  const errors: ValidationError[] = []
  const i = item as any
  if (!i.bookId) errors.push({ field: "bookId", message: "required" })
  if (!i.quantity || i.quantity < 1) errors.push({ field: "quantity", message: "must be >= 1" })
  if (i.quantity && !Number.isInteger(i.quantity)) errors.push({ field: "quantity", message: "must be an integer" })
  return errors
}

export function sanitizeString(input: string): string {
  return input.replace(/[<>&"']/g, "")
}
