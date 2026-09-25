# BlueNexLabs-Cosmetics

A cosmetics e-commerce store for cosmetic and face additives. The storefront shell matches the BlueNex Labs shop layout. The powder catalog is seeded from `prisma/cosmetics-catalog.json`.

Built with Next.js, Prisma, and SQLite locally. On Vercel the site is hosted by Vercel and the database lives in **Supabase** (Postgres). Checkout is Interac e-Transfer only.

**Deploy:** follow `GITHUB-AND-VERCEL.txt` (GitHub → Supabase project → Vercel). You do not need Vercel Postgres if you already use Supabase.

## Run locally

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Copy `.env.example` to `.env` and set `SESSION_SECRET` (32+ characters), admin credentials, and the Interac inbox.

## Demo logins

- Admin: `admin@bluenexlabs.com` / `bluenex-admin-2026`
- Customer: `researcher@example.com` / `research123`

`npm run db:seed` creates those users and syncs the cosmetics powder catalog from `prisma/cosmetics-catalog.json`. It does **not** import the inherited peptide catalog in `prisma/seed-data.json`. Set `SEED_LEGACY_CATALOG=true` only if you intentionally need that leftover data.

## What is included

- Shop, product pages, cart, and Canada-only checkout
- Optional customer accounts and order history (`REQUIRE_CUSTOMER_ACCOUNT=false` by default)
- Admin for orders, inventory, articles, and reorder follow-up

Shipping is $25.00 CAD, free at $299. Flip `REQUIRE_CUSTOMER_ACCOUNT=true` when you want to require sign-in at checkout.
