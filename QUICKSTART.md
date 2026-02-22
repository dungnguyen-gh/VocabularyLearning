# 🚀 Railway + Netlify Quickstart (5 Minutes)

## The Absolute Minimum Steps

### 1. Create Database (2 min)
```
1. Go to https://railway.app → Login with GitHub
2. Click "New Project" → "Provision PostgreSQL"
3. Click PostgreSQL card → "Connect" tab
4. Copy "Public Network" URL
   postgresql://postgres:xxx@roundhouse.proxy.rlwy.net:xxx/railway
```

### 2. Push Code to GitHub (1 min)
```bash
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/YOURNAME/vocab-app.git
git push -u origin main
```

### 3. Deploy to Netlify (2 min)
```
1. Go to https://netlify.com → Login
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub → Select your repo
4. Build command: npm run build
5. Publish directory: .next
6. Click "Deploy site"
```

### 4. Set Environment Variables (1 min)
In Netlify Dashboard → Site settings → Environment variables:
```
DATABASE_URL=postgresql://postgres:xxx@roundhouse... (from step 1)
JWT_SECRET=ANY_RANDOM_STRING_32_CHARS_LONG
NODE_ENV=production
NEXTAUTH_URL=https://YOUR-SITE.netlify.app
```

Then trigger redeploy:
```bash
git commit --allow-empty -m "Redeploy"
git push
```

### 5. Run Migrations (Local)
```bash
# Windows PowerShell:
$env:DATABASE_URL="postgresql://postgres:xxx@roundhouse..."

# Mac/Linux:
export DATABASE_URL="postgresql://postgres:xxx@roundhouse..."

# Then:
npm install
npx prisma generate
npx prisma migrate deploy
npx ts-node --transpile-only prisma/seed.ts
```

### 6. Done! 🎉
Visit: `https://YOUR-SITE.netlify.app`

---

## 🆘 One-Command Setup (Automated)

### Windows
```bash
setup-production.bat
```

### Mac/Linux
```bash
chmod +x setup-production.sh
./setup-production.sh
```

Follow the prompts - it'll do everything above automatically!

---

## 📊 Free Tier Limits

| Service | Free Allowance |
|---------|---------------|
| Railway Postgres | 5GB, 500 hours/month |
| Netlify | 100GB bandwidth, 300 build min/month |
| **Total Cost** | **FREE** |

---

## 🔗 Important URLs

| Dashboard | URL |
|-----------|-----|
| Railway | https://railway.app/dashboard |
| Netlify | https://app.netlify.com |
| App | https://YOUR-SITE.netlify.app |

---

## ⚡ Need to Update?

Every `git push` auto-deploys!

```bash
git add .
git commit -m "Update"
git push origin main
# Netlify automatically redeploys!
```
