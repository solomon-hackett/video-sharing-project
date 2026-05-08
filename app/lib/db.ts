import { Pool } from "pg";
import postgres from "postgres";

export const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});
