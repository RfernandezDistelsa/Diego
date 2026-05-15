#!/bin/bash
set -e

# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Install opencode CLI
npm install -g opencode-ai

# Open README and Agent Flow extension on startup
code README.md &
sleep 2
code --execute-command "agent-flow.show" &

wait
