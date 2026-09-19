import { Router } from 'express';
import { crewController } from './crew.controller';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// Lectura
router.get('/', requireAuth, asyncHandler(crewController.list));
router.get('/:id', requireAuth, asyncHandler(crewController.getById));

// Mutaciones: COORDINATOR
router.post('/', requireAuth, requireRole('COORDINATOR'), asyncHandler(crewController.create));
router.put('/:id', requireAuth, requireRole('COORDINATOR'), asyncHandler(crewController.update));
router.patch('/:id/status', requireAuth, requireRole('COORDINATOR'), asyncHandler(crewController.changeStatus));
router.delete('/:id', requireAuth, requireRole('COORDINATOR'), asyncHandler(crewController.retire));

export default router;