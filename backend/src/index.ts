import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { config } from './config/env';
import { requestLogger, errorHandler, dynamicCors } from './middlewares';
import router from './routes';
import { prisma } from './config/prisma';
import webhooksRouter from './modules/webhooks/webhooks.router';

const app = express();

// ── Seguridad ─────────────────────────────────────────────
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// ─── Webhooks (Requiere Body crudo) ──────────────────────────────────────────
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

// ─── Middlewares Globales ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors(dynamicCors));
app.use(express.json()); // A partir de aquí, req.body será parseado como JSON
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
