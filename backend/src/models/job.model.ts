import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export const JOB_CATEGORIES = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Customer Support',
] as const;

export const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'] as const;
export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'] as const;
export const JOB_STATUSES = ['open', 'closed'] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type JobType = (typeof JOB_TYPES)[number];
export type JobStatus = (typeof JOB_STATUSES)[number];

export class Job extends Model<InferAttributes<Job>, InferCreationAttributes<Job>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare company: string;
  declare description: string;
  declare category: JobCategory;
  declare experienceLevel: ExperienceLevel;
  declare jobType: JobType;
  declare location: string;
  declare salaryMin: CreationOptional<number | null>;
  declare salaryMax: CreationOptional<number | null>;
  declare isFeatured: CreationOptional<boolean>;
  declare status: CreationOptional<JobStatus>;
  declare postedBy: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    company: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    experienceLevel: { type: DataTypes.STRING, allowNull: false },
    jobType: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    salaryMin: { type: DataTypes.INTEGER, allowNull: true },
    salaryMax: { type: DataTypes.INTEGER, allowNull: true },
    isFeatured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    status: {
      type: DataTypes.ENUM(...JOB_STATUSES),
      allowNull: false,
      defaultValue: 'open',
    },
    postedBy: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'jobs',
    indexes: [
      { fields: ['category'] },
      { fields: ['experience_level'] },
      { fields: ['status'] },
    ],
  }
);
