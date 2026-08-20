import { HTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "glass rounded-xl p-6 shadow-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1",
        className
      )}
      {...props}
    />
  );
}
