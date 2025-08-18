// components/MetricCard.tsx
import SectionCard from "@/components/ui/section-card";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changePercent,
  isPositive
}) => {
  return (
    <SectionCard>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{title}</span>
        <span className="font-bold text-2xl text-foreground">
          {Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
        <span className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {change >= 0 ? "+" : ""}
          {change}
          {" ("}
          {changePercent >= 0 ? "+" : ""}
          {changePercent}%
          {")"}
        </span>
      </div>
    </SectionCard>
  );
};

export default MetricCard;
