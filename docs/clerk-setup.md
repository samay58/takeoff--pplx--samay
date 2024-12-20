# Clerk Environment Setup

## Required Environment Variables
The following environment variables must be set in both development (.env.local) and production (Vercel):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
```

## Setup Instructions
1. Copy .env.example to .env.local
2. Add your Clerk keys to .env.local
3. Configure the same variables in your Vercel project settings

## Middleware Configuration
The Next.js middleware is already configured to use Clerk authentication. The middleware file (middleware.ts) includes:
- Protected routes configuration
- Proper route matchers
- Clerk middleware integration
