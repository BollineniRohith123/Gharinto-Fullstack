import { 
  BarChart3, 
  Building, 
  Users, 
  Shield, 
  Settings, 
  Archive,
  UserCheck,
  Route,
  FolderOpen,
  Bell,
  Inbox,
  Palette,
  FileText,
  MessageSquare,
  Package,
  ShoppingCart,
  Warehouse,
  Star,
  Headphones,
  ClipboardList,
  Clock,
  ChevronRight,
  Layout
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  children?: NavigationItem[];
  sortOrder?: number;
  isActive?: boolean;
}

// Icon mapping for dynamic menu items
const iconMap: Record<string, any> = {
  'BarChart3': BarChart3,
  'Building': Building,
  'Users': Users,
  'Shield': Shield,
  'Settings': Settings,
  'Archive': Archive,
  'UserCheck': UserCheck,
  'Route': Route,
  'FolderOpen': FolderOpen,
  'Bell': Bell,
  'Inbox': Inbox,
  'Palette': Palette,
  'FileText': FileText,
  'MessageSquare': MessageSquare,
  'Package': Package,
  'ShoppingCart': ShoppingCart,
  'Warehouse': Warehouse,
  'Star': Star,
  'Headphones': Headphones,
  'ClipboardList': ClipboardList,
  'Clock': Clock,
  'ChevronRight': ChevronRight,
  'Layout': Layout
};

export const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || Layout;
};

// Fallback static navigation (used when dynamic loading fails)
export const getStaticNavigationItems = (role: string): NavigationItem[] => {
  const navigationMenus: Record<string, NavigationItem[]> = {
    'super_admin': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, sortOrder: 1 },
      { id: 'cities', label: 'City Management', icon: Building, sortOrder: 2 },
      { id: 'roles', label: 'Role Management', icon: Users, sortOrder: 3 },
      { id: 'menu-config', label: 'Menu Configuration', icon: Settings, sortOrder: 4 },
      { id: 'analytics', label: 'System Analytics', icon: BarChart3, sortOrder: 5 },
      { id: 'config', label: 'Configuration', icon: Settings, sortOrder: 6 },
      { id: 'security', label: 'Security Logs', icon: Shield, sortOrder: 7 }
    ],
    'admin': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, sortOrder: 1 },
      { id: 'approvals', label: 'User Approvals', icon: UserCheck, sortOrder: 2 },
      { id: 'leads', label: 'Lead Assignment', icon: Route, sortOrder: 3 },
      { id: 'projects', label: 'Project Management', icon: FolderOpen, sortOrder: 4 },
      { id: 'testimonials', label: 'Testimonials', icon: Star, sortOrder: 5 },
      { id: 'reports', label: 'Reports', icon: BarChart3, sortOrder: 6 },
      { id: 'notifications', label: 'Notifications', icon: Bell, sortOrder: 7 }
    ],
    'designer': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, sortOrder: 1 },
      { id: 'leads', label: 'Lead Requests', icon: Inbox, sortOrder: 2 },
      { id: 'projects', label: 'My Projects', icon: FolderOpen, sortOrder: 3 },
      { id: 'gallery', label: 'Design Gallery', icon: Palette, sortOrder: 4 },
      { id: 'boq', label: 'BOQ Management', icon: FileText, sortOrder: 5 },
      { id: 'messages', label: 'Communications', icon: MessageSquare, sortOrder: 6 }
    ],
    'customer': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, sortOrder: 1 },
      { id: 'projects', label: 'My Projects', icon: FolderOpen, sortOrder: 2 },
      { id: 'vault', label: 'Digital Vault', icon: Archive, sortOrder: 3 },
      { id: 'messages', label: 'Messages', icon: MessageSquare, sortOrder: 4 },
      { id: 'reviews', label: 'Reviews', icon: Star, sortOrder: 5 },
      { id: 'support', label: 'Support', icon: Headphones, sortOrder: 6 }
    ],
    'vendor': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, sortOrder: 1 },
      { id: 'products', label: 'Products', icon: Package, sortOrder: 2 },
      { id: 'orders', label: 'Orders', icon: ShoppingCart, sortOrder: 3 },
      { id: 'inventory', label: 'Inventory', icon: Warehouse, sortOrder: 4 },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, sortOrder: 5 },
      { id: 'settings', label: 'Settings', icon: Settings, sortOrder: 6 }
    ],
    'employee': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, sortOrder: 1 },
      { id: 'tasks', label: 'My Tasks', icon: ClipboardList, sortOrder: 2 },
      { id: 'team', label: 'Team', icon: Users, sortOrder: 3 },
      { id: 'time', label: 'Time Tracking', icon: Clock, sortOrder: 4 }
    ]
  };

  return navigationMenus[role] || navigationMenus['customer'];
};

// Dynamic navigation fetcher (to be called from React components)
export const fetchNavigationItems = async (roleId: string): Promise<NavigationItem[]> => {
  try {
    const response = await fetch(`/api/menu-items/${roleId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch navigation items');
    }
    
    const menuItems = await response.json();
    
    // Transform database menu items to NavigationItem format
    return menuItems
      .filter((item: any) => item.isActive)
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item: any) => ({
        id: item.itemId,
        label: item.label,
        icon: getIconComponent(item.icon),
        href: item.href,
        sortOrder: item.sortOrder,
        isActive: item.isActive
      }));
  } catch (error) {
    console.error('Failed to fetch dynamic navigation:', error);
    // Fallback to static navigation
    return getStaticNavigationItems(roleId);
  }
};
