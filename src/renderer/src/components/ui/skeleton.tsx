import { cn } from "@renderer/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-[#2f3237]", className)} {...props} />;
}

export { Skeleton };
