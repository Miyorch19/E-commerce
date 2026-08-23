import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// ─── Helper ────────────────────────────────────────────────────────────────────
const requiredString = (msg: string) => z.string({ error: msg }).min(1, msg);

// ─── Item de pedido ────────────────────────────────────────────────────────────
const pedidoItemSchema = z.object({
  productoId: requiredString('productoId is required.'),
  cantidad: z
    .number({ error: 'cantidad must be a number.' })
    .int('cantidad must be an integer.')
    .min(1, 'cantidad must be at least 1.'),
  varianteId: z.string().optional(),
});

// ─── Crear Pedido ─────────────────────────────────────────────────────────────
export const crearPedidoSchema = z.object({
  body: z.object({
    /** Lista de productos: mínimo 1 item */
    items: z
      .array(pedidoItemSchema)
      .min(1, 'At least one item is required.'),

    /** Tipo de pedido. Default: LOCAL */
    tipo: z.enum(['LOCAL', 'DELIVERY', 'WHATSAPP']).optional(),

    /** Requerido si tipo === DELIVERY */
    direccionEntrega: z.string().optional(),

    /** Notas opcionales */
    notasCliente: z.string().optional(),
  }),
});

export type CrearPedidoDto = z.infer<typeof crearPedidoSchema>['body'];

// ─── Middleware de validación ──────────────────────────────────────────────────
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      res.status(422).json({
        status: 'fail',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    next();
  };
}
