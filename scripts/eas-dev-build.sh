#!/usr/bin/env bash
# EAS development-build wrapper: `npm run dev:build` (optionally: ios).
#
# expo-dev-client is deliberately NOT in package.json — its Android
# dev-launcher pulls Google Play Services + MLKit into release builds, and the
# default dependency tree stays GMS-free so source builds run on de-Googled
# devices (see PR #53). But eas-cli refuses to submit a development-profile
# build unless expo-dev-client is installed locally, and the EAS builder
# installs whatever package.json it receives in the upload. So: temporarily
# install it, submit (the project uploads with it), then restore the pristine
# state — the trap runs even if submission fails.
set -euo pipefail
cd "$(dirname "$0")/.."

PLATFORM="${1:-android}"

cleanup() {
  git checkout -- package.json package-lock.json
  # npm ci drops expo-dev-client from node_modules again, so a later local
  # source/release build can't silently pick GMS back up via autolinking
  npm ci --silent
}
trap cleanup EXIT

npx expo install expo-dev-client
npx eas-cli build --platform "$PLATFORM" --profile development --no-wait "${@:2}"
