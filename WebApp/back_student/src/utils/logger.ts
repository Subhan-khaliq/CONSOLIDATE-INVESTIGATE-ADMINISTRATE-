import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';

const { combine, timestamp, printf, errors, json } = format;

const logDir = path.resolve(__dirname, '../../logs');

// Ensure log directory exists
try {
  if (!fs.existsSync(logDir)) {
    // second argument as mode omitted; recursive option comes from Node 10+. Use any to satisfy TS here.
    (fs as any).mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Could not create log directory', err);
}

const logFormat = printf((info: any) => {
  const ts = info.timestamp || '';
  const stack = info.stack || '';
  if (stack) {
    return `${ts} ${info.level}: ${info.message} - ${stack}`;
  }
  return `${ts} ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new transports.Console({ format: combine(timestamp(), logFormat) }),
    new transports.DailyRotateFile({
      filename: path.join(logDir, 'api-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
      level: 'info'
    }),
    new transports.DailyRotateFile({
      filename: path.join(logDir, 'api-error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      zippedArchive: true
    })
  ],
  exitOnError: false
});

export default logger;
