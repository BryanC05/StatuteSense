# StatuteSense Deployment Guide

## Quick Deploy to Vercel

### 1. Connect to Vercel

```bash
npm install -g vercel
vercel login
vercel link
```

### 2. Set Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables, add:

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key (or use Hugging Face)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production URL (e.g., `https://statutesense.vercel.app`)
- `AUTH_USERNAME` - Admin username for login
- `AUTH_PASSWORD` - Admin password for login
- `DATABASE_URL` - SQLite path: `file:./dev.db`

**Optional:**
- `AI_PROVIDER` - Set to `huggingface` (default) or `openai`
- `HUGGINGFACE_API_KEY` - For HF dedicated endpoints
- `GROQ_API_KEY` - For Sanity CMS template fetching
- `LOG_LEVEL` - Logging level: DEBUG, INFO, WARN, ERROR

### 3. Deploy

```bash
vercel --prod
```

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Database

The app uses SQLite for document storage. The database file is created automatically on first migration.

```bash
npx prisma migrate dev
```

## Production Considerations

### Database
For production, consider switching to PostgreSQL:
1. Change `provider` in `prisma/schema.prisma` to `"postgresql"`
2. Update `DATABASE_URL` to your PostgreSQL connection string
3. Run `npx prisma migrate dev`

### Authentication
Current auth uses single-user credentials. For multi-user:
1. Add user registration flow
2. Hash passwords with bcrypt
3. Add rate limiting (e.g., `express-rate-limit`)

### Monitoring
Set up error tracking:
- Sentry: Add `@sentry/nextjs` and configure `SENTRY_DSN`
- Logging: Already structured, integrate with Logtail/Datadog

## Troubleshooting

**Build fails:** Run `npm run build` locally first
**Database errors:** Ensure `DATABASE_URL` is set
**Auth issues:** Regenerate `NEXTAUTH_SECRET`
