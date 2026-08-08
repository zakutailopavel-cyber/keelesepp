#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-${HOME}/keelesepp-erpnext-staging}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.erpnext-staging.env"

bash "${REPO_ROOT}/infra/erpnext-staging/bootstrap.sh" "${ROOT_DIR}"

printf 'Waiting for ERPNext HTTP endpoint'
for attempt in $(seq 1 90); do
  if curl -fsS http://localhost:8080/api/method/ping >/dev/null 2>&1; then
    echo
    break
  fi
  printf '.'
  sleep 2
  if [ "${attempt}" -eq 90 ]; then
    echo
    echo "ERPNext did not become ready. Check create-site logs." >&2
    exit 1
  fi
done

FRAPPE_BASE_URL="${FRAPPE_BASE_URL:-http://localhost:8080}" \
FRAPPE_ADMIN_USER="${FRAPPE_ADMIN_USER:-Administrator}" \
FRAPPE_ADMIN_PASSWORD="${FRAPPE_ADMIN_PASSWORD:-admin}" \
node "${REPO_ROOT}/infra/erpnext-staging/provision.js" "${ENV_FILE}"

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

cd "${REPO_ROOT}/functions"
node erpnext-live-smoke.js

echo
echo "ERPNext staging provision + KeeleSepp finance smoke test passed."
echo "Server-side staging variables are stored in ${ENV_FILE} with mode 600."
echo "Do not commit that file or use this disposable stack for production data."
