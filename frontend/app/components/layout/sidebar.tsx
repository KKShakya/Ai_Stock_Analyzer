"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Star, TrendingUp, Settings, HelpCircle } from "lucide-react";

type NavItem = { name: string; href: string; Icon: any };

const NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", Icon: Home },
  { name: "Watchlist", href: "/dashboard/watchlist", Icon: Star },
  { name: "Analytics", href: "/dashboard/analytics", Icon: TrendingUp },
  { name: "Settings", href: "/dashboard/settings", Icon: Settings },
];

export default function Sidebar() {
  const [hovered, setHovered] = useState(false);

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        h-screen sticky top-0 left-0 z-20 bg-card/95 backdrop-blur-md text-card-foreground
        border-r border-border shadow-sm
        transition-all duration-500 ease-in-out
        ${hovered ? "w-64" : "w-16"}
        flex flex-col items-center lg:items-stretch
        overflow-hidden
      `}
    >
      {/* Logo Section */}
      <div className={`
        flex items-center ${hovered ? "justify-start px-4" : "justify-center px-0"}
        py-6 w-full border-b border-border/50 min-h-[64px] transition-all duration-500
      `}>
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-lg shadow-lg flex-shrink-0">
          A
        </div>
        <span
          className={`
            ml-3 text-lg font-bold text-foreground select-none whitespace-nowrap
            transition-all duration-300 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          `}
        >
          AI Stock Analyzer
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0 mt-4 w-full">
        {NAV.map((item, idx) => (
          <Link key={item.name} href={item.href} className="group">
            <div
              className={`
                w-full flex items-center
                ${hovered ? "justify-start pl-6" : "justify-center"}
                gap-4 py-3 rounded-xl transition-all duration-300
                hover:bg-accent hover:text-accent-foreground
                active:scale-[0.98] hover:scale-[1.02]
              `}
            >
              <item.Icon className="h-5 w-5 transition-colors duration-200 group-hover:text-primary flex-shrink-0" />
              <span
                className={`
                  text-sm font-medium select-none
                  transition-all duration-300
                  ${hovered ? "opacity-100 ml-1 scale-100" : "opacity-0 ml-0 scale-90"}
                `}
                style={{
                  transitionDelay: hovered ? `${idx * 50 + 120}ms` : "0ms",
                }}
              >
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Help Section */}
      <div className={`p-3 border-t border-border/50 w-full`}>
        <button
          className={`
            w-full flex items-center
            ${hovered ? "justify-start pl-6" : "justify-center"}
            gap-3 py-3 rounded-xl transition-all duration-300
            hover:bg-accent hover:text-accent-foreground
          `}
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5 transition-colors duration-200 hover:text-primary flex-shrink-0" />
          <span
            className={`
              text-sm font-medium select-none
              transition-all duration-300
              ${hovered ? "opacity-100 ml-1 scale-100" : "opacity-0 ml-0 scale-90"}
            `}
            style={{
              transitionDelay: hovered ? "180ms" : "0ms",
            }}
          >
            Help & Support
          </span>
        </button>
      </div>
    </aside>
  );
}
