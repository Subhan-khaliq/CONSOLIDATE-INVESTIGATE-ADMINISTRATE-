const isProd = process.env.NODE_ENV === 'production';

const DB_HOST = process.env.DB_HOST || 'db';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USERNAME = process.env.DB_USERNAME || process.env.DB_USER || undefined;
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.DB_PASS || undefined;
const DB_DATABASE = process.env.DB_DATABASE || process.env.DB_NAME || 'dev_db';

if (isProd) {
  // In production, require explicit DB credentials (do not allow defaults)
  if (!DB_USERNAME || !DB_PASSWORD) {
    console.error('FATAL: DB credentials missing. In production, set DB_USERNAME and DB_PASSWORD as environment variables.');
    // exit so container fails fast instead of running with insecure defaults
    process.exit(1);
  }
} else {
  // In development, allow fallbacks but warn
  if (!DB_USERNAME || !DB_PASSWORD) {
    console.warn('WARNING: DB_USERNAME or DB_PASSWORD not set. Falling back to defaults for development only. Do NOT use defaults in production.');
  }
}

module.exports = {
  type: 'mysql',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: true,
  logging: false,
  migrationsRun: true,
  entities: [
    'src/entity/**/*.ts'
  ],
  migrations: [
    'src/migration/**/*.ts'
  ],
  subscribers: [
    'src/subscriber/**/*.ts'
  ],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber'
  }
};
