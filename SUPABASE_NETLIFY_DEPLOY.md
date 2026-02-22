# 🚀 Complete Deployment Guide: Supabase + Netlify

This guide walks you through deploying the Vocabulary Learning app using **Supabase** (PostgreSQL database) and **Netlify** (frontend hosting).

---

## 📋 Table of Contents

1. [Cleanup Railway (Remove Old Setup)](#part-1-cleanup-railway)
2. [Create Supabase Database](#part-2-create-supabase-database)
3. [Deploy to Netlify](#part-3-deploy-to-netlify)
4. [Run Database Migrations](#part-4-run-database-migrations)
5. [Configure NEXTAUTH_URL](#part-5-configure-nextauth_url)
6. [Test Your App](#part-6-test-your-app)
7. [Troubleshooting](#troubleshooting)

---

## Part 1: Cleanup Railway

### 1.1 Uninstall Railway CLI from Your Computer

**Windows PowerShell:**
```powershell
# Uninstall Railway CLI
npm uninstall -g @railway/cli

# Remove Railway config files
Remove-Item -Recurse -Force "$env:USERPROFILE\.railway" -ErrorAction SilentlyContinue
```

**Mac/Linux Terminal:**
```bash
# Uninstall Railway CLI
npm uninstall -g @railway/cli

# Remove Railway config
rm -rf ~/.railway
```

### 1.2 Delete Railway Project

1. Go to https://railway.app/dashboard
2. Click on your **vocabularylearning** project
3. Click **Settings** (gear icon)
4. Scroll to **Danger Zone** 🔴
5. Click **"Delete Project"**
6. Type project name to confirm
7. Click **"Delete"**

### 1.3 Revoke Railway GitHub Access

1. Go to https://github.com/settings/applications
2. Find **"Railway"** in the list
3. Click **"Revoke"**

---

## Part 2: Create Supabase Database

### 2.1 Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with **GitHub**
4. Verify your email

### 2.2 Create New Project

1. In Supabase Dashboard, click **"New Project"**
2. Fill in details:
   - **Organization:** (Your GitHub username)
   - **Project name:** `vocab-learning`
   - **Database Password:** Create a strong password 🔐 (SAVE THIS!)
   - **Region:** Choose closest to your users
     - `Southeast Asia (Singapore)` - for Asia
     - `East US (N. Virginia)` - for US East
     - `West US (Oregon)` - for US West
     - `West Europe (Frankfurt)` - for Europe

3. Click **"Create new project"**
4. ⏱️ Wait 2-3 minutes for the database to be provisioned

### 2.3 Get Database Connection URL

1. In your project dashboard, click **⚙️ Project Settings** (gear icon at bottom left)
2. Click **"Database"** tab
3. Scroll to **"Connection String"** section
4. Click **"URI"** tab
5. You will see:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. **Copy this URL and replace `[YOUR-PASSWORD]` with your actual password**

**Example final URL:**
```
postgresql://postgres:MySecretPassword123@db.abc123xyz456789.supabase.co:5432/postgres
```

7. **SAVE THIS URL!** You will need it for Netlify deployment.

> ⚠️ **Important:** Never share this URL publicly - it contains your database password!

---

## Part 3: Deploy to Netlify

### 3.1 Create Netlify Account

1. Go to https://netlify.com
2. Click **"Sign up"**
3. Choose **"Continue with GitHub"**

### 3.2 Import Your GitHub Repository

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"** and authorize Netlify
4. Find and select your repository: `dungnguyen-gh/VocabularyLearning`
5. Click **"Import"**

### 3.3 Configure Build Settings

1. **Branch to deploy:** `main`
2. **Base directory:** (leave blank)
3. **Build command:** 
   ```
   npx prisma generate && npm run build
   ```
4. **Publish directory:** `.next`

### 3.4 Add Environment Variables

Click **"Show advanced"** button, then **"New variable"**:

| Key | Value | Example |
|-----|-------|---------|
| `DATABASE_URL` | Your Supabase connection URL | `postgresql://postgres:MyPass@db.xxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | A random secret string | `U29tZVJhbmRvbVNlY3JldEtleQ` |
| `NODE_ENV` | `production` | `production` |

**Generate your own JWT_SECRET (optional but recommended):**

```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))

# Mac/Linux
openssl rand -base64 32
```

### 3.5 Deploy

1. Click **"Deploy site"**
2. ⏱️ Wait 3-4 minutes for the build to complete
3. You will get a URL like:
   ```
   https://vocab-learning-abc123.netlify.app
   ```

### Alternative: Deploy using Netlify CLI

If you prefer command line:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init
# Choose: "Create & configure a new site"
# Select your team
# Enter site name: vocab-learning (or any name)

# Set environment variables
netlify env:set DATABASE_URL "postgresql://postgres:YOUR_PASS@db.xxx.supabase.co:5432/postgres"
netlify env:set JWT_SECRET "U29tZVJhbmRvbVNlY3JldEtleQ"
netlify env:set NODE_ENV "production"

# Deploy
netlify deploy --prod --build
```

---

## Part 4: Run Database Migrations

After Netlify deploy succeeds, you need to create database tables and seed data.

### 4.1 Open Terminal in Your Project

```powershell
cd D:\Unity\WebDevelopment\QuizWeb
```

### 4.2 Set Environment Variable

**Windows PowerShell:**
```powershell
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
```

**Windows CMD:**
```cmd
set DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
```

**Mac/Linux:**
```bash
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
```

> Replace `YOUR_PASSWORD` and `db.xxx.supabase.co` with your actual values!

### 4.3 Install Dependencies

```bash
npm install
```

### 4.4 Generate Prisma Client

```bash
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client
```

### 4.5 Run Database Migrations

```bash
npx prisma migrate deploy
```

**Expected output:**
```
Prisma Migrate created the following migration:
prisma/migrations/xxxxxxxx_init
✔ Database migrated
```

### 4.6 Seed Database with Vocabulary

```bash
npx ts-node --transpile-only prisma/seed.ts
```

**Expected output:**
```
Start seeding...
Seeded 47 vocabulary items
```

### 4.7 Verify Data (Optional)

```bash
npx prisma studio
```

This opens a database viewer at `http://localhost:5555`
- You should see tables: User, Vocabulary, QuizResult, Progress
- Vocabulary table should have 47 rows

---

## Part 5: Configure NEXTAUTH_URL

### 5.1 Get Your Netlify URL

From the Netlify dashboard or your browser, copy your site URL:
```
https://vocab-learning-abc123.netlify.app
```

### 5.2 Add to Environment Variables

1. Go to https://app.netlify.com
2. Click your site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"**
5. Add:
   - **Key:** `NEXTAUTH_URL`
   - **Value:** `https://vocab-learning-abc123.netlify.app` (your actual URL)
6. Click **"Save"**

### 5.3 Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

OR push an empty commit:
```bash
git commit --allow-empty -m "Trigger redeploy with NEXTAUTH_URL"
git push origin main
```

---

## Part 6: Test Your App! 🎉

### 6.1 Visit Your Live Site

Open your Netlify URL in browser:
```
https://vocab-learning-abc123.netlify.app
```

### 6.2 Test the Full Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click a topic (Travel, Business, Technology, Daily Life) | Topic selected |
| 2 | Select difficulty (Easy, Medium, Hard) | Difficulty selected |
| 3 | Click **"Start Learning"** | Navigate to study page |
| 4 | See vocabulary card | Word displayed |
| 5 | Click **"Show Meaning"** | Meaning + example shown |
| 6 | Click **"Next"** or **"Start Quiz"** | Navigate to quiz |
| 7 | Answer questions | Answers recorded |
| 8 | Click **"Submit Answers"** | Score displayed |

### 6.3 Success! ✅

If all steps work, your app is fully deployed!

---

## 🔄 Continuous Deployment

Every time you push code to GitHub, Netlify automatically rebuilds and deploys:

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

Netlify will:
1. Detect the push
2. Pull latest code
3. Run build: `npx prisma generate && npm run build`
4. Deploy new version

**No manual steps needed!**

---

## Troubleshooting

### Issue: "Database connection failed"

**Cause:** Wrong DATABASE_URL

**Solution:**
1. Verify URL format: `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres`
2. Check password is correct
3. Ensure no extra spaces in the URL
4. In Netlify: Site settings → Environment variables → verify value

### Issue: "No vocabulary found"

**Cause:** Database not seeded

**Solution:**
Run migrations again:
```powershell
$env:DATABASE_URL="your-supabase-url"
npx prisma migrate deploy
npx ts-node --transpile-only prisma/seed.ts
```

### Issue: "Build failed" in Netlify

**Cause:** Build command incorrect

**Solution:**
1. Netlify Dashboard → Site settings → Build & deploy
2. Build command should be: `npx prisma generate && npm run build`
3. Publish directory: `.next`
4. Trigger redeploy

### Issue: "404 on API routes"

**Cause:** Next.js API routes not configured

**Solution:**
Ensure `netlify.toml` has `@netlify/plugin-nextjs` plugin installed.

### Issue: "Tables don't exist"

**Cause:** Migrations not run

**Solution:**
```bash
npx prisma migrate deploy
```

---

## 📊 Dashboard Links

| Service | URL | Purpose |
|---------|-----|---------|
| Netlify | https://app.netlify.com | Manage site, view logs, configure |
| Supabase | https://app.supabase.com | Database management, view data |
| Your App | https://vocab-learning-xxx.netlify.app | Live application |

---

## 💰 Free Tier Limits

| Service | Free Allowance |
|---------|---------------|
| **Supabase** | 500MB database, 2GB bandwidth |
| **Netlify** | 100GB bandwidth, 300 build minutes/month |
| **Total Cost** | **FREE** |

---

## 🆘 Getting Help

If you encounter issues:

1. Check Netlify build logs: Dashboard → Deploys → Click failed deploy
2. Check Supabase connection: Supabase Dashboard → Database → Connection Pooling
3. Verify environment variables are set correctly
4. Test database connection locally first

---

## ✅ Quick Reference Commands

```bash
# Uninstall Railway
npm uninstall -g @railway/cli

# Install Netlify CLI
npm install -g netlify-cli

# Set database URL (PowerShell)
$env:DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"

# Database commands
npx prisma generate        # Generate Prisma client
npx prisma migrate deploy  # Run migrations
npx ts-node --transpile-only prisma/seed.ts  # Seed data
npx prisma studio          # View database GUI

# Netlify commands
netlify login              # Login to Netlify
netlify env:list           # List environment variables
netlify deploy --prod      # Deploy to production
```

---

**You're all set! Good luck with your deployment! 🚀**
