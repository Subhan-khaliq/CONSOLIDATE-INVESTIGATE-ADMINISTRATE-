# CIA - Fullstack (frontend + backend)

This repository contains a React frontend (`front_student`) and an Express/TypeORM backend (`back_student`).

Quick start (with Docker Compose)

1. Copy the shared environment file and adjust values if needed:

```bash
cd WebApp
cp .env.example .env
```

2. Start all services (db, api, front):

```bash
docker compose up --build
```

3. After the build completes:
- Frontend will be available at http://localhost:8080
- Backend API will be available at http://localhost:3000

How the connection works

- All services read configuration from `WebApp/.env` (see `.env.example`). The frontend build uses `REACT_APP_API_URL` (default `api:3000`, the backend service DNS name on the Docker network).
- In development (when using `front_student/docker-compose.yml`), that compose also uses `api:3000` so the frontend container can resolve the backend by service name.
- The frontend axios instances use `http://` + `process.env.REACT_APP_API_URL` as their `baseURL`.

If you run the backend or frontend outside Docker, keep using `back_student/.env` and `front_student/.env` for local dev; for the full stack, use only `WebApp/.env`.

Troubleshooting

- If the frontend cannot reach the API, check the backend logs and confirm the API listens on port 3000 (it does by default in `back_student/src/index.ts`).
- If the database doesn't initialize, ensure Docker can create volumes and ports 3306/3000/8080 are available on your machine.

Notes

- The top-level compose uses MySQL 8.0 (multi-architecture) to avoid platform mismatches on Apple Silicon / ARM hosts.
- The backend image contains a short wait loop that checks the database TCP port before running migrations/startup so migrations don't fail if MySQL isn't ready yet.
