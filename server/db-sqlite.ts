import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// Use SQLite for demo/testing
const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') || './dev.db');

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { sqlite as pool }; // For compatibility with existing code