import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const tones = {
  default: "border-primary/20 bg-primary/10 text-primary",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  danger: "border-destructive/20 bg-destructive/10 text-destructive",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones };

export default function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border-l-2 px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
