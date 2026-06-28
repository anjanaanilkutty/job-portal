import { Sequelize } from 'sequelize';
import { env } from './env';

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? false : false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
  // sync schema. In production prefer migrations; alter is convenient for the exercise.
  await sequelize.sync({ alter: true });
}
