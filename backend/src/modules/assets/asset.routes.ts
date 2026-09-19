import { Router } from 'express';
import { assetController } from './asset.controller';
import { asyncHandler } from '../../shared/asyncHandler';

const router = Router();

router.get('/', asyncHandler(assetController.list));
router.get('/:id', asyncHandler(assetController.getById));
router.get('/:id/history', asyncHandler(assetController.history));
router.post('/', asyncHandler(assetController.create));
router.put('/:id', asyncHandler(assetController.update));
router.patch('/:id/status', asyncHandler(assetController.changeStatus));
router.delete('/:id', asyncHandler(assetController.retire));

export default router;