import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { myApplications } from '../controllers/application.controller';

const router = Router();

router.get('/me', authenticate, authorize('user'), asyncHandler(myApplications));

export default router;
