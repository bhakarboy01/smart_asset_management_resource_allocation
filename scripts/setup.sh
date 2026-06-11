#!/bin/bash
set -e

echo "🚀 Setting up Sampadaa..."

# Check Node.js version
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
  echo "⚠️  Please edit .env and set JWT_SECRET and SESSION_SECRET"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "🗄️  Creating database schema..."
npx prisma db push

# Seed demo data
echo "🌱 Seeding demo data..."
npx tsx scripts/seed.ts

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Start the app:"
echo "   npm run dev"
echo ""
echo "🔐 Demo credentials:"
echo "   Admin: admin@sampadaa.in / Admin@1234"
echo "   User:  rahul@sampadaa.in / User@1234"
echo ""
echo "🌐 Open: http://localhost:3000"
