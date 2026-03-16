# Deployment Guide — Vercel + Railway

This guide walks you through deploying AdGenius to production using:

| Layer | Service | Cost |
|-------|---------|------|
| Frontend | **Vercel** | Free tier available |
| Backend API | **Railway** | $5/mo Hobby plan |
| Database | **Neon** (Vercel Postgres) | Free tier available |
| Redis / Queue | **Upstash Redis** | Free tier available |

> **Why not backend on Vercel?**
> The FastAPI backend requires a persistent process, PostgreSQL, Redis, and background Celery workers — none of which fit Vercel's serverless model. Railway is the ideal companion because the repo already ships a `railway.toml`.

---

## Prerequisites

Before you start, make sure you have:

- [ ] A [GitHub](https://github.com) account with this repo pushed
- [ ] A [Vercel](https://vercel.com) account (free)
- [ ] A [Railway](https://railway.app) account (free trial, then $5/mo)
- [ ] An [Anthropic API key](https://console.anthropic.com/)
- [ ] A Facebook access token with `ads_read` permission *(optional, for Ad Library)*

---

## Part 1 — Database on Neon (Vercel Postgres)

Neon provides a serverless PostgreSQL instance that integrates natively with Vercel.

### Step 1 — Create a Neon database

1. Go to [neon.tech](https://neon.tech) and sign up (free).
2. Click **New Project**, give it a name (e.g. `adgenius`), and choose a region closest to your users.
3. Once created, click **Connection Details**.
4. Copy the **Connection string** — it looks like:
   ```
   postgresql://adgenius:<password>@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this string — you'll need it in Part 2 and Part 3.

---

## Part 2 — Redis on Upstash

Upstash provides serverless Redis with a free tier.

### Step 2 — Create an Upstash Redis instance

1. Go to [upstash.com](https://upstash.com) and sign up (free).
2. Click **Create Database**.
3. Choose a name (e.g. `adgenius-redis`), select **Global** or a region near your backend, and click **Create**.
4. On the database page, copy the **Redis URL** — it looks like:
   ```
   rediss://default:<password>@us1-xxxxx.upstash.io:6380
   ```
5. Save this string — you'll need it in Part 3.

---

## Part 3 — Backend on Railway

### Step 3 — Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Connect your GitHub account and select this repository.
4. Railway will detect the `railway.toml` in `backend/` automatically.

### Step 4 — Set the root directory

1. In your Railway service, go to **Settings** → **Source**.
2. Set **Root Directory** to `backend`.
3. Click **Save** and redeploy if prompted.

### Step 5 — Set backend environment variables

In Railway, go to your service → **Variables** → **New Variable** and add each of the following:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `REDIS_URL` | Your Upstash Redis URL from Step 2 |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `FACEBOOK_ACCESS_TOKEN` | Your Facebook access token *(optional)* |
| `SECRET_KEY` | A long random string (run `openssl rand -hex 32` to generate one) |
| `APP_ENV` | `production` |
| `CORS_ORIGINS` | `["https://your-app.vercel.app"]` — update after Part 4 |

> Railway automatically sets the `PORT` variable. The `start.sh` script reads it with `${PORT:-8000}`.

### Step 6 — Run database migrations

Railway can run a one-off command:

1. In your Railway service, click the **three-dot menu** → **Run Command**.
2. Run:
   ```bash
   alembic upgrade head
   ```
3. Wait for it to complete. You should see `INFO  [alembic.runtime.migration] Running upgrade`.

### Step 7 — Confirm backend is live

1. In Railway, go to **Settings** → **Networking** → **Generate Domain**.
2. Railway will give you a URL like `https://adgenius-backend.up.railway.app`.
3. Visit `https://adgenius-backend.up.railway.app/health` — you should see:
   ```json
   {"status": "healthy", "version": "1.0.0", "service": "AI Ad Creative Platform"}
   ```
4. Visit `https://adgenius-backend.up.railway.app/api/docs` for the interactive API docs.

Save your Railway backend URL — you'll need it in Part 4.

---

## Part 4 — Frontend on Vercel

### Step 8 — Import the project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in.
2. Click **Import Git Repository** and select this repo.
3. On the **Configure Project** screen:
   - **Framework Preset**: Vercel should auto-detect **Next.js**.
   - **Root Directory**: Change from `.` to `frontend`.
   - Click **Edit** next to Root Directory and type `frontend`, then confirm.

### Step 9 — Set frontend environment variables

Still on the **Configure Project** screen, scroll to **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://adgenius-backend.up.railway.app/api/v1` (your Railway URL from Step 7) |

### Step 10 — Deploy

1. Click **Deploy**.
2. Vercel will install dependencies, build the Next.js app, and deploy it.
3. Once complete, you'll get a URL like `https://adgenius.vercel.app`.

### Step 11 — Update CORS on Railway

Now that you have your Vercel URL, go back to Railway and update the `CORS_ORIGINS` variable:

```
CORS_ORIGINS=["https://adgenius.vercel.app"]
```

Railway will automatically redeploy the backend with the new setting.

---

## Part 5 — Celery Worker on Railway *(optional)*

The Celery background worker handles async tasks. To run it:

### Step 12 — Add a Celery worker service

1. In your Railway project, click **New** → **GitHub Repo** (same repo).
2. Set **Root Directory** to `backend`.
3. Go to **Settings** → **Deploy** → **Custom Start Command** and set:
   ```bash
   celery -A app.celery_app worker --loglevel=info
   ```
4. Add the same environment variables as the main backend service:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `ANTHROPIC_API_KEY`
   - `APP_ENV=production`

---

## Part 6 — Facebook Ad Library Setup *(optional)*

To enable the `/api/v1/facebook-ads/*` endpoints:

### Step 13 — Get a Facebook access token

1. Go to [developers.facebook.com](https://developers.facebook.com) and log in.
2. Create a new app (type: **Business**) or use an existing one.
3. Open the [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
4. Select your app from the dropdown.
5. Click **Add a Permission** → search for `ads_read` → select it.
6. Click **Generate Access Token** and approve the permissions.
7. Copy the token.

> **Note:** User access tokens expire. For production, generate a **long-lived token** or use a **System User** token in Meta Business Manager:
> - Meta Business Manager → **System Users** → Add system user → Assign `ads_read` → Generate token.

### Step 14 — Add the token to Railway

In your Railway backend service, add:

| Variable | Value |
|----------|-------|
| `FACEBOOK_ACCESS_TOKEN` | The token from Step 13 |

---

## Full Environment Variable Reference

### Backend (Railway)

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...@....neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:...@....upstash.io:6380
SECRET_KEY=your-64-char-random-string

# Deployment
APP_ENV=production
CORS_ORIGINS=["https://your-app.vercel.app"]

# Optional
FACEBOOK_ACCESS_TOKEN=EAAxxxxx...
STORAGE_BUCKET=your-s3-bucket
STORAGE_REGION=us-east-1
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api/v1
```

---

## Troubleshooting

### Build fails on Vercel: "Cannot find module"

Make sure **Root Directory** is set to `frontend` in your Vercel project settings:
- Vercel dashboard → Project → **Settings** → **General** → **Root Directory** → `frontend`

### Railway backend crashes on startup

Check the deploy logs in Railway. Most common causes:
- Missing `DATABASE_URL` — verify the Neon connection string is correct.
- Database migrations not run — run `alembic upgrade head` via the Railway console.
- `ANTHROPIC_API_KEY` not set.

### CORS errors in browser

The `CORS_ORIGINS` variable on Railway must exactly match your Vercel URL (no trailing slash):
```
CORS_ORIGINS=["https://your-app.vercel.app"]
```

### Facebook Ad Library returns 401 / OAuthException

- Your token may have expired. Regenerate it at [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer/).
- Ensure the `ads_read` permission is granted on the token.
- For production, use a System User token which doesn't expire.

### Alembic: "relation already exists"

The database already has tables. Run:
```bash
alembic stamp head
```

---

## Quick Reference — URLs After Deployment

| Resource | URL |
|----------|-----|
| Frontend app | `https://your-app.vercel.app` |
| Backend API | `https://your-backend.up.railway.app` |
| API health check | `https://your-backend.up.railway.app/health` |
| Interactive API docs | `https://your-backend.up.railway.app/api/docs` |
