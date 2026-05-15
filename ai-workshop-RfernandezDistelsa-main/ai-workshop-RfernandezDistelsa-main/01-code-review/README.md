# Exercise 1 — Code review on an inherited bookshop API

## Scenario

You've inherited a small TypeScript + Express service. The previous engineer left for a sabbatical
and there's no design doc — just the code, a thin test, and a vague "it works in dev." Product
wants to ship it next sprint.

In this exercise you'll run **two reviews of the same codebase** using two different approaches,
then compare the results side by side.

## Stack

- Node 20+, TypeScript (strict), Express 4
- Vitest for tests, ESLint with a deliberately lenient config
- Endpoints: `GET /books`, `GET /books/:id`, `POST /books`, `PATCH /books/:id`,
  `DELETE /books/:id`, `GET /authors/:id/books`, `POST /auth/login`, `GET /auth/me`

## Setup

```bash
npm install
npm test       # should be green (3 tests)
```

Open Claude Code in this directory before each run:

```bash
claude
```

---

## How This Exercise Works

You'll run the same review request twice with different delegation strategies:

- **Run 1** — Single-pass review with delegation explicitly blocked
- **Run 2** — Open-ended review that allows the system to delegate based on available agents

The goal: observe how the approach affects the findings.

---

## Run 1 — Single-pass review (no delegation)

A single prompt asking Claude to do everything itself. The key constraint is the last line —
without it, Claude would automatically delegate to the review crew per the repo instructions.

**Prompt to use (copy and paste as-is):**

```
I inherited this Express API and need to ship it next sprint.
Review the code in src/ thoroughly.
Write findings to findings-direct.md, grouped by severity with file and line references.
Do not delegate this review to any subagents — conduct the entire analysis yourself.
```

Wait for it to finish, then open `findings-direct.md`.

---

## Run 2 — Open-ended review (implicit delegation)

Same task, but without the explicit "do not delegate" instruction. Per the repo's `CLAUDE.md`,
the system will delegate to available specialized agents if they match the task.

**Prompt to use (copy and paste as-is):**

```
I inherited this Express API and need to ship it next sprint.
Review the code in src/ thoroughly.
Write findings to findings-agents.md, grouped by severity with file and line references.
```

Watch how the system handles it, then open `findings-agents.md`.

## Comparing the two reports

You now have two reports. Compare them and note your observations.

```bash
diff findings-direct.md findings-agents.md
```

Or open them side by side in the editor.

As you review, focus on what you notice about each report's clarity, scope, and usefulness.
