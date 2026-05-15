# Exercise 2 — Extend & Redesign Tasky

## Scenario

Tasky is a working todo app with tasks, priority levels, filters, and undo. Your job is to extend it with a new feature and give it a fresh look — using a crew of specialized agents to do the work.

The agents know the workflow. Just tell them what you want.

## Stack

- Next.js 16 (App Router), TypeScript strict mode
- Tailwind CSS v3 for styling
- Vitest + Testing Library for tests

## Setup

```bash
npm install
npm test         # should be green before you start (8 tests)
npm run dev      # http://localhost:3000 (to test your feature)
```

Open Claude Code in this directory:

```bash
claude
```

---

## Available agents

Your build crew consists of these specialized agents. You invoke them with the `/agents` command or by typing `@mention`:

- **`@pm-spec`** — Takes a feature brief and writes a tight spec: feature list, acceptance criteria, data model, API contract, scope cuts
- **`@architect`** — Takes a spec and designs the code: folder structure, key abstractions, tech choices, ADRs
- **`@backend-dev`** — Implements the non-UI layer from an architecture doc: business logic, API routes, persistence (localStorage)
- **`@frontend-dev`** — Implements the UI layer from an architecture doc: React components, pages, state, Tailwind styling
- **`@qa-engineer`** — Runs tests and reports pass/fail per test file; lists defects with enough detail to fix them

**How to invoke an agent:**
- Type `/agents` to list available agents in this project
- In a prompt, use `@agent-name` to explicitly delegate to a specific agent (e.g., `Use @pm-spec to...`)
- **Agents are auto-selected based on their descriptions** — if you describe what you need (e.g., "I need a spec"), Claude Code automatically selects the matching agent without requiring the `@mention`
- Each agent runs in its own context window and returns only a summary to the main thread, keeping your main context small

These agents know the workflow. Tell them what you want and they'll coordinate.

---

## Step 1 — Add a feature

Pick one feature from the menu and describe it. The agents will clarify the scope with you, then plan and build it.

**Feature menu** (priority is already built — pick something new):
- **Due dates** — tasks can have an optional due date; overdue tasks are highlighted
- **Tags** — tasks can have free-form tags; filter the list by tag
- **Search** — live text filter across task titles
- **Recurring tasks** — tasks that reset on a schedule

**Prompt to use:**

```
I want to add a new feature to Tasky: <feature name and one-sentence description>
```

The orchestrator will ask a few clarifying questions, then delegate to the build crew automatically.

---

## Step 2 — Redesign with the UX designer

A `@ux-designer` agent is available. Use it to create a design spec from a visual brief.

**How it works:**
1. Describe your visual direction in one sentence
2. Use `@ux-designer` to create a design spec (`docs/design-spec.md`)
3. Use `@frontend-dev` to implement the spec

**Example directions:**
- "Dark and minimal — charcoal background, monospace font, muted green accents"
- "Bright and playful — white background, bold colors, rounded pill buttons"
- "Enterprise dashboard — neutral greys, compact density, blue primary actions"

**Prompt to use:**

```
I want to redesign Tasky. Here's my direction: <your one-sentence brief>
```

