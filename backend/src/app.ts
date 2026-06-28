import express from 'express';
import cors from 'cors';
import routes from './routes';
import { env } from './config/env';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser tools (no origin) and any configured client origin.
        if (!origin || env.clientOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
