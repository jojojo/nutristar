import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

type DbClient = ReturnType<typeof drizzle>;

let db: DbClient | null = null;

export function getDb() {
  if (db) {
    return db;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize the database client.");
  }

  const sql = postgres(connectionString, {
    prepare: false,
    max: 10,
  });

  db = drizzle({ client: sql });

  return db;
}
