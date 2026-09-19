import { Router } from 'express';
import { workOrderController } from './workOrder.controller';
import { asyncHandler } from '../../shared/asyncHandler';

const router = Router();
router.get('/', asyncHandler(workOrderController.list));
router.get('/:id', asyncHandler(workOrderController.getById));
router.get('/:id/history', asyncHandler(workOrderController.history));
router.post('/', asyncHandler(workOrderController.create));
router.patch('/:id/assign', asyncHandler(workOrderController.assignCrew));
router.patch('/:id/start', asyncHandler(workOrderController.start));
router.patch('/:id/pause', asyncHandler(workOrderController.pause));
router.patch('/:id/resume', asyncHandler(workOrderController.resume));
router.patch('/:id/complete', asyncHandler(workOrderController.complete));
router.patch('/:id/cancel', asyncHandler(workOrderController.cancel));
export default router;