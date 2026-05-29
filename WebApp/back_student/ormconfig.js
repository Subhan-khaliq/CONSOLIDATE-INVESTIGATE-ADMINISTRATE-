const isProd = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true';
const requireExternalDb = isProd || isRender;

const DB_HOST =
  process.env.DB_HOST || (requireExternalDb ? undefined : 'db');
const DB_USERNAME = process.env.DB_USERNAME || process.env.DB_USER || undefined;
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.DB_PASS || undefined;
const DB_DATABASE = process.env.DB_DATABASE || process.env.DB_NAME || 'dev_db';

if (requireExternalDb) {
  if (!DB_HOST || DB_HOST === 'db') {
    console.error(
      'FATAL: Set DB_HOST to your external MySQL hostname in Render (not "db"). ' +
        'The hostname "db" only exists inside docker-compose.',
    );
    process.exit(1);
  }
  if (!DB_USERNAME || !DB_PASSWORD) {
    console.error('FATAL: DB credentials missing. In production, set DB_USERNAME and DB_PASSWORD as environment variables.');
    process.exit(1);
  }
} else {
  // In development, allow fallbacks but warn
  if (!DB_USERNAME || !DB_PASSWORD) {
    console.warn('WARNING: DB_USERNAME or DB_PASSWORD not set. Falling back to defaults for development only. Do NOT use defaults in production.');
  }
}

const dbConfig = {
  type: 'mysql',
  host: DB_HOST,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: true,
  logging: false,
  migrationsRun: true,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};

// Optional; Hostinger and most MySQL hosts use the default port when omitted.
if (process.env.DB_PORT) {
  dbConfig.port = parseInt(process.env.DB_PORT, 10);
}

module.exports = dbConfig;
