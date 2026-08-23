import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { createStripePayment } from '../modules/membresias/membresias.service';
import { EstadoMembresia, EstadoPago } from '@prisma/client';

export async function procesarPagosMembresias() {
  console.log('[CRON] Iniciando procesamiento de pagos de membresías...');
  
  // Calcular periodo UNA SOLA VEZ al inicio de la ejecución.
  // Formato: "YYYY-MM"
  const now = new Date();
  const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  console.log(`[CRON] Periodo a facturar: ${periodo}`);

  try {
    // Buscar todas las membresías activas
    const membresias = await prisma.membresia.findMany({
      where: { estado: EstadoMembresia.ACTIVA },
      include: { negocio: true },
    });

    console.log(`[CRON] Se encontraron ${membresias.length} membresías activas.`);

    for (const membresia of membresias) {
      console.log(`[CRON] Procesando membresía ${membresia.id} (Negocio: ${membresia.negocio.nombre})...`);
      
      try {
        // Verificar si ya existe un cobro aprobado para este periodo
        const cobroExistente = await prisma.pagoMembresia.findUnique({
          where: {
            membresiaId_periodo: {
              membresiaId: membresia.id,
              periodo: periodo,
            },
          },
        });

        if (cobroExistente && cobroExistente.estado === EstadoPago.APROBADO) {
          console.log(`[CRON] ⏭️ Omitiendo membresía ${membresia.id} - Ya tiene un pago APROBADO para ${periodo}.`);
          continue;
        }

        // Ejecutar cobro
        console.log(`[CRON] 💸 Intentando cobro para membresía ${membresia.id}...`);
        const result = await createStripePayment(membresia.id, membresia.negocioId, periodo);
        
        console.log(`[CRON] ✅ Cobro exitoso para ${membresia.id}: Status=${result.status}, PI=${result.paymentIntentId || 'N/A'}`);
      } catch (error: any) {
        // Capturar errores individuales para no detener el job completo
        console.error(`[CRON] ❌ Error al procesar membresía ${membresia.id}:`, error.message);
      }
    }
    
    console.log('[CRON] Finalizado procesamiento de pagos de membresías.');
  } catch (error: any) {
    console.error('[CRON] Error crítico durante la ejecución del job:', error.message);
  }
}

export function startCronJobs() {
  /**
   * CONSIDERACIÓN PARA PRODUCCIÓN:
   * Si el backend se despliega con múltiples instancias o réplicas (ej. Kubernetes, PM2 cluster, AWS ECS),
   * el cron se disparará simultáneamente en todas ellas, pudiendo causar cobros duplicados 
   * (aunque nuestro check de 'PagoMembresia' existente con upsert atenúe esto, sigue habiendo race conditions 
   * al invocar el SDK de Stripe si las instancias corren en el mismo milisegundo exacto).
   * 
   * Para escalar horizontalmente de forma segura, se debe usar un "lock distribuido" (ej. Redis / Redlock)
   * o extraer los jobs a un worker dedicado (ej. BullMQ) que garantice ejecución única.
   */
  if (process.env.NODE_ENV !== 'test') {
    // Ejecutar todos los días a las 3:00 AM
    cron.schedule('0 3 * * *', () => {
      procesarPagosMembresias();
    });
    console.log('✅ Cron jobs started (Daily 3:00 AM)');
  }
}
