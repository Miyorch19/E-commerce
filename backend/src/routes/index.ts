import { Router } from 'express';
import healthRouter from './health';

const router = Router();

router.use(healthRouter);

// Aquí se montarán los módulos futuros:
// router.use('/auth', authRouter);
// router.use('/negocios', negociosRouter);

export default router;
