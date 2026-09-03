"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/account";
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-3xl text-navy-900">Create an account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Already registered?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline">
          Sign in
        </Link>
      </p>
      <form
        className="mt-8 space-y-4 rounded-xl border border-navy-100 bg-white p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setPending(true);
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.get("name"),
              email: form.get("email"),
              password: form.get("password"),
              phone: form.get("phone"),
              marketingOptIn: Boolean(form.get("marketing")),
            }),
          });
          const data = await res.json();
          setPending(false);
          if (!res.ok) {
            toast.error(data.error);
            return;
          }
          router.push(next);
          router.refresh();
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
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={8} required className="mt-1" />
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" name="marketing" className="mt-1" />
          Email me about restocks and reorder reminders. You can unsubscribe
          anytime.
        </label>
        <Button className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
