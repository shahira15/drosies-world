#!/usr/bin/env bash
# Runs every conference test. Needs: a static server at the repo root on :8123 (python3 -m http.server 8123),
# Playwright, and AXE_PATH pointing at axe-core's axe.min.js (npm i axe-core) for the accessibility scan.
set -u
cd "$(dirname "$0")/../.."
fail=0
for t in vx-m1-m2 vx-m3 vx-m4 vx-m5 vx-m6 vx-m7 vx-m8 vx-m9 unit m1-m2 m3 m4 m5 m6 m7 m8 m9 keyboard e2e e2e-b guide-and-site review exports privacy robustness discoverability a11y; do
  if [ "$t" = a11y ] && [ -z "${AXE_PATH:-}" ]; then echo "== a11y SKIPPED (AXE_PATH not set)"; continue; fi
  echo "== $t"; node tests/conference/$t.js | tail -1 | tee /tmp/conf-last.txt
  grep -q " 0 failed" /tmp/conf-last.txt || fail=1
done
exit $fail
