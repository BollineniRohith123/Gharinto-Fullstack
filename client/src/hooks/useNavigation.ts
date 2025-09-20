import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNavigationItems, getStaticNavigationItems, type NavigationItem } from '@/lib/navigation';

export const useNavigation = (userRole: string) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);

  // Fetch dynamic navigation from API
  const { data: dynamicNav, isLoading, error } = useQuery({
    queryKey: ['navigation', userRole],
    queryFn: () => fetchNavigationItems(userRole),
    enabled: !!userRole,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false
  });

  useEffect(() => {
    if (dynamicNav && dynamicNav.length > 0) {
      setNavigationItems(dynamicNav);
    } else if (error || (!isLoading && (!dynamicNav || dynamicNav.length === 0))) {
      // Fallback to static navigation if dynamic fails
      setNavigationItems(getStaticNavigationItems(userRole));
    }
  }, [dynamicNav, error, isLoading, userRole]);

  return {
    navigationItems,
    isLoading,
    error,
    isDynamic: !!dynamicNav && dynamicNav.length > 0
  };
};