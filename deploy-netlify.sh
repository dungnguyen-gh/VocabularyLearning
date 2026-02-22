#!/bin/bash
set -e

echo "🚀 Netlify Deployment Helper for Mac/Linux"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
else
    echo -e "${GREEN}✓ Git already initialized${NC}"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. Have you created a PostgreSQL database? (Railway/Supabase)"
echo "2. Do you have the DATABASE_URL?"
echo "3. Have you committed all changes to git?"
echo ""

read -p "Are you ready to deploy? (y/n): " ready
if [[ $ready != "y" && $ready != "Y" ]]; then
    echo ""
    echo "Deployment cancelled. When ready, run this script again."
    exit 0
fi

echo ""
echo "🔧 Checking for Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo ""
echo "🔑 Logging into Netlify..."
netlify login

echo ""
echo "🌐 Initializing site..."
netlify init

echo ""
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Prepare for Netlify deploy" 2>/dev/null || echo "No changes to commit"
git push origin main 2>/dev/null || echo -e "${YELLOW}⚠️ Push failed or no remote set. Please push manually:${NC}\n   git push origin main"

echo ""
echo "⚙️  Setting up environment variables..."
echo ""
echo "You'll need to set these in Netlify Dashboard:"
echo "  Site settings → Environment variables"
echo ""
echo "Required variables:"
echo "  - DATABASE_URL (your PostgreSQL connection string)"
echo "  - JWT_SECRET (run: openssl rand -base64 32)"
echo "  - NODE_ENV=production"
echo "  - NEXTAUTH_URL (your Netlify site URL)"
echo ""

read -p "Enter your DATABASE_URL: " dburl
if [ ! -z "$dburl" ]; then
    netlify env:set DATABASE_URL "$dburl"
    echo -e "${GREEN}✓ DATABASE_URL set${NC}"
fi

read -p "Enter your JWT_SECRET (or press Enter to generate): " jwt
if [ -z "$jwt" ]; then
    jwt=$(openssl rand -base64 32)
fi
netlify env:set JWT_SECRET "$jwt"
echo -e "${GREEN}✓ JWT_SECRET set${NC}"

netlify env:set NODE_ENV "production"
echo -e "${GREEN}✓ NODE_ENV set${NC}"

echo ""
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --build

echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Run database migrations (see DEPLOY_NETLIFY.md)"
echo "2. Visit your site URL above"
echo "3. Test the application"
