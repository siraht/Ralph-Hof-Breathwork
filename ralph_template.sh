#!/usr/bin/env bash
set -euo pipefail

# Ralph loop template (final output only)
# - Reads prompt from ralph_prompt_template.md each iteration.
# - Suppresses non-final chatter by discarding stderr.

cd /data/projects/wimhof

if [ ! -f ralph_prompt_template.md ]; then
  echo "ralph_prompt_template.md not found. Create it first."
  exit 1
fi

mkdir -p .run

while :; do
  cat ralph_prompt_template.md | codex exec --dangerously-bypass-approvals-and-sandbox 2>/dev/null | tee -a .run/ralph_turns.log
done
