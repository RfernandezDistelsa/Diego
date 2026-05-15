# Exercise 2 — Project context

## Stack

- **Framework:** Next.js 16, App Router (not Pages Router)
- **Language:** TypeScript, `strict: true`
- **Styling:** Tailwind CSS v3
- **Tests:** Vitest + Testing Library
- **Persistence:** `localStorage` only — no server, no database, no auth

## Directory layout

```
app/          ← Next.js App Router pages and layouts
components/   ← React components
lib/          ← business logic, storage, pure functions
tests/        ← Vitest test files
docs/         ← spec, architecture, design specs
```

**Never create a `src/` directory.**

## What is already implemented

The app is a working todo manager. Do not re-implement these:

- **Tasks** — create, toggle complete, delete (`lib/tasks.ts`)
- **Priority levels** — `low / med / high` on every task, shown as a badge in `TaskItem`, selectable in `TaskForm` (`lib/types.ts`, `components/TaskForm.tsx`, `components/TaskItem.tsx`)
- **Filters** — All / Open / Done (`components/FilterToggle.tsx`)
- **Undo** — delete with undo toast (`components/UndoToast.tsx`)
- **Persistence** — `localStorage` via `lib/storage.ts`, accessed through `lib/useTasks.ts`

## Constraints for all agents

- Write files into the existing directories above. Do not introduce new top-level folders.
- TypeScript strict mode — no `any`, no implicit nulls.
- All components must be compatible with the App Router (`"use client"` where needed).
- Do not install new dependencies without noting them explicitly in your summary.

---

## Workflow 1 — Feature development

**Triggered when:** the user describes a new feature they want to add.

**Step 1 — Clarify intent (orchestrator)**
Before delegating, ask the user 2–3 focused questions to pin down scope:
- What user problem does this solve?
- How does it interact with existing features (filters, priority, undo)?
- Any edge cases or constraints to handle?

Wait for the user's answers before proceeding.

**Step 2 — Plan**
Once intent is clear, delegate in sequence:
1. Use `@pm-spec` to write a tight spec for this feature only to `docs/spec.md`
2. Use `@architect` to document the changes needed to `docs/architecture.md`

Present both outputs to the user before proceeding. Ask if any adjustments are needed.

**Step 3 — Build**
Once the plan is approved, delegate in parallel (IMPORTANT: always use explicit `@mention`):
- Prompt `@backend-dev` directly: "Implement the non-UI layer from `docs/architecture.md`: [specific functions and data structures in lib/]"
- Prompt `@frontend-dev` directly: "Implement the UI layer from `docs/architecture.md`: [specific components, pages, and routes]"

**Critical:** Use the agent name explicitly in your prompt (e.g., "I need @backend-dev to..." or "Use @backend-dev to implement..."). Do NOT rely on auto-selection for implementation — always mention the specific agent by name.

**Step 4 — Verify (Static validation only)**
Once implementation is complete, delegate in parallel:
- Use `@qa-engineer` to run `npm test` and report pass/fail per test file (no e2e testing)
- Use `@architect` to run `npm run build` and report any type or build errors

Both report their findings to the main thread. Then:
- **If both pass** — confirm to the user that the feature is done and ready to demo at `localhost:3000`.
- **If either fails** — do NOT declare done. Summarize what broke and route the specific failures back:
  - Test failures → `@backend-dev` or `@frontend-dev` (whichever layer owns the failing code)
  - Build/type errors → the relevant dev agent
  - Repeat Step 3–4 until both are green.

**Validation scope boundary:** Static validation only (tests and build checks). Do not attempt e2e validation, starting dev servers, or connecting to the app. The user will test the feature manually at `localhost:3000`.

---

## Workflow 2 — Redesign

**Triggered when:** the user describes a visual direction or asks to redesign the app.

**Step 1 — Define the design (orchestrator)**
Ask the user to describe their vision:
- Overall mood / aesthetic (e.g. "dark minimal", "bright and playful")
- Any specific elements they care about (typography, spacing, color accents)

Collect a clear one-sentence brief before delegating.

**Step 2 — Design spec**
Delegate design creation:
- Use `@ux-designer` to read existing components and write `docs/design-spec.md` with a concrete Tailwind class-level spec

Note: `@ux-designer` is an agent the participant creates themselves as part of the exercise. If it doesn't exist yet, prompt the user to create it first (see README Step 2).

Present the design spec summary to the user. Ask if they want to adjust anything before implementation.

**Step 3 — Implement**
Delegate implementation with explicit `@mention`:
- Prompt `@frontend-dev` directly: "Implement the design changes from `docs/design-spec.md` across components and pages"

**Step 4 — Verify (Static validation only)**
Delegate verification:
- Use `@architect` to run `npm run build` and report any type or build errors (static check only)

**Success criteria:**
- Build succeeds with no TypeScript or linting errors
- Code follows the design spec as written in the spec file

**Note:** Do not attempt visual verification by starting the dev server. The user will view the changes manually at `localhost:3000`.
