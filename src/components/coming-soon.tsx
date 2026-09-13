import type { ReactNode } from "react";

export function ComingSoon({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-navy-200 bg-white px-6 py-10 text-center">
      <p className="font-semibold text-navy-900">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {children}
      </p>
    </div>
  );
}
