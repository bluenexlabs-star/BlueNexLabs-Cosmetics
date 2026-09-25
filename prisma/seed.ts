import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { prepareDatabaseEnv } from "../src/lib/env";
import { cleanupProductDescription } from "../src/lib/product-description-cleanup";

prepareDatabaseEnv();

const prisma = new PrismaClient();

type VariantSeed = {
  sku: string;
  label: string;
  priceCents: number;
  stock: number;
};

type ProductSeed = {
  name: string;
  slug: string;
  category: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  variants: VariantSeed[];
  specs: Record<string, string>;
};

type PostSeed = {
  title: string;
  slug: string;
  category?: string;
  published?: boolean;
  excerpt?: string;
  bodyMarkdown?: string;
  coverImageUrl?: string;
  publishedAt?: number | string | null;
} & Record<string, unknown>;

async function syncCatalog(products: ProductSeed[]) {
  let created = 0;
  let updated = 0;
  let variantsCreated = 0;

  for (const product of products) {
    const description = cleanupProductDescription(product.description);
    const specsJson = JSON.stringify(product.specs ?? {});
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
      include: { variants: true },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          category: product.category,
          description,
          specsJson,
          imageUrl: product.imageUrl || null,
          featured: Boolean(product.featured),
          active: product.active !== false,
          sortOrder: product.sortOrder ?? 0,
          variants: {
            create: product.variants.map((v) => ({
              sku: v.sku,
              label: v.label,
              priceCents: v.priceCents,
              stock: v.stock,
            })),
          },
        },
      });
      created++;
      continue;
    }

    await prisma.product.update({
      where: { slug: product.slug },
      data: {
        name: product.name,
        category: product.category,
        description,
        specsJson,
        imageUrl: product.imageUrl || null,
        featured: Boolean(product.featured),
        active: product.active !== false,
        sortOrder: product.sortOrder ?? 0,
      },
    });
    updated++;

    for (const variant of product.variants) {
      const current = existing.variants.find((v) => v.sku === variant.sku);
      if (!current) {
        await prisma.variant.create({
          data: {
            productId: existing.id,
            sku: variant.sku,
            label: variant.label,
            priceCents: variant.priceCents,
            stock: variant.stock,
          },
        });
        variantsCreated++;
        continue;
      }

      await prisma.variant.update({
        where: { sku: variant.sku },
        data: {
          label: variant.label,
          priceCents: variant.priceCents,
        },
      });
    }
  }

  return { created, updated, variantsCreated };
}

async function ensureUsers() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@bluenexlabs.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD ?? "bluenex-admin-2026",
      10,
    );
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminHash,
        name: "BlueNex Admin",
        role: "ADMIN",
        marketingOptIn: false,
      },
    });
    console.log(`Created admin ${adminEmail}`);
  }

  const demoEmail = "researcher@example.com";
  const existingDemo = await prisma.user.findUnique({
    where: { email: demoEmail },
  });
  if (!existingDemo) {
    const demoHash = await bcrypt.hash("research123", 10);
    await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash: demoHash,
        name: "Alex Chen",
        phone: "604-555-0148",
        role: "CUSTOMER",
        marketingOptIn: true,
        addressLine1: "4309 Canada Way",
        city: "Burnaby",
        province: "BC",
        postalCode: "V5G 1J3",
      },
    });
    console.log(`Created demo customer ${demoEmail}`);
  }
}

async function main() {
  const seedLegacy = process.env.SEED_LEGACY_CATALOG === "true";
  if (!seedLegacy) {
    await ensureUsers();
    const catalogPath = path.join(__dirname, "cosmetics-catalog.json");
    const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as {
      products: ProductSeed[];
    };
    const { created, updated, variantsCreated } = await syncCatalog(
      catalog.products,
    );
    console.log(
      `Cosmetics catalog sync: ${created} product(s) added, ${updated} updated` +
        (variantsCreated ? `, ${variantsCreated} variant(s) added.` : "."),
    );
    console.log(
      "Inherited peptide catalog was not imported. Set SEED_LEGACY_CATALOG=true to import prisma/seed-data.json.",
    );
    return;
  }

  const dataPath = path.join(__dirname, "seed-data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8")) as {
    products: ProductSeed[];
    posts: PostSeed[];
  };

  const existing = await prisma.product.count();
  if (existing > 0 && process.env.FORCE_SEED !== "true") {
    const { created, updated, variantsCreated } = await syncCatalog(data.products);
    console.log(
      `Catalog sync: ${created} product(s) added, ${updated} updated` +
        (variantsCreated ? `, ${variantsCreated} variant(s) added.` : "."),
    );
    return;
  }

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "bluenex-admin-2026",
    10,
  );
  await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL ?? "admin@bluenexlabs.com",
      passwordHash: adminHash,
      name: "BlueNex Admin",
      role: "ADMIN",
      marketingOptIn: false,
    },
  });

  const demoHash = await bcrypt.hash("research123", 10);
  await prisma.user.create({
    data: {
      email: "researcher@example.com",
      passwordHash: demoHash,
      name: "Alex Chen",
      phone: "604-555-0148",
      role: "CUSTOMER",
      marketingOptIn: true,
      addressLine1: "4309 Canada Way",
      city: "Burnaby",
      province: "BC",
      postalCode: "V5G 1J3",
    },
  });

  for (const product of data.products) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        category: product.category,
        description: cleanupProductDescription(product.description),
        specsJson: JSON.stringify(product.specs ?? {}),
        imageUrl: product.imageUrl || null,
        featured: Boolean(product.featured),
        active: product.active !== false,
        sortOrder: product.sortOrder ?? 0,
        variants: {
          create: product.variants.map((v) => ({
            sku: v.sku,
            label: v.label,
            priceCents: v.priceCents,
            stock: v.stock,
          })),
        },
      },
    });
  }

  const usedSlugs = new Set<string>();
  for (const post of data.posts) {
    let slug = post.slug || "article";
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${post.slug}-${n++}`;
    }
    usedSlugs.add(slug);
    const publishedValue = post.publishedAt ?? post["publishedAt"];
    const publishedAt = publishedValue
      ? new Date(publishedValue as string | number)
      : new Date();
    await prisma.post.create({
      data: {
        title: post.title,
        slug,
        excerpt: String(post.excerpt ?? post["excerpt"] ?? ""),
        bodyMarkdown: String(
          post.bodyMarkdown ??
            post["bodyMarkdown"] ??
            post.excerpt ??
            post["excerpt"] ??
            "",
        ),
        coverImageUrl:
          (post.coverImageUrl as string | undefined) ||
          (post["coverImageUrl"] as string | undefined) ||
          null,
        category: post.category || "Research",
        published: post.published !== false,
        publishedAt: Number.isNaN(publishedAt.getTime())
          ? new Date()
          : publishedAt,
      },
    });
  }

  console.log(
    `Seeded ${data.products.length} products, ${data.posts.length} articles.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
