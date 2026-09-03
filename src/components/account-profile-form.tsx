"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PROVINCES } from "@/lib/constants";

export function AccountProfileForm({
  user,
}: {
  user: {
    name: string;
    phone: string | null;
    marketingOptIn: boolean;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
  };
}) {
  const [pending, setPending] = useState(false);
  return (
    <form
      className="space-y-3 rounded-xl border border-navy-100 bg-white p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setPending(true);
        const res = await fetch("/api/account/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            phone: form.get("phone"),
            marketingOptIn: Boolean(form.get("marketing")),
            addressLine1: form.get("addressLine1"),
            addressLine2: form.get("addressLine2"),
            city: form.get("city"),
            province: form.get("province"),
            postalCode: form.get("postalCode"),
          }),
        });
        setPending(false);
        if (!res.ok) toast.error("Could not save profile");
        else toast.success("Profile saved");
      }}
    >
      <h2 className="font-semibold text-navy-900">Profile & shipping</h2>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={user.name} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={user.phone ?? ""} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="addressLine1">Address</Label>
        <Input id="addressLine1" name="addressLine1" defaultValue={user.addressLine1 ?? ""} className="mt-1" />
      </div>
      <Input name="addressLine2" placeholder="Suite (optional)" defaultValue={user.addressLine2 ?? ""} />
      <div className="grid grid-cols-2 gap-2">
        <Input name="city" placeholder="City" defaultValue={user.city ?? ""} />
        <select
          name="province"
          defaultValue={user.province ?? "BC"}
          className="h-10 rounded-md border border-navy-200 px-2 text-sm"
        >
          {PROVINCES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <Input name="postalCode" placeholder="Postal code" defaultValue={user.postalCode ?? ""} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="marketing" defaultChecked={user.marketingOptIn} />
        Marketing / reorder emails
      </label>
      <Button disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}
