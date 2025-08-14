// components/ui/section-card.tsx
"use client";

import { Card } from "@/components/ui/card"; // shadcn Card
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function SectionCard({
  title,
  description,
  icon,
  actions,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Card className="bg-card text-card-foreground border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow min-h-[220px]">

        <div className="flex items-start gap-3 border-b border-border/70 px-5 py-4">
          {icon && (
            <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {actions}
        </div>
        <div className="p-5">{children}</div>
      </Card>
    </motion.div>
  );
}
