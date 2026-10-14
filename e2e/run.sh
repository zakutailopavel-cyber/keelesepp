#!/usr/bin/env bash
# Browser scenarios on local Firebase emulators (Auth, Firestore with the real rules, Functions) and the CRM dev
# server — production is never touched. Needs Java 21 for the emulators.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -d /opt/homebrew/opt/openjdk@21 ]; then export JAVA_HOME=/opt/homebrew/opt/openjdk@21; export PATH="$JAVA_HOME/bin:$PATH"; fi
npx --yes firebase-tools@15.22.3 emulators:exec --project demo-keelesepp-e2e --only auth,firestore,functions,storage \
  "cd e2e && npx playwright test $*"
