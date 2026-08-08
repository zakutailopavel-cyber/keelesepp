#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-${HOME}/keelesepp-erpnext-staging}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.erpnext-staging.env"
PROJECT_ID="${FIREBASE_PROJECT_ID:-keelesepp-5136b}"
TUNNEL_DIR="${ROOT_DIR}/firebase-bridge"
LOG_FILE="${TUNNEL_DIR}/cloudflared.log"
PID_FILE="${TUNNEL_DIR}/cloudflared.pid"
URL_FILE="${TUNNEL_DIR}/public-url.txt"
FIREBASE_ENV="${REPO_ROOT}/functions/.env.${PROJECT_ID}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Missing ${ENV_FILE}. Run run-live-smoke.sh first." >&2
  exit 1
fi
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared is required. On macOS: brew install cloudflared" >&2
  exit 1
fi
if ! command -v firebase >/dev/null 2>&1; then
  echo "firebase CLI is required." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

mkdir -p "${TUNNEL_DIR}"
if [ -f "${PID_FILE}" ]; then
  old_pid="$(cat "${PID_FILE}" 2>/dev/null || true)"
  if [ -n "${old_pid}" ] && kill -0 "${old_pid}" 2>/dev/null; then
    kill "${old_pid}" || true
    sleep 1
  fi
fi

: > "${LOG_FILE}"
nohup cloudflared tunnel --url "${FRAPPE_BASE_URL:-http://localhost:8080}" >"${LOG_FILE}" 2>&1 &
tunnel_pid=$!
echo "${tunnel_pid}" > "${PID_FILE}"

printf 'Waiting for temporary Cloudflare URL'
public_url=''
for attempt in $(seq 1 60); do
  public_url="$(grep -Eo 'https://[-a-z0-9]+\.trycloudflare\.com' "${LOG_FILE}" | tail -n 1 || true)"
  if [ -n "${public_url}" ]; then
    echo
    break
  fi
  if ! kill -0 "${tunnel_pid}" 2>/dev/null; then
    echo
    echo "cloudflared exited before a tunnel URL was created:" >&2
    tail -n 40 "${LOG_FILE}" >&2
    exit 1
  fi
  printf '.'
  sleep 1
done

if [ -z "${public_url}" ]; then
  echo
  echo "Timed out waiting for Cloudflare Quick Tunnel URL." >&2
  tail -n 40 "${LOG_FILE}" >&2
  exit 1
fi

echo "${public_url}" > "${URL_FILE}"
if ! curl -fsS "${public_url}/api/method/ping" >/dev/null; then
  echo "Tunnel exists but ERPNext ping failed: ${public_url}" >&2
  exit 1
fi

cleanup_env() {
  rm -f "${FIREBASE_ENV}"
}
trap cleanup_env EXIT
umask 077
cat > "${FIREBASE_ENV}" <<EOF
FINANCE_PROVIDER=erpnext
FRAPPE_BASE_URL=${public_url}
FRAPPE_API_KEY=${FRAPPE_API_KEY}
FRAPPE_API_SECRET=${FRAPPE_API_SECRET}
ERPNEXT_COMPANY=E&P Koolitus OÜ
ERPNEXT_CUSTOMER_GROUP=${ERPNEXT_CUSTOMER_GROUP:-KeeleSepp Customers}
ERPNEXT_TERRITORY=${ERPNEXT_TERRITORY:-Estonia}
ERPNEXT_LESSON_ITEM_CODE=${ERPNEXT_LESSON_ITEM_CODE:-KEELESEPP-LESSON}
ERPNEXT_CURRENCY=${ERPNEXT_CURRENCY:-EUR}
ERPNEXT_SELLING_PRICE_LIST=${ERPNEXT_SELLING_PRICE_LIST:-KeeleSepp Selling EUR}
EOF
chmod 600 "${FIREBASE_ENV}"

printf 'Deploying manualInvoiceApi to Firebase staging through temporary ERPNext bridge...\n'
(
  cd "${REPO_ROOT}"
  firebase deploy --only functions:manualInvoiceApi --project "${PROJECT_ID}"
)
cleanup_env
trap - EXIT

cat <<EOF

Firebase staging bridge deployment completed.
Temporary ERPNext URL:
  ${public_url}

Tunnel PID:
  ${tunnel_pid}

The temporary local Firebase env file (including disposable ERPNext credentials) was removed after deploy.
Keep Docker Desktop and this cloudflared tunnel running while testing staging.

Next check:
  open https://keelesepp-5136b.web.app
  then use an authenticated admin session and verify /provider-status before creating one test invoice.

To stop the bridge later:
  kill $(cat "${PID_FILE}")
EOF
