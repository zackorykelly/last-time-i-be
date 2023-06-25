import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv'
dotenv.config()

const connection = new Sequelize({
    dialect: "postgres",
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    password: process.env.PGPASS,
    database: process.env.PGDB,
});

export default connection;