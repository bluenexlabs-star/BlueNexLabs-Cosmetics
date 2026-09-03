#!/usr/bin/env bash
# Idempotent Cloud Agent setup for the BlueNex Labs Next.js + Prisma app.
# Uses a local SQLite database so no external services are required for development.
set -euo pipefail

cd "$(dirname "$0")/.."

npm ci

# Create a local .env with demo (non-secret) values if one is not already present.
# These match the demo credentials documented in README.md and are for local dev only.
if [ ! -f .env ]; then
  SECRET="$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'))")"
  cat > .env <<EOF
DATABASE_URL="file:./dev.db"
SESSION_SECRET="${SECRET}"
ADMIN_EMAIL="admin@bluenexlabs.com"
ADMIN_PASSWORD="bluenex-admin-2026"
REQUIRE_CUSTOMER_ACCOUNT="false"
INTERAC_EMAIL="BlueNexLabs@gmail.com"
NEXT_PUBLIC_SITE_URL="http://localhost:43123"
EOF
fi

# Apply migrations, generate the Prisma client, and seed the catalog + demo users.
npx prisma migrate deploy
npx prisma generate
npm run db:seed
