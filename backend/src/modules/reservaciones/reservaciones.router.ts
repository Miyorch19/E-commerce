import { Router, IRouter } from 'express';
import * as ctrl from './reservaciones.controller';
import { authenticate, requireUsuario, requireCliente } from '../../middlewares';

const router: IRouter = Router();

// ─── PANEL ADMIN ─────────────────────────────────────────────────────────────

// Zonas (requiere zonas:gestionar)
router.get('/panel/zonas', authenticate, requireUsuario, ctrl.getZonas);
router.post('/panel/zonas', authenticate, requireUsuario, ctrl.createZona);
router.put('/panel/zonas/:id', authenticate, requireUsuario, ctrl.updateZona);
router.patch('/panel/zonas/:id/toggle', authenticate, requireUsuario, ctrl.toggleZona);

// Horario (requiere zonas:gestionar — agrupado por decisión de diseño)
router.get('/panel/horario', authenticate, requireUsuario, ctrl.getHorarios);
router.put('/panel/horario/:dia', authenticate, requireUsuario, ctrl.updateHorarioDia);

// Reservaciones panel (requiere reservaciones:gestionar)
router.get('/panel/reservaciones', authenticate, requireUsuario, ctrl.getReservacionesPanel);
router.patch('/panel/reservaciones/:id/estado', authenticate, requireUsuario, ctrl.cambiarEstado);

// ─── TIENDA PÚBLICA ───────────────────────────────────────────────────────────

router.get('/zonas', ctrl.getZonasPublicas);
router.get('/horario', ctrl.getHorarioPublico);

// Reservaciones cliente (requieren autenticación de cliente)
router.post('/reservaciones', authenticate, requireCliente, ctrl.crearReservacion);
router.get('/reservaciones/mis-reservaciones', authenticate, requireCliente, ctrl.getMisReservaciones);
router.patch('/reservaciones/:id/cancelar', authenticate, requireCliente, ctrl.cancelarReservacion);

export default router;
