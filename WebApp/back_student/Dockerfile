FROM node:18-alpine

# Install build dependencies required to compile native modules (sqlite3, etc.)
# node-gyp on Alpine needs python2 + build tools and sqlite dev headers
RUN apk add --no-cache python3 make g++ build-base linux-headers sqlite-dev bash netcat-openbsd

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies first to take advantage of Docker layer caching
COPY package.json yarn.lock ./
RUN yarn install

# Copy application sources
# Copy everything including a .env if provided by the build context
COPY . .
# Ensure .env is present (optional) - nothing to do here if not provided

EXPOSE 3000

# Run migrations then start the app. If you prefer to run migrations manually, replace with ["yarn","start"]
CMD ["sh", "-c", "until nc -z ${DB_HOST:-db} 3306; do echo 'Waiting for DB at ' ${DB_HOST:-db} ':3306' ; sleep 1; done; yarn migration:start || true && node -r ts-node/register ./src/index.ts"]
