import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      JWT_SECRET: "test-secret-key",
      ADMIN_USER: "admin",
      ADMIN_PASS: "password",
    },
  },
})
