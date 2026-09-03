import { prisma } from "@/lib/prisma";
import { formatCad } from "@/lib/utils";
import { InventoryTable } from "@/components/admin/inventory-table";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    include: { variants: { orderBy: { priceCents: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      productName: p.name,
      productId: p.id,
      active: p.active,
      variantId: v.id,
      sku: v.sku,
      label: v.label,
      priceCents: v.priceCents,
      stock: v.stock,
      priceLabel: formatCad(v.priceCents),
    })),
  );
  return (
    <div>
      <h1 className="display text-3xl text-navy-900">Inventory</h1>
      <p className="mt-2 text-sm text-slate-600">
        Inline stock and price edits. Rows under 5 units are flagged.
      </p>
      <InventoryTable rows={rows} />
    </div>
  );
}
