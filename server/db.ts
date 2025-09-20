import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use SQLite for development/testing or PostgreSQL for production
if (process.env.DATABASE_URL.startsWith('file:') || process.env.NODE_ENV === 'development') {
  // SQLite setup for development/testing
  const { db, pool } = await import('./db-sqlite.js');
  export { db, pool };
} else {
  // PostgreSQL setup for production
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = await import('ws');
  
  neonConfig.webSocketConstructor = ws.default;
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });
  
  export { db, pool };
}