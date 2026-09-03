import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prepareDatabaseEnv } from "../src/lib/env";
import { prisma } from "../src/lib/prisma";
import { cleanupProductDescription } from "../src/lib/product-description-cleanup";

prepareDatabaseEnv();

type ProductSeed = {
  slug: string;
  description?: string;
  [key: string]: unknown;
};

async function main() {
  const dataPath = path.join(process.cwd(), "prisma", "seed-data.json");
  const original = fs.readFileSync(dataPath, "utf8");
  const data = JSON.parse(original) as { products: ProductSeed[] };
  const postsStart = original.indexOf('  "posts":');
  if (postsStart < 0) throw new Error("Could not find posts array in seed-data.json");

  let cleaned = 0;
  for (const product of data.products) {
    const next = cleanupProductDescription(String(product.description ?? ""));
    if (next !== product.description) {
      product.description = next;
      cleaned += 1;
    }
  }

  const productsJson = JSON.stringify(data.products, null, 2).replace(/\n/g, "\n  ");
  fs.writeFileSync(
    dataPath,
    `{\n  "products": ${productsJson},\n${original.slice(postsStart)}`,
  );

  let dbUpdated = 0;
  for (const product of data.products) {
    const result = await prisma.product.updateMany({
      where: { slug: product.slug },
      data: { description: String(product.description ?? "") },
    });
    dbUpdated += result.count;
  }

  console.log(
    `Seed descriptions rewritten: ${cleaned}. Local DB rows updated: ${dbUpdated}.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
