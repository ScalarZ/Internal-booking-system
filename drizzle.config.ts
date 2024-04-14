import type { Config } from "drizzle-kit";

const CONNECTION_STRING =
  "postgres://postgres.sgddpuwyvwbqkygpjbgg:Ramyfares101@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";

export default {
  schema: "./drizzle/*",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: CONNECTION_STRING,
  },
} satisfies Config;
