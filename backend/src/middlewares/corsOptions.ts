import cors, { CorsOptions } from 'cors';
import { prisma } from '../config/prisma';
import { config } from '../config/env';

interface CacheEntry {
  allowed: boolean;
  expiresAt: number;
}

const originCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 segundos

/**
 * CORS dinámico
 *
 * NOTA: En este proyecto multitenant con dominios custom, no podemos usar una
 * whitelist estática de orígenes. Cada Negocio puede tener un subdominio o
 * dominio custom diferente, por lo que resolvemos los orígenes en tiempo
 * de ejecución contra la tabla de Negocios en la base de datos, usando
 * un caché en memoria para evitar saturar la BD en cada petición.
 */
export const dynamicCors: CorsOptions = {
  origin: async (origin, callback) => {
    // 1. Peticiones sin origin (Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Excepción para desarrollo local
    if (config.nodeEnv === 'development') {
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
    }

    // 3. Revisar caché
    const now = Date.now();
    const cached = originCache.get(origin);
    if (cached && cached.expiresAt > now) {
      if (cached.allowed) {
        return callback(null, true);
      } else {
        return callback(new Error('Origin no permitido por CORS'));
      }
    }

    try {
      // Extraer el hostname del origin (ej: "https://tienda.miapp.com" -> "tienda.miapp.com")
      let hostname = '';
      try {
        const url = new URL(origin);
        hostname = url.hostname;
      } catch (err) {
        // Origin malformado
        return callback(new Error('Origin malformado'));
      }

      // 4. Buscar en la BD si existe el dominio (como dominio base o custom)
      // Nota: Aquí hacemos un findFirst simple asumiendo que dominio o customDomain
      // coincide exactamente con el hostname del origin.
      
      // Dado que extractDominio puede ser complejo, si BASE_DOMAIN está activo
      // comprobaremos tanto si coincide como customDomain, o como subdominio
      const base = config.baseDomain;
      let isSubdomain = false;
      let slug = hostname;

      if (base && hostname.endsWith(`.${base}`)) {
        slug = hostname.slice(0, hostname.length - base.length - 1);
        isSubdomain = true;
      }

      const negocio = await prisma.negocio.findFirst({
        where: {
          activo: true,
          OR: [
            { customDomain: hostname },
            // Si es subdominio de la plataforma, lo buscamos en el campo dominio
            ...(isSubdomain || !base ? [{ dominio: slug }] : []),
          ],
        },
      });

      if (negocio) {
        originCache.set(origin, { allowed: true, expiresAt: now + CACHE_TTL_MS });
        return callback(null, true);
      } else {
        originCache.set(origin, { allowed: false, expiresAt: now + CACHE_TTL_MS });
        return callback(new Error('Origin no permitido por CORS'));
      }
    } catch (error) {
      return callback(new Error('Error verificando CORS'));
    }
  },
  credentials: true,
};
