#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  🚀 Railway + Netlify Production Setup${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found! Please install from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found! Please install from https://git-scm.com${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git found${NC}"

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  STEP 1: Railway PostgreSQL Setup${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Go to https://railway.app in your browser"
echo "2. Login with GitHub"
echo "3. Click 'New Project' -> 'Provision PostgreSQL'"
echo "4. Click on the PostgreSQL card"
echo "5. Click 'Connect' tab"
echo "6. Copy the 'Public Network' connection URL"
echo ""
echo "It looks like:"
echo "postgresql://postgres:PASSWORD@roundhouse.proxy.rlwy.net:PORT/railway"
echo ""

read -p "Paste your Railway DATABASE_URL: " railway_url

if [ -z "$railway_url" ]; then
    echo -e "${RED}❌ No URL provided. Exiting.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Railway URL received!${NC}"
echo ""

# Generate JWT secret
echo -e "${YELLOW}🔐 Generating JWT_SECRET...${NC}"
jwt_secret=$(openssl rand -base64 32)
echo "Generated: $jwt_secret"

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  STEP 2: Push to GitHub${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""

if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
else
    echo -e "${GREEN}✓ Git already initialized${NC}"
fi

echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " github_url

if [ -z "$github_url" ]; then
    echo -e "${YELLOW}⚠️  Skipping GitHub push. You'll need to push manually.${NC}"
else
    git remote remove origin 2>/dev/null || true
    git remote add origin "$github_url"
    git add .
    git commit -m "Prepare for production" 2>/dev/null || echo "No changes to commit"
    git branch -M main
    git push -u origin main || {
        echo -e "${YELLOW}⚠️  Push failed. Please push manually:${NC}"
        echo "   git push origin main"
    }
fi

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  STEP 3: Install Netlify CLI${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""

if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}Installing Netlify CLI...${NC}"
    npm install -g netlify-cli
else
    echo -e "${GREEN}✓ Netlify CLI already installed${NC}"
fi

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  STEP 4: Login to Netlify${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""
echo "A browser will open. Please authorize Netlify."
echo ""
netlify login

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  STEP 5: Initialize Netlify Site${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""
echo "Follow the prompts:"
echo "- Choose 'Create & configure a new site'"
echo "- Select your team"
echo "- Enter a site name (or press Enter for random)"
echo "- Build command: npm run build (default)"
echo "- Publish directory: .next (default)"
echo ""
read -p "Press Enter to continue..."
netlify init

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  STEP 6: Set Environment Variables${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""

netlify env:set DATABASE_URL "$railway_url"
echo -e "${GREEN}✅ DATABASE_URL set${NC}"

netlify env:set JWT_SECRET "$jwt_secret"
echo -e "${GREEN}✅ JWT_SECRET set${NC}"

netlify env:set NODE_ENV "production"
echo -e "${GREEN}✅ NODE_ENV set${NC}"

# Get site URL
site_url=$(netlify status | grep "Site URL" | sed 's/Site URL: //' | tr -d ' ')

if [ ! -z "$site_url" ]; then
    netlify env:set NEXTAUTH_URL "$site_url"
    echo -e "${GREEN}✅ NEXTAUTH_URL set to $site_url${NC}"
fi

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  STEP 7: Deploy to Netlify${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""
netlify deploy --prod --build

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  STEP 8: Run Database Migrations${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

echo -e "${YELLOW}Running migrations...${NC}"
export DATABASE_URL="$railway_url"
npx prisma migrate deploy

echo -e "${YELLOW}Seeding database...${NC}"
npx ts-node --transpile-only prisma/seed.ts

echo ""
echo -e "${GREEN}========================================================${NC}"
echo -e "${GREEN}  🎉 SETUP COMPLETE!${NC}"
echo -e "${GREEN}========================================================${NC}"
echo ""
echo "Your app should be live at:"
echo "$site_url"
echo ""
echo "Next steps:"
echo "1. Visit the URL above"
echo "2. Test the app: select topic -> study -> quiz"
echo "3. If you see errors, check Netlify function logs"
echo ""
echo "📊 Dashboard Links:"
echo "- Railway: https://railway.app/dashboard"
echo "- Netlify: https://app.netlify.com"
