"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SITE } from "@/lib/constants";

export default function ContactPage() {
  const [pending, setPending] = useState(false);
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <h1 className="display text-4xl text-navy-900">Contact the lab desk</h1>
        <p className="mt-4 text-slate-600 leading-7">
          Need a COA? See the{" "}
          <Link className="underline" href="/certificates">
            certificates library
          </Link>
          . Backorder questions and institutional invoices go to {SITE.email}.
          We answer within one business day.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          {SITE.address}
          <br />
          {SITE.hours}
        </p>
      </div>
      <form
        className="space-y-4 rounded-xl border border-navy-100 bg-white p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setPending(true);
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.get("name"),
              email: form.get("email"),
              message: form.get("message"),
            }),
          });
          setPending(false);
          if (!res.ok) toast.error("Could not send");
          else {
            toast.success("Message received — we will reply by email.");
            e.currentTarget.reset();
          }
        }}
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            name="message"
            required
            minLength={8}
            className="mt-1 min-h-32 w-full rounded-md border border-navy-200 px-3 py-2 text-sm"
          />
        </div>
        <Button disabled={pending}>{pending ? "Sending…" : "Send"}</Button>
      </form>
    </div>
  );
}
