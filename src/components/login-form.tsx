"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BrandLockup } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/account";
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6">
        <BrandLockup markClassName="h-10 w-10" />
      </div>
      <h1 className="display text-3xl text-navy-900">Sign in</h1>
      <p className="mt-2 text-sm text-slate-600">
        New here?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="underline">
          Create an account
        </Link>
      </p>
      <form
        className="mt-8 space-y-4 rounded-xl border border-navy-100 bg-white p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setPending(true);
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: form.get("email"),
              password: form.get("password"),
            }),
          });
          const data = await res.json();
          setPending(false);
          if (!res.ok) {
            toast.error(data.error);
            return;
          }
          router.push(data.role === "ADMIN" && next === "/account" ? "/admin" : next);
          router.refresh();
        }}
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required className="mt-1" />
        </div>
        <Button className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-xs text-slate-500">
          Demo customer: researcher@example.com / research123
        </p>
      </form>
    </div>
  );
}
