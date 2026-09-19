import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { asyncHandler } from '../../shared/asyncHandler';

const router = Router();
router.get('/summary', asyncHandler(dashboardController.summary));
router.get('/assets', asyncHandler(dashboardController.assets));
router.get('/work-orders', asyncHandler(dashboardController.workOrders));
router.get('/crews', asyncHandler(dashboardController.crews));
export default router;