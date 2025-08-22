// components/layout/header.tsx (Updated version)
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  Zap,
  Crown
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks
import { useAuthStore } from "@/hooks/use-auth";
import { useSearchStore, useSearchKeyboard } from "@/hooks/use-search";
import { useNotificationStore } from "@/hooks/use-notifications";
import { usePageTitle } from "@/hooks/use-page-title";

// Components
import ThemeToggle from "@/components/theme-toggle";
import SearchModal from "@/components/layout/search/search-modal";
import NotificationPanel from "@/components/layout/notifications/notification-panel";
import MobileSidebar from "@/components/layout/mobile-sidebar"; // ← Added

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // ← Added
  const pathname = usePathname();
  const pageTitle = usePageTitle();

  // Store hooks
  const { isAuthenticated, user, openLoginModal, logout } = useAuthStore();
  const { openSearch } = useSearchStore();
  const { unreadCount, togglePanel } = useNotificationStore();

  // Enable Alt+S search shortcut
  useSearchKeyboard();

  const handleSearchClick = () => {
    openSearch();
  };

  const handleLoginClick = () => {
    openLoginModal();
  };

  // Mobile menu toggle handler ← Updated
  const handleMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
    onMenuToggle?.(); // Call parent callback if provided
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">

        {/* Left Section */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {/* Mobile Menu Toggle - Updated */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={handleMenuToggle} 
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Dynamic Page Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">
              {pageTitle}
            </h1>
            {pathname !== '/' && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {isAuthenticated ? (user?.plan === 'free' ? 'Free' : 'Pro') : 'Guest'}
              </Badge>
            )}
          </div>
        </div>

        {/* Center Section - Modern Cylindrical Search */}
        <motion.div
          className="flex-1 max-w-md mx-8 hidden md:block"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            onClick={handleSearchClick}
            className="relative w-full h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300 group border border-gray-200/50 dark:border-gray-700/50"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 px-4 h-full">
              {/* Search Icon */}
              <Search className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />

              {/* Search Text */}
              <span className="flex-1 text-left text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                Search stocks, indices...
              </span>

              {/* Keyboard Shortcut */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100/80 dark:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Alt</span>
                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">S</span>
              </div>
            </div>

            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-cyan-50/0 dark:from-blue-950/0 dark:via-blue-950/50 dark:to-cyan-950/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={handleSearchClick}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Usage Indicator (for authenticated users) */}
          {isAuthenticated && user && (
            <motion.div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200/50 dark:border-green-800/50"
              whileHover={{ scale: 1.02 }}
            >
              <Zap className="h-4 w-4 text-green-500" />
              <span className={`text-sm font-medium ${getUsageColor(user.apiCallsUsed, user.apiCallsLimit)}`}>
                {user.apiCallsUsed}/{user.apiCallsLimit}
              </span>
              <span className="text-xs text-muted-foreground">calls</span>
            </motion.div>
          )}

          {/* Enhanced Notifications Bell */}
          <motion.div className="relative whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:shadow-md transition-all duration-200 rounded-full"
              onClick={togglePanel}
              aria-label="Notifications"

            >
              <Bell className="h-5 w-5" />

              {/* Custom Red Notification Badge */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-xs font-bold px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </motion.div>
              )}
            </Button>
          </motion.div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth Section */}
          {isAuthenticated && user ? (
            /* Authenticated User Menu */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="relative h-9 w-9 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >

                  <div className="relative">
                    <img
                      src={user.avatar || "/avatars/Avatar-1.png"}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover transition-all duration-200
                             shadow-lg shadow-black/20
                             ring-1 ring-black/10 
                              hover:ring-1 hover:ring-primary/40
                             dark:ring-white/20 dark:shadow-white/10"
                      style={{
                        filter: 'drop-shadow(0 0 0 1px rgba(255,255,255,0.5))'
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  </div>



                </motion.button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-64 p-2 rounded-xl shadow-2xl border border-border bg-card/95 backdrop-blur-md"
                align="end"
                forceMount
              >
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="relative">
                    <img
                      src={user.avatar || "/avatars/Avatar-1.png"}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover transition-all duration-200
               shadow-lg shadow-black/20
               ring-1 ring-black/10 
               hover:ring-1 hover:ring-primary/40
               dark:ring-white/20 dark:shadow-white/10"
                      style={{
                        filter: 'drop-shadow(0 0 0 1px rgba(255,255,255,0.5))'
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  </div>


                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {user.plan === 'pro' && <Crown className="h-3 w-3 text-yellow-500" />}
                      <span className="text-xs font-medium capitalize">{user.plan} Plan</span>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="rounded-md cursor-pointer hover:bg-accent/50">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-md cursor-pointer hover:bg-accent/50">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                {user.plan === 'free' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-md cursor-pointer text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 focus:text-blue-600">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="rounded-md cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950 focus:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Modern Login Button */
            <motion.button
              onClick={handleLoginClick}
              className="relative px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 text-foreground border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm group overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient that appears on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                layoutId="loginGradient"
              />

              {/* Text */}
              <span className="relative z-10 text-sm font-small group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                Login
              </span>

              {/* Subtle shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                style={{ width: '100%' }}
              />
            </motion.button>
          )}
        </div>
      </header>

      {/* Mobile Sidebar - Now Connected! */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal />

      {/* Notification Panel */}
      <NotificationPanel />
    </>
  );
}
