@echo off
chcp 65001 >nul
echo 🚀 Netlify Deployment Helper for Windows
echo =========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo 📦 Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit"
) else (
    echo ✓ Git already initialized
)

echo.
echo 📋 Pre-deployment Checklist:
echo 1. Have you created a PostgreSQL database? (Railway/Supabase)
echo 2. Do you have the DATABASE_URL?
echo 3. Have you committed all changes to git?
echo.

set /p ready="Are you ready to deploy? (y/n): "
if /i not "%ready%"=="y" (
    echo.
    echo Deployment cancelled. When ready, run this script again.
    pause
    exit /b
)

echo.
echo 🔧 Checking for Netlify CLI...
netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Netlify CLI...
    npm install -g netlify-cli
)

echo.
echo 🔑 Logging into Netlify...
netlify login

echo.
echo 🌐 Initializing site...
netlify init

echo.
echo 📤 Pushing to GitHub...
git add .
git commit -m "Prepare for Netlify deploy" 2>nul || echo No changes to commit
git push origin main 2>nul || echo (
echo ⚠️  Push failed or no remote set. Please push manually:
echo    git push origin main
)

echo.
echo ⚙️  Setting up environment variables...
echo.
echo You'll need to set these in Netlify Dashboard:
echo   Site settings → Environment variables
echo.
echo Required variables:
echo   - DATABASE_URL (your PostgreSQL connection string)
echo   - JWT_SECRET (run: openssl rand -base64 32)
echo   - NODE_ENV=production
echo   - NEXTAUTH_URL (your Netlify site URL)
echo.

set /p dburl="Enter your DATABASE_URL: "
if not "%dburl%"=="" (
    netlify env:set DATABASE_URL "%dburl%"
    echo ✓ DATABASE_URL set
)

set /p jwt="Enter your JWT_SECRET (or press Enter to generate): "
if "%jwt%"=="" (
    for /f "delims=" %%a in ('powershell -Command "[Convert]::ToBase64String((1..32 ^| ForEach-Object { Get-Random -Maximum 256 } ^| ForEach-Object { [byte]$_ }))"') do set "jwt=%%a"
)
netlify env:set JWT_SECRET "%jwt%"
echo ✓ JWT_SECRET set

netlify env:set NODE_ENV "production"
echo ✓ NODE_ENV set

echo.
echo 🚀 Deploying to Netlify...
netlify deploy --prod --build

echo.
echo =========================================
echo 🎉 Deployment Complete!
echo.
echo Next steps:
echo 1. Run database migrations (see DEPLOY_NETLIFY.md)
echo 2. Visit your site URL above
echo 3. Test the application
echo.
pause
