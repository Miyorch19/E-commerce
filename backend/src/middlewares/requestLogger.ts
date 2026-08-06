import morgan, { StreamOptions } from 'morgan';

// Dirije los logs de morgan a console.info para separar del stream por defecto
const stream: StreamOptions = {
  write: (message: string) => console.info(message.trimEnd()),
};

// Formato detallado en desarrollo, conciso en producción
const format =
  process.env['NODE_ENV'] === 'production'
    ? 'combined'
    : ':method :url :status :res[content-length] - :response-time ms';

export const requestLogger = morgan(format, { stream });
