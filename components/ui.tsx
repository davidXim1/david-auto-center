import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "dark" | "ghost" }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition active:scale-[0.98]",
        variant === "primary" && "bg-brand-red text-white shadow-glow hover:bg-red-700",
        variant === "secondary" && "border border-zinc-200 bg-white text-zinc-950 hover:border-brand-red",
        variant === "dark" && "bg-zinc-950 text-white hover:bg-zinc-800",
        variant === "ghost" && "bg-transparent text-zinc-700 hover:bg-zinc-100",
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  className,
  variant = "primary",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: "primary" | "secondary" | "dark" | "ghost" }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition active:scale-[0.98]",
        variant === "primary" && "bg-brand-red text-white shadow-glow hover:bg-red-700",
        variant === "secondary" && "border border-zinc-200 bg-white text-zinc-950 hover:border-brand-red",
        variant === "dark" && "bg-zinc-950 text-white hover:bg-zinc-800",
        variant === "ghost" && "bg-transparent text-zinc-700 hover:bg-zinc-100",
        className
      )}
      {...props}
    />
  );
}

export function Card({ children, className, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={cn("rounded-lg border border-zinc-200 bg-white p-4 shadow-sm", className)} {...props}>{children}</section>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "red" | "green" | "dark" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        tone === "neutral" && "bg-zinc-100 text-zinc-700",
        tone === "red" && "bg-red-50 text-brand-red",
        tone === "green" && "bg-emerald-50 text-emerald-700",
        tone === "dark" && "bg-zinc-950 text-white"
      )}
    >
      {children}
    </span>
  );
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-600">
      {children} {required ? <span className="text-brand-red">*</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-brand-red focus:ring-4 focus:ring-red-100"
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-zinc-400 focus:border-brand-red focus:ring-4 focus:ring-red-100"
      {...props}
    />
  );
}
