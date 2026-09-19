import { Router } from 'express';
import { catalogController } from './catalog.controller';
import { asyncHandler } from '../../shared/asyncHandler';

const router = Router();

router.get('/asset-types', asyncHandler(catalogController.assetTypes));
router.get('/locations', asyncHandler(catalogController.locations));

export default router;