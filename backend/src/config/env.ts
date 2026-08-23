import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  /** Dominio base de la plataforma, ej: "miapp.com".
   *  Se usa para extraer el subdominio del tenant del header Host.
   *  Dejar vacío para resolver por dominio completo o X-Tenant-Domain. */
  baseDomain: optionalEnv('BASE_DOMAIN', 'localhost'),

  database: {
    url: requireEnv('DATABASE_URL'),
    directUrl: requireEnv('DIRECT_URL'),
  },

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    /** Duración del access token (stateless) */
    accessExpiresIn: optionalEnv('JWT_ACCESS_EXPIRES', '15m'),
    /** Duración del refresh token (almacenado en DB) */
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES', '7d'),
  },

  cloudinary: {
    cloudName: requireEnv('CLOUDINARY_CLOUD_NAME'),
    apiKey: requireEnv('CLOUDINARY_API_KEY'),
    apiSecret: requireEnv('CLOUDINARY_API_SECRET'),
  },

  google: {
    clientId: requireEnv('GOOGLE_CLIENT_ID'),
    clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
  },

  stripe: {
    publishableKey: requireEnv('STRIPE_PUBLISHABLE_KEY'),
    secretKey: requireEnv('STRIPE_SECRET_KEY'),
    webhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),
    webhookConnectSecret: requireEnv('STRIPE_CONNECT_WEBHOOK_SECRET'),
  },
} as const;
