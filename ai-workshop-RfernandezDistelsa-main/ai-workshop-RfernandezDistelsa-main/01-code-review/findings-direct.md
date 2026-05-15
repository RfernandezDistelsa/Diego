# Code Review Findings

## CRITICAL SEVERITY

### 1. Timing-Safe Comparison Not Enforced in Password Validation
**File:** `src/auth.ts:29`
```
const result = timingSafeEqual(Buffer.from(user.password), Buffer.from(password))
```
**Issue:** The result of `timingSafeEqual()` is computed but never checked. This defeats the entire purpose of using timing-safe comparison. Password verification will always succeed regardless of the comparison result.

**Risk:** Timing attacks can reveal password information.

**Fix:** Check the result and return early on mismatch:
```javascript
if (!timingSafeEqual(Buffer.from(user.password), Buffer.from(password))) {
  res.status(401).json({ error: "invalid credentials" })
  return
}
```

---

### 2. Double Response Error in Auth Middleware
**File:** `src/middleware.ts:17-31`
```javascript
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing token" })
    return  // Missing return after res.json(), but this is present
  }
  // ... rest continues to next()
}
```
**Issue:** When the auth header is missing, a 401 response is sent, but then `next()` is still called on the happy path. While the `return` is present, the flow is unclear. More critically: in the catch block (line 28), after sending 401, the function implicitly returns, but there's no explicit `return` statement.

**Risk:** Multiple response attempts; potential for undefined behavior.

**Fix:** Add explicit `return` after `res.status(401)` calls:
```javascript
  } catch {
    res.status(401).json({ error: "invalid token" })
    return  // Add this
  }
```

---

### 3. Password Storage Using Hardcoded Seed File
**File:** `src/auth.ts:17`
```javascript
const users: User[] = JSON.parse(readFileSync(seedPath, "utf8")).users
```
**Issue:** User authentication loads from a static seed JSON file instead of a proper data store. Passwords are stored in plaintext in the file.

**Risk:** Credentials are in version control; no secure password hashing; no actual user management capability.

**Fix:** Move to a real database with hashed passwords. At minimum, load from secure environment variables.

---

### 4. Order Status Validation Mismatch with Type Definition
**File:** `src/orders.ts:94`
```javascript
const validStatuses = ["pending", "shipped", "delivered"]
```
**File:** `src/types.ts:36`
```typescript
status: "pending" | "confirmed" | "shipped" | "cancelled"
```

**Issue:** The validation list in orders.ts uses `["pending", "shipped", "delivered"]`, but the Order type allows `"pending" | "confirmed" | "shipped" | "cancelled"`. The statuses don't match.

**Risk:** Type safety broken; invalid states can be persisted; API contract violation.

**Fix:** Synchronize validation with type definition. Use type-level guards or derive from a shared constant.

---

### 5. Hardcoded SendGrid API Key in Source Code
**File:** `src/services/mailer.ts:6`
```javascript
const SMTP_PASS = "SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ.fake_sendgrid_key_do_not_use"
```

**Issue:** API key is hardcoded in the source file, even though marked as "fake". This is a dangerous pattern that can lead to accidental exposure of real keys.

**Risk:** If this pattern is copied for real credentials, the key will be committed to version control.

**Fix:** Load from environment variables only:
```javascript
const SMTP_PASS = process.env.SMTP_PASS || ""
```

---

## HIGH SEVERITY

### 6. Timing Issue with Blocking File I/O
**Files:** `src/auth.ts:17`, `src/books.ts:10`, `src/orders.ts:16`, `src/admin.ts:13`, `src/authors.ts:14`, `src/inventory.ts:12`, `src/recommendations.ts:9`, `src/services/search.ts:11`

**Issue:** `readFileSync()` is called during module initialization in at least 8 places. This blocks the event loop synchronously on startup, slowing down server startup.

**Risk:** Long startup time; blocking I/O is an anti-pattern in Node.js; unscalable.

**Fix:** Load seed data once at module initialization (acceptable), but move all `readFileSync` calls to a single initialization phase before the server starts, or use async loading.

---

### 7. No Authentication Check on /me Endpoint
**File:** `src/auth.ts:43-59`

