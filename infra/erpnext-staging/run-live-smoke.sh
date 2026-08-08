#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-${HOME}/keelesepp-erpnext-staging}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRAPPE_DOCKER_DIR="${ROOT_DIR}/frappe_docker"
ENV_FILE="${ROOT_DIR}/.erpnext-staging.env"

bash "${REPO_ROOT}/infra/erpnext-staging/bootstrap.sh" "${ROOT_DIR}"

cd "${FRAPPE_DOCKER_DIR}"

printf 'Waiting for ERPNext site creation'
for attempt in $(seq 1 180); do
  create_site_id="$(docker compose -f pwd.yml ps -aq create-site 2>/dev/null || true)"
  if [ -n "${create_site_id}" ]; then
    status="$(docker inspect -f '{{.State.Status}}' "${create_site_id}" 2>/dev/null || true)"
    if [ "${status}" = "exited" ]; then
      exit_code="$(docker inspect -f '{{.State.ExitCode}}' "${create_site_id}")"
      echo
      if [ "${exit_code}" != "0" ]; then
        echo "ERPNext create-site failed with exit code ${exit_code}." >&2
        docker compose -f pwd.yml logs --tail=120 create-site >&2 || true
        exit 1
      fi
      break
    fi
  fi

  printf '.'
  sleep 2
  if [ "${attempt}" -eq 180 ]; then
    echo
    echo "ERPNext site creation did not finish in time." >&2
    docker compose -f pwd.yml logs --tail=120 create-site >&2 || true
    exit 1
  fi
done

# A previous interrupted demo run can leave sites/frontend present even when
# ERPNext did not finish installing. pwd.yml then skips site creation on retry.
# Repair that disposable staging state before provisioning KeeleSepp objects.
installed_apps="$(docker compose -f pwd.yml exec -T backend bench --site frontend list-apps 2>/dev/null || true)"
if ! printf '%s\n' "${installed_apps}" | grep -qx 'erpnext'; then
  echo "ERPNext app is missing from the staging site; repairing interrupted setup..."
  docker compose -f pwd.yml exec -T backend bench --site frontend install-app erpnext
fi

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
    echo "ERPNext did not become ready after site creation." >&2
    docker compose -f pwd.yml logs --tail=120 backend frontend >&2 || true
    exit 1
  fi
done

cd "${REPO_ROOT}"
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
