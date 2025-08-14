// app/dashboard/layout.tsx
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">

      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="p-6 flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
