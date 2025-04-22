import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema';

// Create a PostgreSQL connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a drizzle instance
export const db = drizzle(pool, { schema });

// Database migrations should be run separately via drizzle-kit