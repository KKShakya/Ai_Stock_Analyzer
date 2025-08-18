import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function SectionCard({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
  ...props
}: {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        // Using ShadCN theme variables instead of hardcoded colors
        "bg-card text-card-foreground rounded-xl border border-border shadow-lg overflow-hidden h-full flex flex-col transition-colors",
        className
      )}
      {...props}
    >
      {(title || icon || actions) && (
        <div className={cn(
          "px-6 py-4 border-b border-border flex-shrink-0",
          headerClassName
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <div className="text-primary">{icon}</div>}
              <div>
                <h3 className="text-foreground font-semibold text-base">{title}</h3>
                {subtitle && (
                  <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      )}
      <div className={cn(
        "flex-1 p-6 overflow-hidden",
        contentClassName
      )}>
        {children}
      </div>
    </div>
  );
}

export default SectionCard;
