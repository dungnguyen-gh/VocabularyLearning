# 🚀 Deploy to Railway (App + Database Together)

## Why Railway?
- One platform for app + database
- Automatic GitHub integration
- Easier environment variable management
- Database and app connect automatically

---

## Step 1: Create Project from GitHub

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select: `dungnguyen-gh/VocabularyLearning`
4. Click **"Add Variables"**:

```
JWT_SECRET = (generate: openssl rand -base64 32)
NODE_ENV = production
```

5. Click **"Deploy"**

---

## Step 2: Add PostgreSQL Database

1. In your Railway project dashboard, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait for database to provision (30 seconds)

---

## Step 3: Connect Database to App

1. Click on your **app service** (the one running Next.js)
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Name: `DATABASE_URL`
5. Click **"Add Reference"**
6. Select your **PostgreSQL** service
7. Select **DATABASE_URL**
8. Click **"Add"**

---

## Step 4: Run Database Migrations

1. Click on your **app service**
2. Go to **"Deployments"** tab
3. Click **"Open Console"** button
4. Run these commands:

```bash
npx prisma migrate deploy
npx ts-node --transpile-only prisma/seed.ts
```

You should see:
```
✓ Database migrated
Seeded 44 vocabulary items
```

---

## Step 5: Update NEXTAUTH_URL

1. Click on your **app service**
2. Go to **"Settings"** tab
3. Copy your domain: `https://xxxx.up.railway.app`
4. Go to **"Variables"** tab
5. Add new variable:
   - Name: `NEXTAUTH_URL`
   - Value: Your Railway domain

---

## Step 6: Done! 🎉

Your app is live at: `https://xxxx.up.railway.app`

Test it:
1. Choose topic
2. Select difficulty
3. Study vocabulary
4. Take quiz

---

## Continuous Deployment

Every time you push to GitHub main branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway automatically:
1. Pulls latest code
2. Builds the app
3. Deploys new version

No manual steps needed!

---

## Useful Commands

### View Logs
Railway Dashboard → App Service → Deployments → View Logs

### Restart App
Railway Dashboard → App Service → "Restart" button

### Open Database Console
Railway Dashboard → PostgreSQL → "Connect" tab

---

## Troubleshooting

### "Database connection failed"
- Check DATABASE_URL is set correctly
- Ensure you're using "Add Reference" not typing URL manually

### "Tables don't exist"
- Run migrations again: `npx prisma migrate deploy`

### "No vocabulary found"
- Run seed again: `npx ts-node --transpile-only prisma/seed.ts`

### Need to reset database?
Railway Dashboard → PostgreSQL → "Destroy" (WARNING: deletes all data!)
Then create new PostgreSQL and re-run migrations.
