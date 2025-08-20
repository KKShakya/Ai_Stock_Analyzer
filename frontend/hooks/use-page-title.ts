// hooks/use-page-title.ts
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Market Overview',
  '/dashboard': 'Dashboard',
  '/dashboard/watchlist': 'Watchlist',
  '/dashboard/analytics': 'Analytics', 
  '/dashboard/settings': 'Settings',
};

export const usePageTitle = () => {
  const pathname = usePathname();
  
  return useMemo(() => {
    return PAGE_TITLES[pathname] || 'Dashboard';
  }, [pathname]);
};
