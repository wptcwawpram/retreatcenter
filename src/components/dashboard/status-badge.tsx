import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  config: Record<string, { label: string; color: string; bgColor: string }>;
  className?: string;
}

export function StatusBadge({ status, config, className }: StatusBadgeProps) {
  const cfg = config[status] ?? { label: status, color: "text-gray-700", bgColor: "bg-muted/40 border-border" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        cfg.color,
        cfg.bgColor,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
