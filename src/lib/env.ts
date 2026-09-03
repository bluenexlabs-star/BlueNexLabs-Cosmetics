/** Normalize Supabase / Vercel / Prisma env names before the client is created. */
export function prepareDatabaseEnv() {
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
      "";
  }

  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!isPostgresUrl(databaseUrl)) return;

  process.env.DATABASE_URL = withSslAndPooler(databaseUrl, true);

  const direct =
    process.env.DIRECT_URL && process.env.DIRECT_URL.length > 0
      ? process.env.DIRECT_URL
      : stripPooler(process.env.DATABASE_URL);
  process.env.DIRECT_URL = withSslAndPooler(direct, false);
}

export function isPostgresUrl(url = process.env.DATABASE_URL ?? "") {
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

function withSslAndPooler(url: string, pooled: boolean) {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    const port = parsed.port;
    const looksPooled =
      port === "6543" ||
      parsed.hostname.includes("pooler.supabase.com") ||
      parsed.searchParams.has("pgbouncer");
    if (pooled && looksPooled && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    if (!pooled) {
      parsed.searchParams.delete("pgbouncer");
      if (port === "6543") parsed.port = "5432";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function stripPooler(url: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("pgbouncer");
    if (parsed.port === "6543") parsed.port = "5432";
    return parsed.toString();
  } catch {
    return url;
  }
}
