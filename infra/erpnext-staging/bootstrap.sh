#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-${HOME}/keelesepp-erpnext-staging}"
FRAPPE_DOCKER_DIR="${ROOT_DIR}/frappe_docker"

command -v git >/dev/null 2>&1 || { echo "git is required" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "docker is required" >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "Docker Compose v2 is required" >&2; exit 1; }

mkdir -p "${ROOT_DIR}"
if [ ! -d "${FRAPPE_DOCKER_DIR}/.git" ]; then
  git clone --depth 1 https://github.com/frappe/frappe_docker.git "${FRAPPE_DOCKER_DIR}"
else
  git -C "${FRAPPE_DOCKER_DIR}" fetch --depth 1 origin main
  git -C "${FRAPPE_DOCKER_DIR}" reset --hard origin/main
fi

cd "${FRAPPE_DOCKER_DIR}"
docker compose -f pwd.yml up -d

echo
echo "ERPNext evaluation staging is starting from the official frappe_docker pwd.yml stack."
echo "URL: http://localhost:8080"
echo "Default evaluation login documented by frappe_docker: Administrator / admin"
echo
echo "Watch site creation with:"
echo "  cd ${FRAPPE_DOCKER_DIR} && docker compose -f pwd.yml logs -f create-site"
echo
echo "This stack is disposable evaluation infrastructure only. Do not use it for production data."
