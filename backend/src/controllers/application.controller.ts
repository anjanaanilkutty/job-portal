import { Request, Response } from 'express';
import { Application, Job } from '../models';
import { ApiError } from '../utils/apiError';

export async function applyToJob(req: Request, res: Response): Promise<void> {
  const jobId = Number(req.params.id);
  const userId = req.user!.sub;

  const job = await Job.findByPk(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  if (job.status === 'closed') {
    throw ApiError.badRequest('This job is no longer accepting applications');
  }

  const existing = await Application.findOne({ where: { jobId, userId } });
  if (existing) {
    throw ApiError.conflict('You have already applied to this job');
  }

  const application = await Application.create({
    jobId,
    userId,
    coverLetter: req.body.coverLetter ?? null,
  });

  res.status(201).json({ success: true, data: application });
}

/** Applications belonging to the currently logged-in user. */
export async function myApplications(req: Request, res: Response): Promise<void> {
  const applications = await Application.findAll({
    where: { userId: req.user!.sub },
    include: [{ model: Job, as: 'job' }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: applications });
}

/** Whether the logged-in user has applied to a given job (drives UI state). */
export async function applicationStatus(req: Request, res: Response): Promise<void> {
  const application = await Application.findOne({
    where: { jobId: Number(req.params.id), userId: req.user!.sub },
  });
  res.json({ success: true, data: { hasApplied: Boolean(application), application } });
}
