import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-navy-100 bg-white shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
