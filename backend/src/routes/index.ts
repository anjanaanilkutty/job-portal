import { Router } from 'express';
import authRoutes from './auth.routes';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';
import { JOB_CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES } from '../models/job.model';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// Static reference data used to populate filters/forms on the clients.
router.get('/meta', (_req, res) => {
  res.json({
    success: true,
    data: {
      categories: JOB_CATEGORIES,
      experienceLevels: EXPERIENCE_LEVELS,
      jobTypes: JOB_TYPES,
    },
  });
});

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);

export default router;
