import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export const APPLICATION_STATUSES = ['applied', 'reviewing', 'accepted', 'rejected'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export class Application extends Model<
  InferAttributes<Application>,
  InferCreationAttributes<Application>
> {
  declare id: CreationOptional<number>;
  declare jobId: number;
  declare userId: number;
  declare coverLetter: CreationOptional<string | null>;
  declare status: CreationOptional<ApplicationStatus>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Application.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    coverLetter: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM(...APPLICATION_STATUSES),
      allowNull: false,
      defaultValue: 'applied',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'applications',
    indexes: [{ unique: true, fields: ['job_id', 'user_id'] }],
  }
);
