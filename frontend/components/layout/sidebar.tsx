// components/layout/sidebar.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Hooks and stores
import { useAuthStore } from "@/hooks/use-auth";

// Navigation data - Import the helper function
import { 
  NAVIGATION_ITEMS, 
  HELP_ITEM, 
  PRO_ITEMS, 
  getNavigationForRoute,
  type NavItem 
} from "@/lib/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, openLoginModal } = useAuthStore();

  // Get route-specific navigation
  const { mainNavigation, proItems, helpItem } = useMemo(() => 
    getNavigationForRoute(pathname), 
    [pathname]
  );

  // Check if user can access a nav item
  const canAccess = (item: NavItem) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.requiresPro && (!user || user.plan === 'free')) return false;
    return true;
  };

  // Get appropriate styling for nav items
  const getItemStyles = (item: NavItem, isActive: boolean) => {
    const canUserAccess = canAccess(item);
    const isLocked = item.requiresAuth && !isAuthenticated;
    const isProLocked = item.requiresPro && user?.plan === 'free';
    
    return cn(
      // Base styling
      "w-full flex items-center gap-4 py-3 px-3 rounded-xl transition-all duration-500 group relative",
      "transform-gpu",
      
      // Modern hover effects
      canUserAccess && [
        "hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10",
        "hover:shadow-lg hover:shadow-primary/10",
        "hover:scale-[1.01]",
        "active:scale-[0.99]",
      ],
      
      // Active state
      isActive && canUserAccess && [
        "bg-gradient-to-r from-primary/10 to-primary/5",
        "text-primary",
        "shadow-lg shadow-primary/15",
        "backdrop-blur-sm",
      ],
      
      // Locked states
      (isLocked || isProLocked) && [
        "opacity-60 cursor-pointer",
        "hover:opacity-80 hover:bg-muted/20 hover:shadow-md hover:shadow-black/5",
      ],
      
      // Coming soon
      item.comingSoon && "opacity-50 cursor-not-allowed"
    );
  };

  // Handle navigation item click
  const handleItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.comingSoon) {
      e.preventDefault();
      return;
    }
    
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openLoginModal();
      return;
    }
    
    if (item.requiresPro && user?.plan === 'free') {
      e.preventDefault();
      console.log('Upgrade to Pro required');
      return;
    }
  };

  // Render navigation item
  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = pathname === item.href;
    const canUserAccess = canAccess(item);
    const isLocked = item.requiresAuth && !isAuthenticated;
    const isProLocked = item.requiresPro && user?.plan === 'free';

    const navItem = (
      <Link 
        href={canUserAccess ? item.href : "#"} 
        onClick={(e) => handleItemClick(item, e)}
        className="block"
      >
        <motion.div 
          className={getItemStyles(item, isActive)}
          whileHover={{ 
            x: isHovered ? 4 : 0,
            transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
          }}
          whileTap={{ 
            scale: canUserAccess ? 0.98 : 1,
            transition: { duration: 0.1 }
          }}
        >
          
          {/* Icon with improved styling */}
          <div className="relative flex-shrink-0">
            <motion.div
              whileHover={{ 
                scale: canUserAccess ? 1.1 : 1,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-all duration-300",
                isActive && canUserAccess && "text-primary drop-shadow-sm",
                canUserAccess && "group-hover:text-primary group-hover:drop-shadow-sm",
                !isActive && canUserAccess && "text-muted-foreground"
              )} />
            </motion.div>
            
            {/* Pro indicator */}
            {isProLocked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-sm"
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </motion.div>
            )}
          </div>

          {/* Label */}
          <motion.span
            className={cn(
              "text-sm font-medium select-none transition-all duration-300",
              isActive && canUserAccess && "text-primary font-semibold",
              !isActive && canUserAccess && "group-hover:text-foreground",
              isHovered ? "opacity-100 ml-1 scale-100" : "opacity-0 ml-0 scale-90"
            )}
            style={{
              transitionDelay: isHovered ? `${index * 50 + 120}ms` : "0ms",
            }}
          >
            {item.name}
          </motion.span>

          {/* Enhanced badges */}
          {isHovered && (
            <motion.div 
              className="ml-auto flex items-center gap-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {item.comingSoon && (
                <Badge 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
                >
                  Soon
                </Badge>
              )}
             
              {isProLocked && (
                <Badge className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-sm">
                  Pro
                </Badge>
              )}
            </motion.div>
          )}

          {/* Active item indicator */}
          {isActive && canUserAccess && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-r-full"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.div>
      </Link>
    );

    // Wrap with tooltip for collapsed state
    if (!isHovered && (isLocked || isProLocked || item.comingSoon)) {
      return (
        <TooltipProvider key={item.name}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              {navItem}
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              className="ml-2 bg-popover/95 backdrop-blur-sm border-border/50 shadow-2xl"
            >
              <div className="text-center">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
                {isLocked && (
                  <p className="text-xs text-amber-600 mt-1">Login required</p>
                )}
                {isProLocked && (
                  <p className="text-xs text-orange-600 mt-1">Pro feature</p>
                )}
                {item.comingSoon && (
                  <p className="text-xs text-blue-600 mt-1">Coming soon</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <div key={item.name}>{navItem}</div>;
  };

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ width: isHovered ? 240 : 60 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "h-screen sticky top-0 left-0 z-20 bg-card/95 backdrop-blur-md text-card-foreground",
        "border-r border-border shadow-sm",
        "flex flex-col items-center lg:items-stretch overflow-hidden",
        className
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center w-full border-b border-border/50 min-h-[64px] transition-all duration-500",
        isHovered ? "justify-start px-3" : "justify-start px-2"
      )}>
        <motion.div 
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-lg shadow-lg flex-shrink-0 relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          A
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-30 blur-md -z-10" />
        </motion.div>
        
        <motion.span
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.9,
            x: isHovered ? 0 : -10,
          }}
          transition={{ duration: 0.3, delay: isHovered ? 0.1 : 0 }}
          className="ml-3 text-lg font-bold text-foreground select-none whitespace-nowrap"
        >
          AI Stock Analyzer
        </motion.span>
      </div>

      {/* Main Navigation - Now route-aware */}
      <nav className="flex-1 flex flex-col gap-1 mt-4 w-full px-2">
        {mainNavigation.map((item, index) => renderNavItem(item, index))}
      </nav>

      {/* Pro Features Section - Now route-aware */}
      {proItems.length > 0 && (
        <div className="w-full px-2 mb-4">
          <div className="border-t border-border/50 pt-4">
            {proItems.map((item, index) => renderNavItem(item, index + mainNavigation.length))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="p-2 border-t border-border/50 w-full">
        {renderNavItem(helpItem, mainNavigation.length + proItems.length)}
      </div>

      {/* User Status Indicator */}
      {isAuthenticated && user && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 border-t border-border/50 w-full"
        >
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200/50 dark:border-green-800/50">
            <motion.div 
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.7)",
                  "0 0 0 4px rgba(34, 197, 94, 0)",
                  "0 0 0 0 rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.plan} Plan</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
