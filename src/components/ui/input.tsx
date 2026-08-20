import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "@/lib/clsx";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent",
          className
        )}
        style={{ colorScheme: "dark" }}
        {...props}
      />
    );
  }
);
