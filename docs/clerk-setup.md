# Environment Setup Guide

## Required Environment Variables
The following environment variables must be set in both development (.env.local) and production (Vercel):

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Setup Instructions
1. Copy .env.example to .env.local
2. Add your Clerk keys to .env.local
3. Configure the same variables in your Vercel project settings
4. Set up your PostgreSQL database and add the connection URL
   - For local development: Use your local PostgreSQL instance
   - For Vercel: Add your production database URL in project settings

## Database Configuration
The application requires a PostgreSQL database connection. Ensure your DATABASE_URL follows this format:
- Format: `postgresql://user:password@host:5432/database`
- Local development typically uses: `postgresql://postgres:password@localhost:5432/your_db_name`
- Production should use your hosted PostgreSQL instance URL

## Middleware Configuration
The Next.js middleware is already configured to use Clerk authentication. The middleware file (middleware.ts) includes:
- Protected routes configuration
- Proper route matchers
- Clerk middleware integration
