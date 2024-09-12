import { defineConfig } from "drizzle-kit";

const CONNECTION_STRING =
  "postgres://postgres.sgddpuwyvwbqkygpjbgg:Ramyfares101@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // @ts-ignore
    url: CONNECTION_STRING,
  },
  migrations: {
    prefix: "supabase",
  },
});
