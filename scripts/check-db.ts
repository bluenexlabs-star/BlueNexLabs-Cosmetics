import "dotenv/config";
import { prepareDatabaseEnv, isPostgresUrl } from "../src/lib/env";
import { prisma } from "../src/lib/prisma";

prepareDatabaseEnv();

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  console.log(
    isPostgresUrl(url)
      ? "Using Postgres/Supabase connection."
      : "Using local SQLite connection.",
  );
  const [products, posts] = await Promise.all([
    prisma.product.count(),
    prisma.post.count(),
  ]);
  console.log(`Connected. Products: ${products}. Articles: ${posts}.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Database connection failed.");
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
