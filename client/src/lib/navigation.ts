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
  Clock
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
}

export const getNavigationItems = (role: string): NavigationItem[] => {
  const navigationMenus: Record<string, NavigationItem[]> = {
    'super_admin': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'cities', label: 'City Management', icon: Building },
      { id: 'roles', label: 'Role Management', icon: Users },
      { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
      { id: 'config', label: 'Configuration', icon: Settings },
      { id: 'security', label: 'Security Logs', icon: Shield }
    ],
    'admin': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'approvals', label: 'User Approvals', icon: UserCheck },
      { id: 'leads', label: 'Lead Assignment', icon: Route },
      { id: 'projects', label: 'Project Management', icon: FolderOpen },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'notifications', label: 'Notifications', icon: Bell }
    ],
    'designer': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'leads', label: 'Lead Requests', icon: Inbox },
      { id: 'projects', label: 'My Projects', icon: FolderOpen },
      { id: 'gallery', label: 'Design Gallery', icon: Palette },
      { id: 'boq', label: 'BOQ Management', icon: FileText },
      { id: 'messages', label: 'Communications', icon: MessageSquare }
    ],
    'customer': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'projects', label: 'My Projects', icon: FolderOpen },
      { id: 'vault', label: 'Digital Vault', icon: Archive },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'reviews', label: 'Reviews', icon: Star },
      { id: 'support', label: 'Support', icon: Headphones }
    ],
    'vendor': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'orders', label: 'Orders', icon: ShoppingCart },
      { id: 'inventory', label: 'Inventory', icon: Warehouse },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings }
    ],
    'employee': [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'tasks', label: 'My Tasks', icon: ClipboardList },
      { id: 'team', label: 'Team', icon: Users },
      { id: 'time', label: 'Time Tracking', icon: Clock }
    ]
  };

  return navigationMenus[role] || navigationMenus['customer'];
};
