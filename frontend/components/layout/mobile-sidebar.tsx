// components/layout/mobile-sidebar.tsx
"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Hooks and stores
import { useAuthStore } from "@/hooks/use-auth";

// Navigation data
import { 
  NAVIGATION_ITEMS, 
  HELP_ITEM, 
  getNavigationForRoute,
  type NavItem 
} from "@/lib/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
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

  // Handle navigation item click
  const handleItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.comingSoon) {
      e.preventDefault();
      return;
    }
    
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openLoginModal();
      onClose();
      return;
    }
    
    if (item.requiresPro && user?.plan === 'free') {
      e.preventDefault();
      console.log('Upgrade to Pro required');
      onClose();
      return;
    }
    
    // Close sidebar on navigation
    onClose();
  };

  // Render navigation item for mobile
  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const canUserAccess = canAccess(item);
    const isLocked = item.requiresAuth && !isAuthenticated;
    const isProLocked = item.requiresPro && user?.plan === 'free';

    return (
      <Link 
        key={item.name}
        href={canUserAccess ? item.href : "#"} 
        onClick={(e) => handleItemClick(item, e)}
      >
        <div className={cn(
          "flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors",
          isActive && canUserAccess && "bg-primary text-primary-foreground",
          canUserAccess && !isActive && "hover:bg-accent",
          (isLocked || isProLocked) && "opacity-60"
        )}>
          <div className="flex items-center gap-3">
            <item.icon className="h-5 w-5" />
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {item.comingSoon && (
              <Badge variant="secondary" className="text-xs">Soon</Badge>
            )}
            {isProLocked && (
              <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                Pro
              </Badge>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-sm">
                  A
                </div>
                <span className="font-bold text-lg">AI Stock Analyzer</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation - Now route-aware */}
            <div className="p-4 space-y-2">
              {/* Main navigation items */}
              {mainNavigation.map(renderNavItem)}
              
              {/* Pro items if any */}
              {proItems.length > 0 && (
                <>
                  <div className="border-t border-border my-4" />
                  {proItems.map(renderNavItem)}
                </>
              )}
              
              {/* Separator */}
              <div className="border-t border-border my-4" />
              
              {/* Help */}
              {renderNavItem(helpItem)}
            </div>

            {/* User Status */}
            {isAuthenticated && user && (
              <div className="p-4 border-t border-border mt-auto">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.plan} Plan</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
