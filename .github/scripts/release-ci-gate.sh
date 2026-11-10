#!/usr/bin/env bash
# Release gate (review I2, 2026-11-11): a release goes out only when the „CRM v2” checks (.github/workflows/crm-v2.yml:
# verify = unit tests + lint + build, security-regression = functions tests + emulator, sheet-layout = phone layout)
# are green for the newest app change on main.
#
#   red                        → exit 1 with a clear message, nothing is released
#   running / not started yet  → wait (poll every POLL_SECONDS, at most WAIT_MINUTES), then decide; still not done → exit 1
#   green                      → exit 0
#
# Which run counts: the newest push run of crm-v2.yml on main that contains the newest first-parent commit on main
# touching the paths crm-v2.yml watches, and is itself part of what is released. A release commit is empty and pushed
# with GITHUB_TOKEN, so it never has a run of its own. Read-only: `gh run list` + local git history.
#
# Env: GH_TOKEN (actions: read), GITHUB_REPOSITORY; optional TARGET (default HEAD), WAIT_MINUTES (25), POLL_SECONDS (30),
# CI_WORKFLOW (crm-v2.yml).
set -euo pipefail

TARGET=${TARGET:-HEAD}
WAIT_MINUTES=${WAIT_MINUTES:-25}
POLL_SECONDS=${POLL_SECONDS:-30}
CI_WORKFLOW=${CI_WORKFLOW:-crm-v2.yml}
REPO=${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}
# keep in sync with on.push.paths in .github/workflows/crm-v2.yml
CI_PATHS=(crm-v2 e2e/layout e2e/playwright.layout.config.cjs e2e/package.json e2e/package-lock.json .github/workflows/crm-v2.yml)

say() { echo "$*"; if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then echo "$*" >> "$GITHUB_STEP_SUMMARY"; fi; }
stop() { echo "::error title=Release stopped::$*"; say "**Release stopped:** $*"; exit 1; }

target=$(git rev-parse "$TARGET")
need=$(git log -1 --first-parent --format=%H "$target" -- "${CI_PATHS[@]}" || true)
if [ -z "$need" ]; then say "No commit on main touches the CRM v2 paths — nothing to check."; exit 0; fi
say "Release target ${target:0:7}; newest app change ${need:0:7} ($(git log -1 --format=%s "$need" | cut -c1-80))."

deadline=$(( $(date +%s) + WAIT_MINUTES * 60 ))
while :; do
  runs=$(gh run list -R "$REPO" --workflow "$CI_WORKFLOW" --branch main --event push --limit 40 \
    --json databaseId,headSha,status,conclusion,createdAt,url \
    --jq 'sort_by(.createdAt) | reverse | .[] | [.headSha, .status, (if .conclusion == "" then "-" else .conclusion end), (.databaseId|tostring), .url] | @tsv')
  found=""
  while IFS=$'\t' read -r sha status conclusion id url; do
    [ -n "$sha" ] || continue
    git cat-file -e "${sha}^{commit}" 2>/dev/null || continue
    # the run must include the newest app change and be part of what is released
    git merge-base --is-ancestor "$need" "$sha" || continue
    git merge-base --is-ancestor "$sha" "$target" || continue
    found="$sha $status $conclusion $id $url"; break
  done <<< "$runs"

  if [ -n "$found" ]; then
    read -r sha status conclusion id url <<< "$found"
    if [ "$status" = "completed" ]; then
      if [ "$conclusion" = "success" ]; then say "CRM v2 checks are green for ${sha:0:7}: $url"; exit 0; fi
      stop "CRM v2 checks for ${sha:0:7} ended „${conclusion}” — fix main (or re-run the failed checks) and release again: $url"
    fi
    state="CRM v2 run $id for ${sha:0:7} is ${status}"
  else
    state="no CRM v2 run on main for ${need:0:7} yet"
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    stop "$state after ${WAIT_MINUTES} min — not releasing unchecked code. Run the release again when the checks are done."
  fi
  echo "$state — waiting ${POLL_SECONDS}s…"
  sleep "$POLL_SECONDS"
done
