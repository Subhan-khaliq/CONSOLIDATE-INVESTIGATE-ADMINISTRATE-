import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import 'reflect-metadata';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerStats from 'swagger-stats';
import * as swaggerUi from 'swagger-ui-express';
import routes from './routes';
import logger from './utils/logger';
import { requestLogger, errorLogger } from './middlewares/logging';

export default async function createApp() {
  const app = express();
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:8080';
  const allowedOrigins = allowedOriginsEnv.split(',').map(s => s.trim()).filter(Boolean);
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: This origin is not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth', 'Accept', 'X-Requested-With'],
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(swaggerStats.getMiddleware({}));
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(requestLogger);
  morgan.token('header-auth', (req, res) => req.headers.auth as any);
  app.use(morgan('combined'));
  // simple health endpoint for tests
  app.get('/health', (req, res) => res.status(200).send({ ok: true }));
  app.use('/', routes);
  app.use(errorLogger);
  return app;
}
