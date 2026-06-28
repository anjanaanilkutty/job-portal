import { Request, Response } from 'express';
import { Op, WhereOptions, fn, col, literal } from 'sequelize';
import { Job, Application, User } from '../models';
import { ApiError } from '../utils/apiError';
import { ListJobsQuery } from '../validators/job.validator';

function buildWhere(query: ListJobsQuery): WhereOptions {
  const where: Record<string, unknown> = {};

  if (query.category) where.category = query.category;
  if (query.experienceLevel) where.experienceLevel = query.experienceLevel;
  if (query.jobType) where.jobType = query.jobType;
  if (query.status) where.status = query.status;
  if (query.featured !== undefined) where.isFeatured = query.featured;

  if (query.search) {
    const term = `%${query.search}%`;
    where[Op.or as unknown as string] = [
      { title: { [Op.iLike]: term } },
      { company: { [Op.iLike]: term } },
      { location: { [Op.iLike]: term } },
    ];
  }

  return where as WhereOptions;
}

export async function listJobs(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListJobsQuery;
  const where = buildWhere(query);
  const offset = (query.page - 1) * query.limit;

  const { rows, count } = await Job.findAndCountAll({
    where,
    limit: query.limit,
    offset,
    order: [['createdAt', query.sort === 'oldest' ? 'ASC' : 'DESC']],
  });

  res.json({
    success: true,
    data: rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / query.limit)),
    },
  });
}

export async function getJob(req: Request, res: Response): Promise<void> {
  const job = await Job.findByPk(req.params.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
  });
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  res.json({ success: true, data: job });
}

export async function createJob(req: Request, res: Response): Promise<void> {
  const job = await Job.create({ ...req.body, postedBy: req.user!.sub });
  res.status(201).json({ success: true, data: job });
}

export async function updateJob(req: Request, res: Response): Promise<void> {
  const job = await Job.findByPk(req.params.id);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  await job.update(req.body);
  res.json({ success: true, data: job });
}

export async function deleteJob(req: Request, res: Response): Promise<void> {
  const job = await Job.findByPk(req.params.id);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  await Application.destroy({ where: { jobId: job.id } });
  await job.destroy();
  res.json({ success: true, message: 'Job deleted successfully' });
}

/** Aggregated stats for the admin dashboard. */
export async function dashboardStats(_req: Request, res: Response): Promise<void> {
  const [totalJobs, openJobs, totalApplications, totalUsers, byCategory] = await Promise.all([
    Job.count(),
    Job.count({ where: { status: 'open' } }),
    Application.count(),
    User.count({ where: { role: 'user' } }),
    Job.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      order: [[literal('count'), 'DESC']],
      raw: true,
    }),
  ]);

  const recentJobs = await Job.findAll({
    order: [['createdAt', 'DESC']],
    limit: 5,
  });

  res.json({
    success: true,
    data: {
      totals: { totalJobs, openJobs, closedJobs: totalJobs - openJobs, totalApplications, totalUsers },
      byCategory,
      recentJobs,
    },
  });
}
