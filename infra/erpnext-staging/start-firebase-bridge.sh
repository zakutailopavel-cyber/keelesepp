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
LOCAL_ORIGIN="${FRAPPE_LOCAL_ORIGIN:-http://127.0.0.1:8080}"

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

printf 'Checking local ERPNext origin... '
if ! curl -fsS --connect-timeout 3 --max-time 10 "${LOCAL_ORIGIN}/api/method/ping" >/dev/null; then
  echo "failed" >&2
  echo "ERPNext is not reachable at ${LOCAL_ORIGIN}. Keep Docker Desktop running and verify the local staging first." >&2
  exit 1
fi
echo "ok"

mkdir -p "${TUNNEL_DIR}"
if [ -f "${PID_FILE}" ]; then
  old_pid="$(cat "${PID_FILE}" 2>/dev/null || true)"
  if [ -n "${old_pid}" ] && kill -0 "${old_pid}" 2>/dev/null; then
    kill "${old_pid}" || true
    sleep 1
  fi
fi

: > "${LOG_FILE}"
nohup cloudflared tunnel \
  --url "${LOCAL_ORIGIN}" \
  --http-host-header "localhost" \
  --no-autoupdate \
  >"${LOG_FILE}" 2>&1 &
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
    tail -n 60 "${LOG_FILE}" >&2
    exit 1
  fi
  printf '.'
  sleep 1
done

if [ -z "${public_url}" ]; then
  echo
  echo "Timed out waiting for Cloudflare Quick Tunnel URL." >&2
  tail -n 60 "${LOG_FILE}" >&2
  exit 1
fi

echo "${public_url}" > "${URL_FILE}"
printf 'Waiting for ERPNext through public tunnel'
public_ready=0
last_status=''
for attempt in $(seq 1 45); do
  if curl -fsS --connect-timeout 5 --max-time 15 "${public_url}/api/method/ping" >/dev/null 2>&1; then
    public_ready=1
    echo
    break
  fi
  last_status="$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "${public_url}/api/method/ping" 2>/dev/null || true)"
  if ! kill -0 "${tunnel_pid}" 2>/dev/null; then
    echo
    echo "cloudflared stopped while waiting for the public ERPNext endpoint." >&2
    tail -n 80 "${LOG_FILE}" >&2
    exit 1
  fi
  printf '.'
  sleep 2
done

if [ "${public_ready}" -ne 1 ]; then
  echo
  echo "Tunnel URL was created but ERPNext never became reachable through it. Last HTTP status: ${last_status:-unknown}" >&2
  echo "Cloudflared log:" >&2
  tail -n 80 "${LOG_FILE}" >&2
  exit 1
fi

echo "Public ERPNext bridge is healthy: ${public_url}"

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
