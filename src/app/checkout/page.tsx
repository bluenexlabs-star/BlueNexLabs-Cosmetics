import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { SITE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAccount } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const requireAcc = requireAccount();
  const record = user
    ? await prisma.user.findUnique({ where: { id: user.userId } })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="display text-3xl text-navy-900">Checkout</h1>
      <p className="mt-2 text-slate-600">
        Canada-only shipping. Payment is Interac e-Transfer to {SITE.interacEmail}{" "}
        after you receive the invoice. By placing an order you accept the{" "}
        <Link href="/terms" className="underline">
          Terms and Conditions
        </Link>
        .
      </p>
      <div className="mt-8">
        <CheckoutForm
          prefill={{
            signedIn: Boolean(user),
            requireAccount: requireAcc,
            name: record?.name,
            email: record?.email,
            phone: record?.phone ?? undefined,
            addressLine1: record?.addressLine1 ?? undefined,
            addressLine2: record?.addressLine2 ?? undefined,
            city: record?.city ?? undefined,
            province: record?.province ?? undefined,
            postalCode: record?.postalCode ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
