# Deploying on Render

Render **does not** run `docker-compose.yml` as a build file. Each Web Service is built from a **Dockerfile**. Pointing **Dockerfile Path** at `docker-compose.yml` causes:

```text
unknown instruction: services:
```

## Quick fix (backend only — your current `cia_back` service)

In the Render Dashboard for **cia_back**:

| Setting | Value |
|--------|--------|
| **Root Directory** | `WebApp/back_student` |
| **Dockerfile Path** | `Dockerfile` |
| **Docker Build Context** | `.` (default; relative to root directory) |

Do **not** use `docker-compose.yml` as the Dockerfile.

Remove any custom **Port** override (e.g. `8000`). Render sets `PORT` automatically; the API listens on `process.env.PORT`.

### Required environment variables

**You must set `DB_HOST` in the Render Dashboard.** If it is missing, the app defaults to `db` (the docker-compose service name), which does not exist on Render and causes a long wait loop / deploy failure.

Render does **not** run the MySQL container from `docker-compose.yml`. Use [Render PostgreSQL](https://render.com/docs/databases) only if you migrate the app; this project expects **external MySQL** (Railway, Aiven, PlanetScale, etc.).

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` (recommended) |
| `DB_HOST` | Hostinger MySQL hostname (**required** — not `db`) |
| `DB_USERNAME` | your user |
| `DB_PASSWORD` | your password |
| `DB_DATABASE` | your database name |
| `JWT_SECRET` | at least 32 random characters |
| `ALLOWED_ORIGINS` | `https://your-frontend.onrender.com` (after front is deployed) |

`docker-compose.yml` is for **local** full-stack runs only (`WebApp/.env` + `docker compose up`).

## Hostinger MySQL (Remote)

If logs show:

```text
Access denied for user 'YOUR_USER'@'74.220.x.x' (using password: YES)
```

the app **reached** Hostinger but MySQL rejected the login. Fix in **hPanel**:

1. **Databases → Remote MySQL** → create access for Render’s outbound IP (from the error, e.g. `74.220.48.202`), or use `%` while testing.
2. **DB_HOST** = MySQL hostname from hPanel (e.g. `srvXXXX.hstgr.io`), not `localhost`.
3. **DB_USERNAME** / **DB_PASSWORD** = exact MySQL user and password from hPanel (not your hPanel login).
4. **DB_DATABASE** = the database name (often similar to the username prefix).
5. Do **not** set `DB_PORT` unless Hostinger gives a non-default port.

After changing Remote MySQL, wait a minute and redeploy on Render.

## Full stack (API + frontend)

1. Provision **MySQL** outside Render (Railway, Aiven, etc.) and note host, user, password, database.
2. Push this repo and use **New → Blueprint** with `render.yaml` at the repo root, **or** create two Docker Web Services manually:

| Service | Root Directory | Dockerfile Path |
|---------|----------------|-----------------|
| API | `WebApp/back_student` | `Dockerfile` |
| Frontend | `WebApp/front_student` | `Dockerfile` |

3. On **cia-front**, set `REACT_APP_API_URL` to your public API URL, e.g. `https://cia-back.onrender.com` (must be a full URL with `https://` and set at **build** time; trigger a redeploy after changing).
4. On **cia-back**, set `ALLOWED_ORIGINS` to your frontend URL, e.g. `https://cia-front.onrender.com`.

## Local vs Render

| | Local (`docker compose`) | Render |
|--|--------------------------|--------|
| Config | `WebApp/.env` | Dashboard env vars |
| Database | MySQL container `db` | External MySQL |
| Orchestration | `docker-compose.yml` | One Dockerfile per service |
