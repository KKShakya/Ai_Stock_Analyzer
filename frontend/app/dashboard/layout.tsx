// app/dashboard/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle page backdrop glow */}
      <div className="pointer-events-none fixed inset-0 opacity-50 blur-3xl" 
           style={{ background:
            "radial-gradient(60% 40% at 50% -10%, color-mix(in oklch, var(--brand) 20%, transparent), transparent)" }} />
      <div className="relative flex">
        <Sidebar />
        <div className="flex-1 flex min-h-screen flex-col">
          <Header />
          <main className="px-4 py-6"> 
            <div className="w-full">{children}</div> 
          </main>
        </div>
      </div>
    </div>
  );
}
