"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = {
  productName: string;
  variantId: string;
  sku: string;
  label: string;
  priceCents: number;
  stock: number;
  active: boolean;
};

type DraftRow = Row & { priceInput: string };

function centsToDollarsInput(cents: number) {
  return (cents / 100).toFixed(2);
}

export function InventoryTable({ rows }: { rows: Row[] }) {
  const [data, setData] = useState<DraftRow[]>(() =>
    rows.map((row) => ({
      ...row,
      priceInput: centsToDollarsInput(row.priceCents),
    })),
  );
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-navy-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2">SKU</th>
            <th className="px-3 py-2">Size</th>
            <th className="px-3 py-2">Price (CAD)</th>
            <th className="px-3 py-2">Stock</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.variantId} className={`border-t ${row.stock < 5 ? "bg-amber-50" : ""}`}>
              <td className="px-3 py-2">
                {row.productName}
                {!row.active && (
                  <span className="ml-2 text-xs text-slate-400">hidden</span>
                )}
              </td>
              <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
              <td className="px-3 py-2">{row.label}</td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.priceInput}
                  onChange={(e) => {
                    const next = [...data];
                    next[idx] = { ...row, priceInput: e.target.value };
                    setData(next);
                  }}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  value={row.stock}
                  onChange={(e) => {
                    const next = [...data];
                    next[idx] = { ...row, stock: Number(e.target.value) };
                    setData(next);
                  }}
                />
              </td>
              <td className="px-3 py-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const dollars = Number(row.priceInput);
                    if (!Number.isFinite(dollars) || dollars < 0) {
                      toast.error("Enter a valid price in dollars");
                      return;
                    }
                    const priceCents = Math.round(dollars * 100);
                    const res = await fetch(`/api/admin/variants/${row.variantId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        priceCents,
                        stock: row.stock,
                      }),
                    });
                    if (!res.ok) toast.error("Save failed");
                    else {
                      const next = [...data];
                      next[idx] = {
                        ...row,
                        priceCents,
                        priceInput: centsToDollarsInput(priceCents),
                      };
                      setData(next);
                      toast.success(`${row.sku} updated`);
                    }
                  }}
                >
                  Save
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
