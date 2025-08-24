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
  // Define STRONG visible glassmorphism variants for BOTH light and dark modes
  const backgroundVariant = isPositive 
    ? `bg-gradient-to-br from-green-100/60 via-green-50/40 to-green-100/30 
       dark:from-green-900/40 dark:via-green-800/30 dark:to-green-900/20
       border-green-200/70 dark:border-green-700/60
       shadow-lg hover:shadow-xl 
       hover:shadow-green-200/30 dark:hover:shadow-green-800/20` 
    : `bg-gradient-to-br from-red-100/60 via-red-50/40 to-red-100/30 
       dark:from-red-900/40 dark:via-red-800/30 dark:to-red-900/20
       border-red-200/70 dark:border-red-700/60
       shadow-lg hover:shadow-xl 
       hover:shadow-red-200/30 dark:hover:shadow-red-800/20`;

  return (
    <SectionCard 
      className={`
        ${backgroundVariant} 
        backdrop-blur-md 
        transition-all 
        duration-300 
        hover:scale-[1.02] 
        hover:-translate-y-1
        rounded-2xl 
        border
        group
        cursor-default
      `}
    >
      <div className="flex flex-col relative overflow-hidden">
        {/* Enhanced shine effect - works in both modes */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        
        <div className="relative z-10">
          <span className="text-xs text-muted-foreground font-medium">
            {title}
          </span>
          <span className="font-bold text-2xl text-foreground mt-1 block">
            {Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span className={`
            flex items-center gap-1.5 text-sm mt-2 font-semibold
            ${isPositive 
              ? "text-green-700 dark:text-green-300" 
              : "text-red-700 dark:text-red-300"
            }
          `}>
            {isPositive ? 
              <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" /> : 
              <TrendingDown className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            }
            <span>
              {change >= 0 ? "+" : ""}
              {change}
              {" ("}
              {changePercent >= 0 ? "+" : ""}
              {changePercent}%
              {")"}
            </span>
          </span>
        </div>

        {/* STRONG glow effect - optimized for both modes */}
        <div className={`
          absolute -top-2 -right-2 w-10 h-10 rounded-full blur-lg 
          opacity-50 group-hover:opacity-70 transition-opacity duration-300
          ${isPositive 
            ? "bg-green-500 dark:bg-green-400" 
            : "bg-red-500 dark:bg-red-400"
          }
        `} />
      </div>
    </SectionCard>
  );
};

export default MetricCard;
