import { Router, IRouter } from 'express';
import * as pedidosController from './pedidos.controller';
import { authenticate } from '../../middlewares/authenticate';
import { validate, crearPedidoSchema } from './pedidos.schema';

const router: IRouter = Router();

/**
 * POST /pedidos
 * Crea un nuevo Pedido a partir del carrito del cliente autenticado.
 * El backend calcula el total desde precios en BD — el frontend solo manda IDs y cantidades.
 */
router.post(
  '/',
  authenticate,
  validate(crearPedidoSchema),
  pedidosController.crearPedido
);

/**
 * GET /pedidos/:id
 * Obtiene un Pedido por ID. Solo accesible por el cliente que lo creó y en el mismo tenant.
 */
router.get(
  '/:id',
  authenticate,
  pedidosController.getPedidoById
);

/**
 * POST /pedidos/:id/pago/stripe
 * Requiere ser un cliente final autenticado.
 */
router.post(
  '/:id/pago/stripe',
  authenticate,
  pedidosController.createStripePayment
);

export default router;
