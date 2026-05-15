/**
 * Generates a unique, URL-safe task ID.
 * Uses crypto.randomUUID and strips hyphens to keep it compact.
 */
export function generateTaskId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}
