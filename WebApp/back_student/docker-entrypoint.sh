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

npm run migration:start || true
exec node -r ts-node/register ./src/index.ts
