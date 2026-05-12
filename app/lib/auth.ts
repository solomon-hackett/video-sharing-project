import { betterAuth } from 'better-auth';
import { adminClient } from 'better-auth/client/plugins';
import { admin } from 'better-auth/plugins';
import { Pool } from 'pg';

const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});


export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), adminClient()],
});
