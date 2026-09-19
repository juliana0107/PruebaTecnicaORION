import { Router } from 'express';
import { workOrderController } from './workOrder.controller';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// Lectura: cualquier autenticado
router.get('/', requireAuth, asyncHandler(workOrderController.list));
router.get('/:id', requireAuth, asyncHandler(workOrderController.getById));
router.get('/:id/history', requireAuth, asyncHandler(workOrderController.history));

// Crear/cancelar/completar: SUPERVISOR
router.post('/', requireAuth, requireRole('SUPERVISOR'), asyncHandler(workOrderController.create));
router.patch('/:id/complete', requireAuth, requireRole('SUPERVISOR'), asyncHandler(workOrderController.complete));
router.patch('/:id/cancel', requireAuth, requireRole('SUPERVISOR', 'COORDINATOR'), asyncHandler(workOrderController.cancel));

// Asignar cuadrilla: COORDINATOR
router.patch('/:id/assign', requireAuth, requireRole('COORDINATOR'), asyncHandler(workOrderController.assignCrew));

// Iniciar/pausar/reanudar: TECHNICIAN (o SUPERVISOR)
router.patch('/:id/start', requireAuth, requireRole('TECHNICIAN', 'SUPERVISOR'), asyncHandler(workOrderController.start));
router.patch('/:id/pause', requireAuth, requireRole('TECHNICIAN', 'SUPERVISOR'), asyncHandler(workOrderController.pause));
router.patch('/:id/resume', requireAuth, requireRole('TECHNICIAN', 'SUPERVISOR'), asyncHandler(workOrderController.resume));

export default router;