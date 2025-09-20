import { Search, Bell, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

interface TopBarProps {
  user: User;
}

export default function TopBar({ user }: TopBarProps) {
  const [isDark, setIsDark] = useState(false);

  // Load dark mode preference
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  const getPageTitle = () => {
    const titles = {
      'super_admin': 'Super Admin Dashboard',
      'admin': 'Operations Dashboard',
      'designer': 'Designer Portal',
      'customer': 'My Projects',
      'vendor': 'Vendor Portal',
      'employee': 'Employee Dashboard'
    };
    return titles[user.role as keyof typeof titles] || 'Dashboard';
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10"
              data-testid="input-search"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs notification-badge" 
                      data-testid="notification-badge">
                </span>
              )}
            </Button>
          </div>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Profile Dropdown */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="flex items-center" data-testid="button-profile">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-2">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                    data-testid="img-avatar"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {user.firstName?.[0] || user.email?.[0] || 'U'}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
