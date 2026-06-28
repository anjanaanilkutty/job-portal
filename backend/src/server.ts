import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import './models'; // ensure model associations are registered

async function bootstrap() {
  try {
    await connectDatabase();
    // eslint-disable-next-line no-console
    console.log('Database connected and synchronized');

    const app = createApp();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API server running at http://localhost:${env.port}/api`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
