# 🚀 Complete Railway + Netlify Production Setup

## PART 1: Railway PostgreSQL Setup

### 1.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start for Free"** (pink button)
3. Choose **"Continue with GitHub"**
4. Authorize Railway to access your GitHub account

### 1.2 Create PostgreSQL Database

1. In Railway Dashboard, click **"New Project"**
2. Click **"Provision PostgreSQL"** (orange database icon)
3. Wait 10-20 seconds for database to provision

**Your database is now created!**

### 1.3 Get Database Connection URL

1. Click on the **PostgreSQL card** in your project
2. Click the **"Connect"** tab
3. Find **"Public Network"** section
4. Copy the connection string:
   ```
   postgresql://postgres:PASSWORD@roundhouse.proxy.rlwy.net:PORT/railway
   ```

**🔐 IMPORTANT:** This URL contains your password. Keep it secret!

5. **Save this URL** - you'll need it for Netlify

### 1.4 (Optional) Add Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project (optional)
railway link
```

---

## PART 2: Prepare Your Code

### 2.1 Push to GitHub

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for production"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/vocab-learning-app.git

# Push
git push -u origin main
```

### 2.2 Verify Project Structure

Your project should have:
```
├── netlify.toml          ✓ Build config
├── prisma/
│   ├── schema.prisma     ✓ Database schema
│   └── seed.ts           ✓ Vocabulary data
├── src/
│   ├── pages/            ✓ Next.js pages
│   └── ...
└── package.json          ✓ Dependencies
```

---

## PART 3: Deploy to Netlify

### 3.1 Method A: Netlify Web UI (Recommended for beginners)