**Issue:** The `/me` endpoint manually parses and validates the JWT token without using the `verifyToken` middleware. It duplicates token validation logic and doesn't enforce that the user_id in the token matches the user they're asking about (if that was the intention). There's no authorization check.

**Risk:** Code duplication; inconsistent security patterns; potential for auth bypass if middleware is updated but this endpoint isn't.

**Fix:** Use the `verifyToken` middleware:
```javascript
router.get("/me", verifyToken, (req: Request, res: Response) => {
  const user = res.locals.user as AuthPayload
  res.json({ user })
})
```

---

### 8. Admin Token Verification Missing Role Check
**File:** `src/admin.ts:15-28`

**Issue:** The `verifyAdminToken` middleware only checks if a token is valid (line 23), but doesn't verify that the token payload contains an admin role. Any valid token will grant access to admin endpoints.

**Risk:** Any authenticated user can access admin endpoints, even non-admin users.

**Fix:** Check the `role` field in the JWT payload:
```javascript
function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing token" })
    return
  }
  const token = auth.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET, { 
      algorithms: ["HS256"] 
    }) as AuthPayload
    if (payload.role !== "admin") {
      res.status(403).json({ error: "forbidden" })
      return
    }
    next()
  } catch {
    res.status(401).json({ error: "invalid token" })
  }
}
```

---

### 9. Unused Config Variables
**File:** `src/config.ts:13-14`
```javascript
export const ADMIN_USER = requireEnv("ADMIN_USER")
export const ADMIN_PASS = requireEnv("ADMIN_PASS")
```

**Issue:** `ADMIN_USER` and `ADMIN_PASS` are exported from config but never used in the codebase. Auth uses a hardcoded seed file instead. These config variables create misleading expectations about how authentication works.

**Risk:** Dead code; confusion about credential management; developers may assume these are used.

**Fix:** Remove these exports or implement actual admin user support using them.

---

### 10. Search Endpoints Have No Authentication or Rate Limiting
**File:** `src/services/search.ts:54-66`

**Issue:** The `/search` and `/search/advanced` endpoints are accessible without authentication and have no rate limiting. A bad actor can flood the server with search requests.

**Risk:** Denial of service; resource exhaustion.

**Fix:** Add authentication middleware and consider adding rate limiting:
```javascript
router.get("/", verifyToken, (req: Request, res: Response) => { ... })
router.get("/advanced", verifyToken, (req: Request, res: Response) => { ... })
```

---

### 11. Type Safety Violations with `any` Casts
**Files:** `src/books.ts:54`, `src/books.ts:73`, `src/recommendations.ts:47-50`

**Issue:** Multiple places cast objects to `any` instead of using proper types:
- `src/books.ts:54`: `const body = req.body as any`
- `src/books.ts:73`: `async function saveBook(book: any)`
- `src/recommendations.ts:14`: `cacheGet<any[]>`

**Risk:** Type safety bypassed; potential runtime errors; hard to maintain and refactor.

**Fix:** Use proper TypeScript types or shape validation instead of `any`.

---

## MEDIUM SEVERITY

### 12. Missing Radix in parseInt() Call
**File:** `src/inventory.ts:32`
```javascript
const bookId = parseInt(req.params.bookId, 10)  // Good
// But should verify all parseInt calls use base 10
```
**File:** `src/inventory.ts:42` uses same pattern (good)

**Issue:** While most `parseInt` calls use radix 10, not all do. Inconsistency creates risk.

**Risk:** Parsing "010" as octal instead of decimal; subtle bugs.

**Fix:** Audit all `parseInt` calls and ensure radix 10 is always specified.

---

### 13. Confusing Search Parameter Handling in Books Route
**File:** `src/books.ts:33-36`
```javascript
if (typeof req.query.q === "string") {
  recentSearches.push(req.query.q)
  if (recentSearches.length > 100) recentSearches.splice(0, recentSearches.length - 100)
}
```

**Issue:** The `q` query parameter is captured and added to `recentSearches`, but it's never actually used to filter the books list. This is the `/books` GET endpoint, not a search endpoint. The behavior is confusing and potentially misleading.

