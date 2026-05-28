import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env from project root if present
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Also allow process.env to be used (e.g. in Docker runtime)
  dotenv.config();
}

// Require a sufficiently long secret; if not provided, generate a secure fallback
const envSecret = process.env.JWT_SECRET;
let jwtSecret: string;
if (envSecret && envSecret.length >= 32) {
  jwtSecret = envSecret;
} else if (envSecret && envSecret.length < 32) {
  // Warn in logs (console) that secret is too short
  console.warn('JWT_SECRET is set but shorter than 32 characters; generating a secure fallback for this run.');
  jwtSecret = crypto.randomBytes(48).toString('hex');
} else {
  // No secret provided, generate a secure fallback
  console.warn('JWT_SECRET not found in environment; generating a secure fallback for this run.');
  jwtSecret = crypto.randomBytes(48).toString('hex');
}

export default {
  jwtSecret,
};
