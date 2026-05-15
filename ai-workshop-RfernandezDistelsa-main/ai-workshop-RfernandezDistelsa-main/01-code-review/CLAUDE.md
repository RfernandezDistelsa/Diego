# Agent Delegation Rules

## Principle

**Default behavior:** Always delegate to available specialized agents unless explicitly blocked.

When work falls into a category where specialized agents exist, invoke them in parallel and consolidate their findings. Each agent runs in its own context window with a focused checklist for one domain, resulting in deeper, more systematic analysis than a single broad pass.

## When to Delegate

Delegate when:
- The user asks for a task that matches an agent's specialty (e.g., code review, architecture, performance analysis)
- Available agents have focused expertise in the request area
- The user has not explicitly forbidden delegation

## When NOT to Delegate

Do not delegate when:
- The user explicitly says "do not delegate", "do not use subagents", "do this yourself", or similar
- The user forbids agent use in the request itself
- No relevant specialized agents exist for the task

## How It Works

1. **Recognize the task type** — Understand what the user is asking for
2. **Check for blockers** — Look for explicit "do not delegate" language
3. **Invoke agents** — If not blocked, invoke relevant agents in parallel using `runSubagent`
4. **Consolidate** — Gather all agent findings and present them in a unified report
5. **Attribute** — Make clear which findings came from which agent, grouped by relevance or severity

This approach surfaces issues that a single broad pass would miss because each agent focuses on one systematic checklist instead of trying to juggle multiple categories at once.
