import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createJobSchema,
  updateJobSchema,
  listJobsQuerySchema,
  applyJobSchema,
} from '../validators/job.validator';
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  dashboardStats,
} from '../controllers/job.controller';
import {
  applyToJob,
  applicationStatus,
} from '../controllers/application.controller';

const router = Router();

// Admin dashboard aggregates
router.get('/stats/overview', authenticate, authorize('admin'), asyncHandler(dashboardStats));

// Public listing + details
router.get('/', validate(listJobsQuerySchema, 'query'), asyncHandler(listJobs));
router.get('/:id', asyncHandler(getJob));

// User actions
router.post('/:id/apply', authenticate, authorize('user'), validate(applyJobSchema), asyncHandler(applyToJob));
router.get('/:id/application-status', authenticate, asyncHandler(applicationStatus));

// Admin CRUD
router.post('/', authenticate, authorize('admin'), validate(createJobSchema), asyncHandler(createJob));
router.put('/:id', authenticate, authorize('admin'), validate(updateJobSchema), asyncHandler(updateJob));
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(deleteJob));

export default router;
