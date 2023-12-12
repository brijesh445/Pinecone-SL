import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.MONGODB_URL;
const database = process.env.MONGODB_DATABASE;


const client = new MongoClient(connectionString);
export const conn: MongoClient = await client.connect();
export const db = conn.db(database);