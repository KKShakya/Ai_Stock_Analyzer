// components/Header.tsx
"use client";

import ThemeToggle from "../../../components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // if using shadcn avatar or fallback
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-transparent">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          {/* <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" /> */}
        </button>
        <div className="text-lg font-semibold">Dashboard</div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
        <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer ring-2 ring-primary hover:ring-primary/70 transition-all duration-200">
          <AvatarImage src="/avatar.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* AnimatePresence handles enter/exit animations */}
      <AnimatePresence>
        <DropdownMenuContent
          asChild
          className="w-48 p-1 rounded-xl shadow-lg border border-border bg-popover"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <DropdownMenuItem className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-md px-3 py-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
              Logout
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </AnimatePresence>
    </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