**Risk:** Unexpected side effects; developers may assume `q` filters results.

**Fix:** Remove this logic or add a comment explaining why search tracking is here. Better: move to the dedicated `/search` endpoint.

---

### 14. Cache Eviction Policy Ignores Freshness
**File:** `src/utils/cache.ts:21-24`
```javascript
if (store.size >= 1000) {
  const oldestKeys = Array.from(store.keys()).slice(0, 100)
  for (const k of oldestKeys) store.delete(k)
}
```

**Issue:** When cache reaches 1000 entries, it deletes the first 100 keys from the Map. This doesn't consider actual TTL, access frequency, or which entries are stale. The `cachedAt` timestamp is stored but never used for eviction.

**Risk:** Hot cache entries may be evicted while stale data remains; poor cache efficiency.

**Fix:** Implement an LRU or TTL-based eviction policy:
```javascript
if (store.size >= 1000) {
  const now = Date.now()
  const expired = Array.from(store.entries())
    .filter(([_, entry]) => now - entry.cachedAt > TTL)
    .map(([k]) => k)
  expired.forEach(k => store.delete(k))
}
```

---

### 15. HTML Sanitization Using Removal Instead of Encoding
**File:** `src/utils/validation.ts:31-33`
```javascript
export function sanitizeString(input: string): string {
  return input.replace(/[<>&"']/g, "")
}
```

**Issue:** The sanitization removes HTML special characters instead of escaping them. This prevents XSS but loses the original input. Better practice is HTML entity encoding.

**Risk:** Data loss; users can't include quotes or angle brackets in text (e.g., "John's book" becomes "Johns book").

**Fix:** Use HTML entity encoding instead:
```javascript
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
```

---

### 16. Inventory Stock Validation Ambiguity
**File:** `src/inventory.ts:49`
```javascript
if (!quantity || quantity < 1) {
  res.status(400).json({ error: "quantity must be a positive integer" })
  return
}
```

**Issue:** The check `!quantity` will fail for 0, but so will `quantity < 1`. The condition is redundant. More importantly, it doesn't validate that `quantity` is actually an integer.

**Risk:** Accepts 0.5 as a valid quantity; confusing validation logic.

**Fix:**
```javascript
if (!Number.isInteger(quantity) || quantity < 1) {
  res.status(400).json({ error: "quantity must be a positive integer" })
  return
}
```

---

### 17. No Pagination on Authors Books Endpoint
**File:** `src/authors.ts:17-43`

**Issue:** The `GET /authors/:id/books` endpoint returns all books for an author without pagination. If an author has thousands of books, the response could be very large.

**Risk:** Large responses consume bandwidth and memory; potential DoS vector.

**Fix:** Add pagination:
```javascript
const page = parseInt(String(req.query.page ?? "1"), 10)
const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10), 100)
const start = (page - 1) * limit
const paginated = result.slice(start, start + limit)
res.json({ author, books: paginated, total: result.length, page, limit })
```

---

### 18. Misleading Async Function for Fake Database Save
**File:** `src/books.ts:73-79`
```javascript
async function saveBook(book: any): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      books.push(book)
      resolve()
    }, 5)
  })
}
```

**Issue:** The function is marked `async` and awaited, but it's just a fake delay with `setTimeout`. It doesn't interact with a real database, and the 5ms delay is purely artificial. This misleads developers about what happens here.

**Risk:** Developers may build error handling for database failures that won't work; the pattern doesn't scale to real persistence.

**Fix:** Either make this truly async with real persistence, or simplify to synchronous:
```javascript
function saveBook(book: any): void {
  books.push(book)
}
```

---

## LOW SEVERITY

### 19. Inconsistent Error Response Format
**Files:** Multiple routes have inconsistent error response structures
- Some return `{ error: "..." }` (books.ts:21, auth.ts:24)
- Some return `{ errors: [...] }` (orders.ts:45)
- Some return `{ error: "...", status: ... }` (not seen but could happen)

**Risk:** API consumers must handle multiple error formats; harder to write generic error handlers.

**Fix:** Standardize on a single error response format across all endpoints.

