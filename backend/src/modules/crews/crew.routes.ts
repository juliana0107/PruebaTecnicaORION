import { Router } from 'express';
import { crewController } from './crew.controller';
import { asyncHandler } from '../../shared/asyncHandler';

const router = Router();
router.get('/', asyncHandler(crewController.list));
router.get('/:id', asyncHandler(crewController.getById));
router.post('/', asyncHandler(crewController.create));
router.put('/:id', asyncHandler(crewController.update));
router.patch('/:id/status', asyncHandler(crewController.changeStatus));
router.delete('/:id', asyncHandler(crewController.retire));
export default router;