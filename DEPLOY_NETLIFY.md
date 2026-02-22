# 🚀 Deploy to Netlify - Complete Guide

## Overview
Netlify hosts the Next.js frontend + API routes, but you'll need an external PostgreSQL database.

---

## Step 1: Create PostgreSQL Database

### Option A: Railway (Easiest) ⭐

1. Go to [railway.app](https://railway.app) and login with GitHub
2. Click **"New Project"** → **"Provision PostgreSQL"**
3. Wait for database to be ready
4. Click on the PostgreSQL card → **"Connect"** tab
5. Copy the **"Public Network"** connection URL:
   ```
   postgresql://postgres:xxxxx@roundhouse.proxy.rlwy.net:12345/railway
   ```
6. **Save this URL** - you'll need it in Step 4

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and create account
2. Click **"New Project"**
3. Choose organization, name your project, set password
4. Wait for project setup (2-3 minutes)
5. Go to **Project Settings** → **Database** → **Connection String**
6. Copy the **URI** connection string
7. **Save this URL** - you'll need it in Step 4

---

## Step 2: Push Code to GitHub

```bash
# If not already in git
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/vocab-learning-app.git
git branch -M main
git push -u origin main
```

---

## Step 3: Connect to Netlify

### Method A: Netlify UI (Easiest)

1. Go to [netlify.com](https://netlify.com) and login
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and authorize Netlify
4. Select your `vocab-learning-app` repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Click **"Deploy site"**

### Method B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init
# Select "Create & configure a new site"
# Choose your team
# Enter site name (e.g., "vocab-learning-app")

# Deploy
netlify deploy --prod
```

---

## Step 4: Configure Environment Variables

In Netlify Dashboard:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** → **"Add multiple"**
3. Add these variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres:xxxxx@host:port/database` (from Step 1) |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` |
| `NODE_ENV` | `production` |
| `NEXTAUTH_URL` | `https://your-site-name.netlify.app` |

**Generate JWT Secret:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

---

## Step 5: Run Database Migrations

After first deploy, you need to set up the database schema:

### Option A: Local with Remote DB
```bash
# Set your Railway/Supabase URL temporarily
export DATABASE_URL="postgresql://postgres:xxxxx@host:port/database"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx ts-node --transpile-only prisma/seed.ts
```

### Option B: Using Netlify CLI (One-time)
```bash
# Run a one-off command on Netlify
netlify env:set DATABASE_URL "your-database-url"

# Then trigger a rebuild which will run migrations
netlify deploy --prod --build
```

---

## Step 6: Verify Deployment

1. **Visit your site:** `https://your-site-name.netlify.app`
2. **Test the flow:**
   - Select a topic → Difficulty → Start Learning
   - Browse vocab cards
   - Take quiz
   - Check results

3. **Check Functions logs** (if issues):
   - Netlify Dashboard → **Functions** → **Function logs**
   - Look for any errors

---

## 🔧 Troubleshooting

### Issue: "Prisma Client not found"
**Solution:** Make sure `npx prisma generate` runs during build. Check `netlify.toml` is correct.

### Issue: "Database connection failed"
**Solution:** 
- Verify `DATABASE_URL` is set correctly
- Check database allows connections from anywhere (IP whitelist)
- For Railway: use Public Network URL
- For Supabase: use Session/Transaction pooler for serverless

### Issue: "Build failed"
**Solution:**
```bash
# Check build locally first
npm run build

# Check Netlify build logs in Dashboard
```

### Issue: "API routes not working"
**Solution:**
- Ensure `@netlify/plugin-nextjs` is in devDependencies
- Check `netlify.toml` configuration
- Verify functions are detected in deploy log

---

## 📋 Pre-Deployment Checklist

- [ ] Database created (Railway/Supabase)
- [ ] Database URL copied
- [ ] Code pushed to GitHub
- [ ] Site imported to Netlify
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Site is live and functional

---

## 🔄 Continuous Deployment

Once set up, every `git push` to `main` branch will auto-deploy!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Netlify automatically builds and deploys!
```

---

## 💰 Costs

| Service | Free Tier |
|---------|-----------|
| Netlify | 100GB bandwidth, 300 build minutes/mo |
| Railway Postgres | 5GB storage, 500 hours/mo |
| Supabase | 500MB storage, 2GB bandwidth |

**Total: FREE** for small to medium usage!

---

## 🆘 Need Help?

1. Check **Netlify Function Logs**: Dashboard → Functions → Logs
2. Check **Build Logs**: Dashboard → Deploys → Click deploy → Build log
3. Test database connection locally first
4. Verify all env vars are set correctly