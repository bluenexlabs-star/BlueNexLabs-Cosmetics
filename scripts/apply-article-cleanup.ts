import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prepareDatabaseEnv } from "../src/lib/env";
import { prisma } from "../src/lib/prisma";
import { cleanupArticleHtml } from "../src/lib/article-cleanup";

prepareDatabaseEnv();

type PostSeed = {
  slug: string;
  bodyMarkdown?: string;
  [key: string]: unknown;
};

async function main() {
  const dataPath = path.join(process.cwd(), "prisma", "seed-data.json");
  const original = fs.readFileSync(dataPath, "utf8");
  const data = JSON.parse(original) as { posts: PostSeed[] };
  const postsStart = original.indexOf('  "posts":');
  if (postsStart < 0) throw new Error("Could not find posts array in seed-data.json");

  let cleaned = 0;
  for (const post of data.posts) {
    const next = cleanupArticleHtml(String(post.bodyMarkdown ?? ""));
    if (next && next !== post.bodyMarkdown) {
      post.bodyMarkdown = next;
      cleaned += 1;
    }
  }

  const postsJson = JSON.stringify(data.posts, null, 2).replace(/\n/g, "\n  ");
  fs.writeFileSync(dataPath, `${original.slice(0, postsStart)}  "posts": ${postsJson}\n}\n`);

  let dbUpdated = 0;
  for (const post of data.posts) {
    const result = await prisma.post.updateMany({
      where: { slug: post.slug },
      data: { bodyMarkdown: String(post.bodyMarkdown ?? "") },
    });
    dbUpdated += result.count;
  }

  console.log(`Seed bodies rewritten: ${cleaned}. Local DB rows updated: ${dbUpdated}.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
