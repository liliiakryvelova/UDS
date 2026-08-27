#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   sudo DB_NAME=uds_events DB_USER=uds_app DB_PASSWORD='strong-password' APP_CIDR='YOUR_IP/32' ./init-postgres-vm.sh
#
# Notes:
# - Run this script on the Google Compute Engine VM (Ubuntu/Debian).
# - APP_CIDR should be your app/server IP range, not 0.0.0.0/0.

DB_NAME="${DB_NAME:-uds_events}"
DB_USER="${DB_USER:-uds_app}"
DB_PASSWORD="${DB_PASSWORD:-change-me-now}"
APP_CIDR="${APP_CIDR:-127.0.0.1/32}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "ERROR: run this script with sudo/root."
  exit 1
fi

if [[ "${DB_PASSWORD}" == "change-me-now" ]]; then
  echo "ERROR: set DB_PASSWORD to a strong password before running."
  exit 1
fi

echo "[1/6] Installing PostgreSQL and tools..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib ufw

echo "[2/6] Reading PostgreSQL config paths..."
PG_CONF="$(sudo -u postgres psql -tAc "show config_file" | xargs)"
PG_HBA="$(sudo -u postgres psql -tAc "show hba_file" | xargs)"

if [[ -z "${PG_CONF}" || -z "${PG_HBA}" ]]; then
  echo "ERROR: Could not detect PostgreSQL config paths."
  exit 1
fi

echo "[3/6] Enabling network listening..."
sed -i.bak -E "s|^#?listen_addresses\s*=.*|listen_addresses = '*'|" "${PG_CONF}" || true
if ! grep -q "^host\s\+all\s\+all\s\+${APP_CIDR//\//\\/}\s\+scram-sha-256" "${PG_HBA}"; then
  echo "host all all ${APP_CIDR} scram-sha-256" >> "${PG_HBA}"
fi

echo "[4/6] Creating database role and database..."
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
$$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo "[5/6] Restarting PostgreSQL..."
systemctl restart postgresql
systemctl enable postgresql

echo "[6/6] Configuring firewall..."
ufw allow OpenSSH
ufw allow from "${APP_CIDR}" to any port 5432 proto tcp
ufw --force enable

VM_IP="$(curl -s ifconfig.me || true)"
echo
cat <<EOF
PostgreSQL setup complete.

Use this DATABASE_URL in your app:
postgresql://${DB_USER}:${DB_PASSWORD}@${VM_IP}:5432/${DB_NAME}?schema=public

If your app requires SSL later, move to Cloud SQL and set sslmode=require.
EOF
