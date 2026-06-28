import { User } from './user.model';
import { Job } from './job.model';
import { Application } from './application.model';

// Associations
User.hasMany(Job, { foreignKey: 'postedBy', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'postedBy', as: 'author' });

User.hasMany(Application, { foreignKey: 'userId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'userId', as: 'applicant' });

Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

export { User, Job, Application };
