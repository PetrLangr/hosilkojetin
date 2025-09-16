#!/bin/bash

# Database deployment script for production
echo "🚀 Setting up database for production deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📊 Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database with initial data..."
npm run db:seed

echo "✅ Database setup completed successfully!"
echo "🎯 Your HŠL application is ready with:"
echo "   - 12 Czech teams"
echo "   - 86 players"
echo "   - 1 active season"
echo "   - Ready for match results input"