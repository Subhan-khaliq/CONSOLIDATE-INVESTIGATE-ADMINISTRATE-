#!/bin/sh
set -e

# Only used with docker-compose (service name "db"). On Render, set DB_HOST to external MySQL.
if [ "$WAIT_FOR_DB" = "true" ]; then
  host="${DB_HOST:-db}"
  i=0
  until nc -z "$host" 3306 || [ "$i" -ge 60 ]; do
    echo "Waiting for DB at ${host}:3306 ($i/60)"
    i=$((i + 1))
    sleep 2
  done
fi

# Never schema:drop on production/Render — use migrations only (Hostinger / external DB).
if [ "$NODE_ENV" = "production" ] || [ "$RENDER" = "true" ]; then
  npm run migration:run || echo "WARN: migration:run failed (check DB credentials and Hostinger Remote MySQL)"
else
  npm run migration:start || true
fi

exec node -r ts-node/register ./src/index.ts
