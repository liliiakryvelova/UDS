# Google e2-micro + Self-Hosted PostgreSQL (UDS)

This guide sets up a low-cost Google-only database path for UDS:
- Start with one e2-micro VM + PostgreSQL
- Keep costs low for small usage
- Migrate to Cloud SQL later without app rewrite

## 1) Create the VM

Use a free-tier eligible region when possible (verify current GCP free-tier terms):

```bash
gcloud config set project YOUR_PROJECT_ID

gcloud compute instances create uds-postgres-dev \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-standard \
  --tags=postgres
```

## 2) Lock network access (important)

Allow PostgreSQL only from trusted source IPs (your laptop IP or app server egress IP):

```bash
export TRUSTED_IP="X.X.X.X/32"

gcloud compute firewall-rules create uds-postgres-allow \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:5432 \
  --source-ranges="${TRUSTED_IP}" \
  --target-tags=postgres
```

Tip: if you are testing locally, get your public IP with:

```bash
curl ifconfig.me
```

## 3) Install and configure PostgreSQL on VM

SSH into VM:

```bash
gcloud compute ssh uds-postgres-dev --zone=us-central1-a
```

Run bootstrap script from this repository on the VM:

```bash
# On local machine, copy script to VM
cd web
scp scripts/init-postgres-vm.sh YOUR_VM_USER@VM_EXTERNAL_IP:~/init-postgres-vm.sh

# On VM
chmod +x ~/init-postgres-vm.sh
sudo DB_NAME=uds_events DB_USER=uds_app DB_PASSWORD='REPLACE_STRONG_PASSWORD' APP_CIDR='X.X.X.X/32' ./init-postgres-vm.sh
```

What script does:
- Installs PostgreSQL and UFW
- Enables remote listening
- Creates DB + app role
- Restricts DB access to APP_CIDR
- Prints DATABASE_URL format

## 4) Connect UDS app to VM database

In [web/.env](web/.env.example):

```env
DATABASE_URL="postgresql://uds_app:REPLACE_STRONG_PASSWORD@VM_EXTERNAL_IP:5432/uds_events?schema=public"
```

Then run:

```bash
cd web
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## 5) Backups (minimum safety)

On VM, create daily SQL dump cron:

```bash
sudo -u postgres crontab -e
```

Example cron entry:

```cron
0 2 * * * pg_dump -Fc uds_events > /var/backups/uds_events_$(date +\%F).dump
```

Also copy backups off the VM periodically (Cloud Storage bucket or local secure storage).

## 6) Cost control notes

- e2-micro is suitable for small workloads and dev/staging.
- Keep VM always-on only if needed.
- Watch disk growth from backups/logs.

## 7) Migration path to Cloud SQL (later)

When traffic grows:
1. Create Cloud SQL PostgreSQL instance.
2. Export from VM:
   ```bash
   pg_dump -Fc uds_events > uds_events.dump
   ```
3. Import to Cloud SQL:
   ```bash
   pg_restore --no-owner --no-privileges -d TARGET_DB uds_events.dump
   ```
4. Update `DATABASE_URL` in app.
5. Add `?sslmode=require` if required by your target setup.

## Security checklist

- Never allow `0.0.0.0/0` on port 5432.
- Use long random DB password.
- Keep OS patched (`apt-get update && apt-get upgrade`).
- Rotate credentials after team changes.
- Store secrets in a secret manager when possible.
