import { Router } from 'express';
import { assetController } from './asset.controller';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// Lectura: cualquier usuario autenticado
router.get('/', requireAuth, asyncHandler(assetController.list));
router.get('/:id', requireAuth, asyncHandler(assetController.getById));
router.get('/:id/history', requireAuth, asyncHandler(assetController.history));

// Escritura: solo SUPERVISOR
router.post('/', requireAuth, requireRole('SUPERVISOR'), asyncHandler(assetController.create));
router.put('/:id', requireAuth, requireRole('SUPERVISOR'), asyncHandler(assetController.update));
router.patch('/:id/status', requireAuth, requireRole('SUPERVISOR'), asyncHandler(assetController.changeStatus));
router.delete('/:id', requireAuth, requireRole('SUPERVISOR'), asyncHandler(assetController.retire));

export default router;