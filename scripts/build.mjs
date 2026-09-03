import { spawnSync } from "node:child_process";

function prepareEnv() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_DATABASE_URL ||
      "";
  }
  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL =
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_DIRECT_URL ||
      process.env.DATABASE_URL ||
      "";
  }
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

prepareEnv();

const databaseUrl = process.env.DATABASE_URL ?? "";
const isPostgres =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://");

if (isPostgres) {
  if (!process.env.DIRECT_URL) {
    console.error(
      "Supabase/Postgres builds need DIRECT_URL (direct or session pooler, port 5432) plus DATABASE_URL (transaction pooler, port 6543).",
    );
    process.exit(1);
  }
  const schema = "prisma/postgres/schema.prisma";
  run("npx", ["prisma", "generate", "--schema", schema]);
  run("npx", ["prisma", "migrate", "deploy", "--schema", schema]);
  run("npx", ["tsx", "prisma/seed.ts"]);
} else {
  run("npx", ["prisma", "generate"]);
}

run("npx", ["next", "build"]);
