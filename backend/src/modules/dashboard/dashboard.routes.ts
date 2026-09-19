import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// Solo SUPERVISOR y COORDINATOR
router.get('/summary', requireAuth, requireRole('SUPERVISOR', 'COORDINATOR'), asyncHandler(dashboardController.summary));
router.get('/assets', requireAuth, requireRole('SUPERVISOR', 'COORDINATOR'), asyncHandler(dashboardController.assets));
router.get('/work-orders', requireAuth, requireRole('SUPERVISOR', 'COORDINATOR'), asyncHandler(dashboardController.workOrders));
router.get('/crews', requireAuth, requireRole('SUPERVISOR', 'COORDINATOR'), asyncHandler(dashboardController.crews));

export default router;