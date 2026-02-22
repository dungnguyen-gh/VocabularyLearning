#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🚀 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database (if needed)..."
npx ts-node --transpile-only prisma/seed.ts || echo "Seed completed or already exists"

echo "🏗️ Building Next.js app..."
npm run build

echo "✅ Build complete!"
