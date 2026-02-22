@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ========================================================
echo  🚀 Railway + Netlify Production Setup for Windows
echo ========================================================
echo.
echo This script will help you deploy your vocab app.
echo.

:: Check prerequisites
echo 📋 Checking prerequisites...

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git not found! Please install from https://git-scm.com
    pause
    exit /b 1
)
echo ✓ Git found

echo.
echo ========================================================
echo  STEP 1: Railway PostgreSQL Setup
echo ========================================================
echo.
echo Please follow these steps:
echo.
echo 1. Go to https://railway.app in your browser
echo 2. Login with GitHub
echo 3. Click "New Project" -> "Provision PostgreSQL"
echo 4. Click on the PostgreSQL card
echo 5. Click "Connect" tab
echo 6. Copy the "Public Network" connection URL
echo.
echo It looks like:
echo postgresql://postgres:PASSWORD@roundhouse.proxy.rlwy.net:PORT/railway
echo.

set /p railway_url="Paste your Railway DATABASE_URL: "

if "!railway_url!"=="" (
    echo ❌ No URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo ✅ Railway URL received!
echo.

:: Generate JWT secret
echo 🔐 Generating JWT_SECRET...
for /f "delims=" %%a in ('powershell -Command "[Convert]::ToBase64String((1..32 ^| ForEach-Object { Get-Random -Maximum 256 } ^| ForEach-Object { [byte]$_ }))"') do set "jwt_secret=%%a"
echo Generated: !jwt_secret!

echo.
echo ========================================================
echo  STEP 2: Push to GitHub
echo ========================================================
echo.

if not exist .git (
    echo 📦 Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit"
) else (
    echo ✓ Git already initialized
)

echo.
set /p github_url="Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): "

if "!github_url!"=="" (
    echo ⚠️  Skipping GitHub push. You'll need to push manually.
) else (
    git remote remove origin 2>nul
    git remote add origin !github_url!
    git add .
    git commit -m "Prepare for production" 2>nul || echo No changes to commit
    git branch -M main
    git push -u origin main
    if !errorlevel! neq 0 (
        echo ⚠️  Push failed. Please push manually:
        echo    git push origin main
    ) else (
        echo ✅ Pushed to GitHub!
    )
)

echo.
echo ========================================================
echo  STEP 3: Install Netlify CLI
echo ========================================================
echo.

where netlify >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Netlify CLI...
    npm install -g netlify-cli
) else (
    echo ✓ Netlify CLI already installed
)

echo.
echo ========================================================
echo  STEP 4: Login to Netlify
echo ========================================================
echo.
echo A browser will open. Please authorize Netlify.
echo.
netlify login

echo.
echo ========================================================
echo  STEP 5: Initialize Netlify Site
echo ========================================================
echo.
echo Follow the prompts:
echo - Choose "Create & configure a new site"
echo - Select your team
echo - Enter a site name (or press Enter for random)
echo - Build command: npm run build (default)
echo - Publish directory: .next (default)
echo.
pause
netlify init

echo.
echo ========================================================
echo  STEP 6: Set Environment Variables
echo ========================================================
echo.

netlify env:set DATABASE_URL "!railway_url!"
echo ✅ DATABASE_URL set

netlify env:set JWT_SECRET "!jwt_secret!"
echo ✅ JWT_SECRET set

netlify env:set NODE_ENV "production"
echo ✅ NODE_ENV set

:: Get site URL
for /f "tokens=*" %%a in ('netlify status ^| findstr "Site URL"') do (
    set "site_url=%%a"
    set "site_url=!site_url:Site URL: =!"
)

if not "!site_url!"=="" (
    netlify env:set NEXTAUTH_URL "!site_url!"
    echo ✅ NEXTAUTH_URL set to !site_url!
)

echo.
echo ========================================================
echo  STEP 7: Deploy to Netlify
echo ========================================================
echo.
netlify deploy --prod --build

echo.
echo ========================================================
echo  STEP 8: Run Database Migrations
echo ========================================================
echo.
echo Installing dependencies...
call npm install

echo Generating Prisma client...
call npx prisma generate

echo Running migrations...
set "DATABASE_URL=!railway_url!"
call npx prisma migrate deploy

echo Seeding database...
call npx ts-node --transpile-only prisma/seed.ts

echo.
echo ========================================================
echo  🎉 SETUP COMPLETE!
echo ========================================================
echo.
echo Your app should be live at:
echo !site_url!
echo.
echo Next steps:
echo 1. Visit the URL above
echo 2. Test the app: select topic -> study -> quiz
echo 3. If you see errors, check Netlify function logs
echo.
echo 📊 Dashboard Links:
echo - Railway: https://railway.app/dashboard
echo - Netlify: https://app.netlify.com
echo.
pause
