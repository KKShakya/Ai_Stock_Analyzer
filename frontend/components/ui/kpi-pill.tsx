// components/ui/kpi-pill.tsx
import { cn } from "@/lib/utils"; // if you have cn; else inline className
export default function KpiPill({
  label,
  value,
  trend,
}: { label: string; value: string; trend?: "up"|"down" }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <div className="text-lg font-semibold tracking-tight">{value}</div>
        {trend && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              trend === "up"  ? "bg-emerald-500/15 text-emerald-500" :
              "bg-rose-500/15 text-rose-500"
            )}
          >
            {trend === "up" ? "▲" : "▼"}
          </span>
        )}
      </div>
    </div>
  );
}
