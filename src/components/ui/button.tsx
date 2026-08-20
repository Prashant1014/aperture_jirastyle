import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "@/lib/clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-white text-black hover:bg-neutral-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]",
  secondary: "glass text-foreground hover:bg-white/10",
  ghost: "bg-transparent text-foreground hover:bg-white/10",
  danger: "bg-danger/20 text-danger border border-danger/50 hover:bg-danger/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-1.5",
  md: "text-sm px-5 py-2.5",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
