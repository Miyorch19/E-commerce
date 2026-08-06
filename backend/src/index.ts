import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { config } from './config/env';
import { requestLogger, errorHandler } from './middlewares';
import router from './routes';
import { prisma } from './config/prisma';

const app = express();

// ── Seguridad ─────────────────────────────────────────────
app.use(helmet());
app.use(cors());

// ── Parsing ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────
app.use(requestLogger);

// ── Rutas ─────────────────────────────────────────────────
app.use('/api', router);

// ── Error handler (debe ir al final) ─────────────────────
app.use(errorHandler);

// ── Arranque ─────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    console.info('✅ Database connected');

    app.listen(config.port, () => {
      console.info(
        `🚀 Backend running on http://localhost:${config.port} [${config.nodeEnv}]`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.info('Database disconnected. Goodbye.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
