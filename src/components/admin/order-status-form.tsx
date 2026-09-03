"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/constants";

export function OrderStatusForm({
  orderId,
  status,
  trackingNumber,
  notes,
}: {
  orderId: string;
  status: string;
  trackingNumber: string | null;
  notes: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <form
      className="space-y-3 rounded-xl border bg-white p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setPending(true);
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: form.get("status"),
            trackingNumber: form.get("trackingNumber") || null,
            notes: form.get("notes") || null,
          }),
        });
        setPending(false);
        if (!res.ok) toast.error("Update failed");
        else {
          toast.success("Order updated");
          router.refresh();
        }
      }}
    >
      <h2 className="font-semibold">Fulfillment</h2>
      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="mt-1 h-10 w-full rounded-md border px-2 text-sm"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="trackingNumber">Tracking</Label>
        <Input
          id="trackingNumber"
          name="trackingNumber"
          className="mt-1"
          defaultValue={trackingNumber ?? ""}
        />
      </div>
      <div>
        <Label htmlFor="notes">Internal notes</Label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={notes ?? ""}
          className="mt-1 min-h-24 w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <Button disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
