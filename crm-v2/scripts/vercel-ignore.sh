#!/bin/sh
# Vercel „Ignored Build Step” (vercel.json ignoreCommand): exit 0 skips the build, exit 1 builds.
# Batched releases (owner 2026-11-09): ~730 production builds a month — one per merge — made the Vercel bill go over
# the plan's credit. main now builds only for
#  - the release commit „[deploy] …” that .github/workflows/release.yml makes twice a day or on request, or
#  - a merge whose PR title / commit message carries „[deploy]” or „[hotfix]” (an urgent fix goes out at once).
# agent/* branches never build a preview; other branches build previews as before.
case "$VERCEL_GIT_COMMIT_REF" in
  agent/*) echo "skip: agent branch"; exit 0 ;;
  main)
    case "$VERCEL_GIT_COMMIT_MESSAGE" in *"[deploy]"*|*"[hotfix]"*) echo "build: release"; exit 1 ;; esac
    echo "skip: waits for the next batched release (.github/workflows/release.yml)"; exit 0 ;;
  *) exit 1 ;;
esac
