import { sequelize } from '../config/database';
import { User, Job } from '../models';
import {
  JOB_CATEGORIES,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
} from '../models/job.model';

const companies = [
  'Northwind Labs',
  'Brightwave Systems',
  'Helix Digital',
  'Vertex Studios',
  'Quanta Works',
  'Pioneer Tech',
  'Lumen Software',
  'Cobalt Analytics',
];

const locations = ['Bengaluru', 'Mumbai', 'Kochi', 'Remote', 'Hyderabad', 'Pune', 'Chennai'];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

async function seed() {
  await sequelize.sync({ force: true });
  // eslint-disable-next-line no-console
  console.log('Schema reset.');

  const admin = await User.create({
    name: 'Portal Admin',
    email: 'admin@jobportal.test',
    password: 'admin123',
    role: 'admin',
  });

  await User.create({
    name: 'Sample Candidate',
    email: 'user@jobportal.test',
    password: 'user1234',
    role: 'user',
  });

  const titles = [
    'Senior Full-stack Developer',
    'Frontend Engineer',
    'Backend Engineer',
    'Product Designer',
    'Product Manager',
    'Marketing Specialist',
    'Sales Executive',
    'Financial Analyst',
    'HR Business Partner',
    'Customer Support Lead',
    'DevOps Engineer',
    'Data Analyst',
    'UX Researcher',
    'Mobile Developer',
    'QA Automation Engineer',
    'Technical Writer',
  ];

  const jobs = titles.map((title, i) => ({
    title,
    company: pick(companies, i),
    description:
      `We are looking for a ${title} to join our growing team. ` +
      'You will collaborate with cross-functional teams, ship high-quality work, ' +
      'and help shape the product roadmap. Strong communication and ownership are essential.',
    category: pick(JOB_CATEGORIES, i),
    experienceLevel: pick(EXPERIENCE_LEVELS, i),
    jobType: pick(JOB_TYPES, i),
    location: pick(locations, i),
    salaryMin: 600000 + i * 50000,
    salaryMax: 1200000 + i * 60000,
    isFeatured: i < 4,
    status: (i % 7 === 0 ? 'closed' : 'open') as 'open' | 'closed',
    postedBy: admin.id,
  }));

  await Job.bulkCreate(jobs);

  // eslint-disable-next-line no-console
  console.log(`Seeded ${jobs.length} jobs.`);
  // eslint-disable-next-line no-console
  console.log('Admin login: admin@jobportal.test / admin123');
  // eslint-disable-next-line no-console
  console.log('User login:  user@jobportal.test / user1234');

  await sequelize.close();
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
