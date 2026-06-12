#!/bin/sh
set -e

echo "🔄 Running database migrations..."
cd /app
npx prisma db push --skip-generate

echo "🌱 Checking if database needs seeding..."
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count()
  .then(c => { process.stdout.write(String(c)); p.\$disconnect(); })
  .catch(e => { console.error(e); p.\$disconnect(); process.exit(1); });
")

if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 Seeding database with demo data..."
  node /app/scripts/seed.js
  echo "✅ Seeding complete!"
else
  echo "⏭️  Database already has data ($USER_COUNT users), skipping seed."
fi

echo "🚀 Starting application..."
exec node server.js
