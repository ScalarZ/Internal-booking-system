import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const connectionString = process.env.CONNECTION_STRING!;

const client = postgres(connectionString);

let db: PostgresJsDatabase<typeof schema>;
let pg: ReturnType<typeof postgres>;

if (process.env.NODE_ENV === "production") {
  pg = postgres(connectionString);
  db = drizzle(pg, { schema });
} else {
  if (!(global as any).database!) {
    pg = postgres(connectionString);
    (global as any).database = drizzle(pg, { schema });
  }
  db = (global as any).database;
}

export { db, pg };

const migrateDB = async () => {
  await migrate(db, {
    migrationsFolder: "./drizzle",
  });
  client.end();
};

// migrateDB();
