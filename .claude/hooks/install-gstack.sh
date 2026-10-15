#!/usr/bin/env bash
# Installs gstack in Claude Code cloud sessions, whose containers start clean.
# Never blocks the session: every failure prints a notice and exits 0.

GSTACK_DIR="$HOME/.claude/skills/gstack"
TIME_LIMIT=180

# Local machines follow the manual install in CLAUDE.md.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

if [ -d "$GSTACK_DIR/bin" ]; then
  exit 0
fi

notice() { echo "gstack: $1. Install manually with the steps in CLAUDE.md." >&2; }

if ! command -v timeout >/dev/null 2>&1; then
  notice "the timeout command is missing, skipping install"
  exit 0
fi

rm -rf "$GSTACK_DIR"
if ! timeout "$TIME_LIMIT" git clone --quiet --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_DIR"; then
  rm -rf "$GSTACK_DIR"
  notice "clone failed or timed out"
  exit 0
fi

if ! (cd "$GSTACK_DIR" && timeout "$TIME_LIMIT" ./setup --team >/dev/null 2>&1); then
  notice "setup failed or took longer than ${TIME_LIMIT}s"
  exit 0
fi

echo "gstack: installed in $GSTACK_DIR" >&2
exit 0
