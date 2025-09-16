# 🚀 HŠL Deployment Guide

## Quick Vercel Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js and configure build settings

### 3. Add Database (Choose One)

#### Option A: Vercel Postgres (Recommended)
1. In Vercel dashboard → Storage → Create Database → Postgres
2. Copy the `DATABASE_URL` to Environment Variables
3. Deploy

#### Option B: Supabase (Free Tier)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get PostgreSQL connection string from Settings → Database
4. Add to Vercel Environment Variables as `DATABASE_URL`

### 4. Environment Variables in Vercel
Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://your_connection_string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-chars
```

### 5. Setup Database After First Deploy
Run this in Vercel's Terminal or locally:
```bash
./scripts/deploy-db.sh
```

Or manually:
```bash
npx prisma migrate deploy
npm run db:seed
```

## 🎯 What You'll Get

After deployment with database setup:
- ✅ **12 Czech teams** (DC Stop Chropyně, Rychlí šneci Vlkoš, etc.)
- ✅ **86 players** with team assignments
- ✅ **Active 2024/2025 season**
- ✅ **Match wizard** for entering results
- ✅ **Real-time standings** and statistics
- ✅ **Authentication system** for captains
- ✅ **PWA support** for mobile devices

## 📱 Features Ready to Use

1. **Match Entry**: Captains can input match results
2. **Statistics**: Automatic BPI calculations
3. **Standings**: Real-time league table
4. **Player Profiles**: Individual statistics
5. **Team Pages**: Squad management
6. **Authentication**: Role-based access (admin, kapitán, hráč)

## 🔧 Local Development Commands

```bash
# Start development server
npm run dev

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed with teams/players
npm run db:studio      # Open Prisma Studio
npm run db:reset       # Reset database

# Build for production
npm run build
npm start
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly formatted
- Check database is accessible from Vercel
- Verify migrations ran: `npx prisma migrate status`

### Build Failures
- Check all environment variables are set
- Ensure Node.js version compatibility (18+)
- Clear `.next` cache: `rm -rf .next`

## 📞 Support

The application is ready for production use with all Czech Hospodská Šipková Liga teams and players pre-configured!