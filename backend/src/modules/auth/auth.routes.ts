import { Router } from 'express';
import { authController } from './auth.controller';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.post('/login', asyncHandler(authController.login));
router.get('/me', requireAuth, asyncHandler(authController.me));
export default router;