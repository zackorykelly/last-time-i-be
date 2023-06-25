import { Model, Sequelize, DataType, Table } from 'sequelize-typescript';

//Define interface for entity and intiialize in db
@Table
export default class Task extends Model {
  public id?: number;
  public title!: string;
  public description!: string;
  public completed?: boolean;
}
export const TaskInit = (sequelize: Sequelize) => {
  Task.init({
    id: {
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataType.STRING,
      allowNull: false,
    },
    description: {
      type: DataType.STRING,
      allowNull: false,
    },
    completed: {
      type: DataType.BOOLEAN,
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'task',
    tableName: 'task',
    timestamps: false
  });
  //Sync will create table if necessary
  Task.sync();
}