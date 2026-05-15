[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=23926675)
# Workshop · Agent orchestration with OpenCode

A hands-on workshop on using specialized subagents to do real engineering work — code review,
spec writing, architecture, implementation, and testing — while keeping the main context small.

Total time: **~1.5 hours**.

## Setup

Open the repo in a GitHub Codespace. Wait for the post-create script to finish (~90s), then log in to OpenCode:

```bash
claude --version
```

| | OpenCode | Claude Code (alternative) |
|---|---|---|
| Launch | `opencode` | `claude` |
| Agent path | `.opencode/agent/` | `.claude/agents/` |

## Concepts
- A subagent runs in its own context window and returns only a summary to the main thread.
- The main thread stays small; the work happens in the sub-contexts.
- Agents are auto-selected based on their `description` field — no explicit tagging needed.
- Patterns: **Review crew** (parallel), **Build crew** (pipeline), **Refactor crew** (analyze → plan → implement → verify).

## Exercise 1 — Code review

See [`01-code-review/README.md`](01-code-review/README.md).

Two runs of the same codebase — single-pass (no delegation) and open-ended (implicit delegation) — both writing to files so you can
diff the results.

## Exercise 2 — Build from a PRD (45 min)

See [`02-build-todo/README.md`](02-build-todo/README.md).

Full build-crew pipeline: `spec` → `architecture` → `failing tests` → `parallel implementation` →
`verify`. You are the human in the loop reviewing each agent's output before the next step runs.
