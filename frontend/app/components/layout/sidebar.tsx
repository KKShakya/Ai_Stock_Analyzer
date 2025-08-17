// components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Star, TrendingUp, Settings } from "lucide-react";

type NavItem = { name: string; href: string; Icon: any };

const NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", Icon: Home },
  { name: "Watchlist", href: "/dashboard/watchlist", Icon: Star },
  { name: "Analytics", href: "/dashboard/analytics", Icon: TrendingUp },
  { name: "Settings", href: "/dashboard/settings", Icon: Settings },
];

export default function Sidebar() {
  // hovered controls expansion
  const [hovered, setHovered] = useState(false);

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        h-screen sticky top-0 left-0 z-20 bg-white/60 dark:bg-background text-foreground
        border-r border-slate-200 dark:border-slate-800
        transition-all duration-300 ease-in-out
        ${hovered ? "w-56" : "w-12"}
        backdrop-blur-sm
        flex flex-col items-stretch
      `}
    >
      <div className="px-2 py-4 flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow">
          A
        </div>
        {hovered && <div className="text-lg font-semibold">AI Stock Analyzer</div>}
      </div>

      <nav className="mt-6 flex-1">
        {NAV.map((item) => (
          <Link key={item.name} href={item.href} className="group">
            <div
              className={`
                flex items-center gap-4 px-1 py-3 mx-2 my-1 rounded-lg
                transition-colors duration-200 ease-in-out
                hover:bg-slate-100 dark:hover:bg-slate-800
                ${hovered ? "justify-start" : "justify-center"}
              `}
            >
              <item.Icon className="h-5 w-5 text-slate-700 dark:text-slate-200 group-hover:text-sky-500" />
              {hovered && <span className="text-sm font-medium">{item.name}</span>}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Help"
        >
          <div className="h-6 w-6 rounded-sm bg-slate-200 dark:bg-slate-700" />
          {hovered && <span className="text-sm">Help</span>}
        </button>
      </div>
    </aside>
  );
}
