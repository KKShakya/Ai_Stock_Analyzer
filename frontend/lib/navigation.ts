// lib/navigation.ts
import { 
  Home, 
  Star, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Crown,
  HelpCircle,
  LucideIcon 
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  requiresAuth?: boolean;
  requiresPro?: boolean;
  comingSoon?: boolean;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    name: "Market Overview",
    href: "/",
    icon: BarChart3,
    description: "Real-time market data and indices",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Your personalized dashboard",
    requiresAuth: false,
  },
  {
    name: "Watchlist",
    href: "/dashboard/watchlist",
    icon: Star,
    description: "Track your favorite stocks",
    requiresAuth: true,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
    description: "Advanced market analysis",
    requiresAuth: true,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Account and preferences",
    requiresAuth: true,
  },
];

export const HELP_ITEM: NavItem = {
  name: "Help & Support",
  href: "/support",
  icon: HelpCircle,
  description: "Get help and contact support",
};

// Pro features placeholder for future
export const PRO_ITEMS: NavItem[] = [
  {
    name: "Upgrade to Pro",
    href: "/upgrade",
    icon: Crown,
    description: "Unlock advanced features",
    comingSoon: true,
  },
];
