// lib/navigation.ts
import { 
  Home, 
  Star, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Crown,
  HelpCircle,
  LucideIcon,
  // Add these new dashboard icons
  Search,
  MessageSquare,
  BookmarkIcon,
  LayoutDashboard,
  PieChart,
  Brain
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

// Your existing main navigation (unchanged - won't break existing imports)
export const NAVIGATION_ITEMS: NavItem[] = [
  {
    name: "Market ",
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

// NEW: Dashboard-specific navigation items
export const DASHBOARD_NAVIGATION_ITEMS: NavItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Your personalized dashboard overview',
    requiresAuth: false,
  },
  {
    name: 'Market',
    href: '/dashboard/market',
    icon: TrendingUp,
    description: 'Live market data and trends',
    requiresAuth: false,
  },
  {
    name: 'Watchlist',
    href: '/dashboard/watchlist',
    icon: BookmarkIcon,
    description: 'Your saved stocks to monitor',
    requiresAuth: true,
  },
  {
    name: 'AI Analysis',
    href: '/dashboard/ai-chat',
    icon: MessageSquare,
    description: 'Chat with AI about stocks',
    requiresAuth: false,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account and preferences',
    requiresAuth: true,
  },
];

export const HELP_ITEM: NavItem = {
  name: "Help & Support",
  href: "/support",
  icon: HelpCircle,
  description: "Get help and contact support",
};

// Updated PRO_ITEMS with dashboard-specific pro features
export const PRO_ITEMS: NavItem[] = [
  {
    name: "Upgrade to Pro",
    href: "/upgrade",
    icon: Crown,
    description: "Unlock advanced features",
    comingSoon: true,
  },
];

// NEW: Dashboard-specific pro features
export const DASHBOARD_PRO_ITEMS: NavItem[] = [
  {
    name: 'Portfolio',
    href: '/dashboard/portfolio',
    icon: PieChart,
    description: 'Track investment performance',
    requiresAuth: true,
    requiresPro: true,
    comingSoon: true,
  },
  {
    name: 'AI Strategies',
    href: '/dashboard/strategies',
    icon: Brain,
    description: 'AI-powered trading strategies',
    requiresAuth: true,
    requiresPro: true,
    comingSoon: true,
  },
   {name: "Upgrade to Pro",
    href: "/upgrade",
    icon: Crown,
    description: "Unlock advanced features",
    comingSoon: true,
  },
];

// Helper function to get appropriate navigation based on current route
export function getNavigationForRoute(pathname: string) {
  const isDashboard = pathname.startsWith('/dashboard');
  
  return {
    mainNavigation: isDashboard ? DASHBOARD_NAVIGATION_ITEMS : NAVIGATION_ITEMS,
    proItems: isDashboard ? DASHBOARD_PRO_ITEMS : PRO_ITEMS,
    helpItem: HELP_ITEM
  };
}