---

### 20. Misleading Comment in store.ts
**File:** `src/store.ts:1`
```javascript
// Shared in-memory state. Re-imported across modules; intentionally module-scoped.
```

**Issue:** The comment says "intentionally module-scoped" but the data is exported, making it shared across modules (not module-scoped).

**Fix:** Clarify the comment:
```javascript
// Shared in-memory state across modules. Data is lost on restart.
```

---

### 21. Access Log String Concatenation Inefficiency
**File:** `src/utils/cache.ts:12-13`
```javascript
export function cacheGet<T>(key: string): T | undefined {
  accessLog.push(`GET ${key} at ${Date.now()}`)
  if (accessLog.length > 1000) accessLog.splice(0, accessLog.length - 1000)
```

**Issue:** Every cache access creates a string with timestamp. Over many accesses, this could consume significant memory. The log is only useful for debugging but is always maintained.

**Risk:** Memory creep in long-running processes.

**Fix:** Make access logging conditional or remove it entirely:
```javascript
if (process.env.DEBUG_CACHE) {
  accessLog.push(`GET ${key} at ${Date.now()}`)
}
```

---

### 22. Unused Import in books.ts
**File:** `src/books.ts:4`
```javascript
import { books, bumpBookId, recentSearches } from "./store"
```
The function `priceTier` (lines 111-122) is exported but never used in the codebase. The `recentSearches` import is used in the books endpoint to track searches, but this is indirect and confusing.

**Risk:** Dead code; unclear purpose of price tier function.

**Fix:** Either integrate `priceTier` into the API response or remove it.

---

### 23. Cache Key Collision Risk in Recommendations
**File:** `src/services/search.ts:15-20` and `src/recommendations.ts:44`

**Issue:** Cache keys use simple formats like `reviews:${bookId}` and `recs:${bookId}`. If the caching layer is shared across different logical domains (books, reviews, recommendations), collisions could occur if the same numeric ID is used.

**Risk:** Cache pollution; stale data served from wrong context.

**Fix:** Use fully-qualified cache keys:
```javascript
const key = `recommendations:books:${bookId}`
```

---

### 24. JWT Expiration Not Documented
**File:** `src/auth.ts:35-39`
```javascript
const token = jwt.sign(
  { sub: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: "1h" },  // Hardcoded, undocumented
)
```

**Issue:** Token expiration is hardcoded to 1 hour with no configuration option or documentation. If the requirement changes, it requires code changes and redeployment.

**Risk:** Inflexible token lifetime; business logic mixed with code.

**Fix:** Move to config:
```javascript
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION ?? "1h"
```

---

### 25. No Input Length Validation
**Files:** Multiple endpoints accept string inputs without length limits
- Title in `src/books.ts:56-59`
- Review body in `src/reviews.ts:50`
- Query strings in `src/services/search.ts:55`

**Risk:** Large inputs could cause memory issues; API abuse vector.

**Fix:** Add maximum length validation:
```javascript
if (body.title?.length > 256) {
  res.status(400).json({ error: "title too long (max 256 chars)" })
  return
}
```

---

## SUMMARY

**Critical Issues:** 5 (timing-safe comparison, double response, hardcoded passwords, status mismatch, API key)

**High Issues:** 6 (blocking I/O, auth bypass, missing role check, dead config, no rate limiting, type safety)

**Medium Issues:** 7 (parseInt radix, confusing search logic, cache eviction, sanitization, quantity validation, no pagination, misleading async)

**Low Issues:** 7 (error format, comment clarity, access logging, dead code, cache collisions, undocumented expiration, no input validation)

**Total Findings:** 25

### Recommendation for Sprint Shipping

**Blockers before ship:**
1. Fix timing-safe comparison (Critical #1)
2. Fix double response error (Critical #2)
3. Fix order status mismatch (Critical #4)
4. Remove hardcoded API key (Critical #5)
5. Add admin role check (High #8)
6. Add auth to search endpoints (High #10)

The password storage (Critical #3) can be deferred if this is a workshop/demo, but document it as a known limitation.

Remaining issues can be addressed post-launch or in follow-up sprints.