1. Go to [netlify.com](https://netlify.com) and login
2. Click **"Add new site"** (green button)
3. Select **"Import an existing project"**
4. Choose **Git provider: GitHub**
5. Authorize Netlify if prompted
6. Find and select your `vocab-learning-app` repository
7. Configure build settings:
   - **Branch to deploy:** `main`
   - **Base directory:** (leave blank)
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
8. Click **"Deploy site"**

**⏱️ First deploy will take 2-3 minutes**

### 3.2 Method B: Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login
# This opens browser - authorize Netlify

# Initialize your site
netlify init
# Choose:
# - "Create & configure a new site"
# - Select your team
# - Enter site name: vocab-learning-app (or your choice)
# - Build command: npm run build
# - Publish directory: .next

# First deploy
netlify deploy --prod --build
```

---

## PART 4: Connect Railway DB to Netlify

### 4.1 Add Environment Variables in Netlify

1. In Netlify Dashboard, go to **Site settings**
2. Left sidebar → **Environment variables**
3. Click **"Add a variable"** → **"Add multiple"**
4. Add these variables one by one:

#### Variable 1: DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** Paste your Railway connection string
  ```
  postgresql://postgres:xxxx@roundhouse.proxy.rlwy.net:xxxxx/railway
  ```

#### Variable 2: JWT_SECRET
Generate a secure secret:
```bash
# Mac/Linux:
openssl rand -base64 32

# Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```
- **Key:** `JWT_SECRET`
- **Value:** (paste the generated string)

#### Variable 3: NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`

#### Variable 4: NEXTAUTH_URL
- **Key:** `NEXTAUTH_URL`
- **Value:** Your Netlify site URL (e.g., `https://vocab-learning-app.netlify.app`)
  - You can find this in Netlify Dashboard → Site settings → Site details

### 4.2 Re-deploy After Adding Env Vars

Netlify doesn't auto-redeploy when you change env vars, so:

1. Go to **Deploys** in Netlify Dashboard
2. Find latest deploy
3. Click **"Retry deploy"** → **"Deploy site"**

OR trigger a new deploy:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## PART 5: Run Database Migrations

This creates tables in your Railway PostgreSQL database.

### 5.1 Method A: Local with Remote DB (Recommended)

```bash
# Set the Railway database URL temporarily
# Windows CMD:
set DATABASE_URL=postgresql://postgres:xxxx@roundhouse.proxy.rlwy.net:xxxxx/railway

# Windows PowerShell:
$env:DATABASE_URL="postgresql://postgres:xxxx@roundhouse.proxy.rlwy.net:xxxxx/railway"

# Mac/Linux:
export DATABASE_URL="postgresql://postgres:xxxx@roundhouse.proxy.rlwy.net:xxxxx/railway"

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate deploy

# Seed database with vocabulary
npx ts-node --transpile-only prisma/seed.ts
```

**✅ Success output:**
```
✓ Database migrated
Seeded 44 vocabulary items
```

### 5.2 Method B: Using Railway CLI

```bash
# Login and link
railway login
railway link

# Open Railway shell (runs commands in Railway environment)
railway run npx prisma migrate deploy
railway run npx ts-node --transpile-only prisma/seed.ts
```

### 5.3 Verify Database Connection

```bash
# Open Prisma Studio to verify data
npx prisma studio
```

This opens a visual database viewer at `http://localhost:5555`
- You should see tables: User, Vocabulary, QuizResult, Progress
- Vocabulary table should have 44 rows

---

## PART 6: Verify Production Deployment

### 6.1 Check Site Loads

1. Go to your Netlify site URL: `https://YOUR-SITE.netlify.app`
2. You should see the landing page with 4 topics

### 6.2 Test Full Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Travel" topic | Topic selected (highlighted) |
| 2 | Select "Easy" difficulty | Difficulty selected |
| 3 | Click "Start Learning" | Navigate to study page |
| 4 | Click "Show Meaning" | Reveal meaning & example |
| 5 | Click "Next" or "Start Quiz" | Navigate to quiz page |
| 6 | Answer all questions | Submit button activates |
| 7 | Click "Submit Answers" | See score & corrections |

### 6.3 Check for Errors

If something doesn't work, check logs:

**Netlify Function Logs:**
1. Netlify Dashboard → **Functions**
2. Click on a function (e.g., `___netlify-handler`)
3. Check **Function logs** tab

**Build Logs:**
1. Netlify Dashboard → **Deploys**
2. Click on latest deploy
3. Check **Build log**

---

## PART 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. Netlify Dashboard → **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `vocab.yourdomain.com`)
4. Follow DNS instructions:
   - Add CNAME record pointing to your Netlify site
   - Or use Netlify DNS

### 7.2 Update NEXTAUTH_URL

If you add a custom domain:

1. Go back to **Environment variables**
2. Update `NEXTAUTH_URL` to your custom domain
3. Re-deploy

---

## 🛠️ Troubleshooting Common Issues

### Issue: "Database connection failed"

**Symptoms:** API calls return 500 error

**Solutions:**
1. Check DATABASE_URL is correct (no typos)
2. Verify Railway database is running (Dashboard → green dot)
3. Ensure using **Public Network** URL (not private)
4. Check Railway logs: Railway Dashboard → PostgreSQL → Logs

### Issue: "Prisma Client not found"

**Symptoms:** Build fails with Prisma errors

**Solutions:**
```bash
# Ensure netlify.toml has build command that generates Prisma
# Check your netlify.toml:
```

Add to `netlify.toml`:
```toml
[build]
  command = "npx prisma generate && npm run build"
```

### Issue: "404 on API routes"

**Symptoms:** API calls return 404

**Solutions:**
1. Check `@netlify/plugin-nextjs` is in devDependencies
2. Verify `netlify.toml` has correct redirect rules
3. Check Functions tab in Netlify - should show deployed functions

### Issue: "Tables don't exist"

**Symptoms:** "relation does not exist" error

**Solution:** Run migrations (Step 5)
```bash
export DATABASE_URL="your-railway-url"
npx prisma migrate deploy
```

### Issue: "No vocabulary loaded"

**Symptoms:** Study page shows "No vocabulary found"

**Solution:** Run seed script
```bash
export DATABASE_URL="your-railway-url"
npx ts-node --transpile-only prisma/seed.ts
```

---

## 📊 Monitoring & Maintenance

### Railway Dashboard
- **URL:** https://railway.app
- **Monitor:** Database storage, connection count
- **Free tier:** 5GB storage, 500 hours/month (~21 days continuous)

### Netlify Dashboard
- **URL:** https://netlify.com
- **Monitor:** Bandwidth, build minutes, function invocations
- **Free tier:** 100GB bandwidth, 300 build minutes/month

### Prisma Studio (Database Admin)
```bash
export DATABASE_URL="your-railway-url"
npx prisma studio
```

---

## 🔄 Continuous Deployment

Once set up, every push to `main` automatically deploys:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Netlify automatically:
# 1. Detects push
# 2. Builds the app
# 3. Runs Prisma generate
# 4. Deploys to production
```

---

## 🎉 You're Done!

Your vocabulary learning app is now live at:
```
https://YOUR-SITE.netlify.app
```

**Next steps:**
- Share the URL with friends
- Register an account to track progress
- Build up your XP and streak!

**Need help?**
- Check Railway docs: https://docs.railway.app
- Check Netlify docs: https://docs.netlify.com
- Check Next.js on Netlify: https://docs.netlify.com/integrations/frameworks/next-js
