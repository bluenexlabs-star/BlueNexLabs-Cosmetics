import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatCad } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/constants";
import { AccountProfileForm } from "@/components/account-profile-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login?next=/account");
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.userId },
    include: { orders: { orderBy: { createdAt: "desc" }, include: { items: true } } },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-navy-900">Account</h1>
          <p className="mt-1 text-slate-600">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sessionUser.role === "ADMIN" && (
            <Button asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          )}
          <form action="/api/auth/logout" method="post">
            <LogoutButton />
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <AccountProfileForm user={user} />
        <div>
          <h2 className="font-semibold text-navy-900">Order history</h2>
          {user.orders.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {user.orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-navy-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/order/${order.id}`} className="font-semibold hover:underline">
                      {order.number}
                    </Link>
                    <Badge>{STATUS_LABEL[order.status] ?? order.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.createdAt.toLocaleDateString("en-CA")} · {formatCad(order.totalCents)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {order.items.map((i) => `${i.name} (${i.label}) × ${i.qty}`).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LogoutButton() {
  return (
    <Button
      variant="outline"
      formAction={async () => {
        "use server";
        const { getSession } = await import("@/lib/session");
        const session = await getSession();
        session.destroy();
        redirect("/");
      }}
    >
      Sign out
    </Button>
  );
}
