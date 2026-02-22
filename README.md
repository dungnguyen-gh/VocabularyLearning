# Vocabulary Learning Game

An interactive English vocabulary learning web application with gamified quizzes and progress tracking.

## Features

- **Topic-based Learning**: Choose from Travel, Business, Technology, and Daily Life topics
- **Difficulty Levels**: Easy, Medium, and Hard vocabularies
- **Study Mode**: Browse vocabulary with word, pronunciation, meaning, and example sentences
- **Quiz Mode**: Test your knowledge with multiple-choice and fill-in-the-blank questions
- **Progress Tracking**: Track XP, streaks, and identify weak words
- **Gamification**: Earn XP points and bonus for perfect scores

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT with HttpOnly cookies
- **Testing**: Jest + Supertest
- **Infrastructure**: Docker + Docker Compose

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Copy environment file
cp .env.example .env

# Start all services (Postgres + App)
docker-compose up -d

# App will be available at http://localhost:3000
```

### Option 2: Local Development

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start Postgres (requires Docker)
docker-compose up -d postgres

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev --name init

# 6. Seed database
npx ts-node --transpile-only prisma/seed.ts

# 7. Start development server
npm run dev

# App will be available at http://localhost:3000
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vocab_db?schema=public"

# JWT Secret (change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# App URL
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth?action=register` | Register new user |
| POST | `/api/auth?action=login` | Login user |
| POST | `/api/auth?action=logout` | Logout user |
| GET | `/api/auth?action=me` | Get current user |
| GET | `/api/topics` | List available topics |
| POST | `/api/vocab/generate` | Get randomized vocabulary |
| POST | `/api/quiz/generate` | Generate quiz from vocab |
| POST | `/api/quiz/submit` | Submit quiz answers |
| GET | `/api/progress` | Get user progress |

## Pages

| Path | Description |
|------|-------------|
| `/` | Landing page - choose topic and difficulty |
| `/study/[topic]/[difficulty]` | Study vocabulary |
| `/quiz/[id]` | Take quiz |

## Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Start production server

# Database
npm run migrate       # Run Prisma migrations
npm run seed          # Seed database with vocabulary

# Docker
npm run db:up         # Start Postgres container
npm run db:down       # Stop Postgres container

# Testing
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
```

## Testing

```bash
# Start test database
docker-compose up -d postgres

# Run migrations and seed
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vocab_db_test?schema=public"
npx prisma migrate deploy
npx ts-node --transpile-only prisma/seed.ts

# Run tests
npm test
```

## Database Schema

```prisma
User {
  id, email, password, displayName, createdAt
  quizResults[], progress[]
}

Vocabulary {
  id, word, ipa?, meaning, example, topic, difficulty
}

QuizResult {
  id, userId?, topic, difficulty, total, correct, score, details(Json), createdAt
}

Progress {
  id, userId, topic, difficulty, xp, streak, lastPracticed
}
```

## Scoring System

- **Base Score**: 10 XP per correct answer
- **Perfect Bonus**: +20 XP for 100% correct
- **Streak**: Incremented when practicing consecutive days

## Production Deployment

### Environment Variables

```env
DATABASE_URL="postgresql://..."  # Managed Postgres (Railway, AWS RDS, etc.)
JWT_SECRET="secure-random-string" # Generate with: openssl rand -base64 32
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker Production Build

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

## Security Considerations

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens stored in HttpOnly cookies
- Input validation with Zod
- SQL injection protection via Prisma
- CORS configured for production domain
- Use HTTPS in production

## License

MIT
