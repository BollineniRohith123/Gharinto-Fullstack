import { Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import type { User } from "@shared/schema";

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const { navigationItems, isLoading, isDynamic } = useNavigation(user.role || 'customer');

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'designer': 'Designer',
      'customer': 'Customer',
      'vendor': 'Vendor',
      'employee': 'Employee'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <div className="w-64 bg-card border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
            <Home className="text-primary-foreground text-sm" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Gharinto</h2>
            <span className="text-xs text-muted-foreground" data-testid="user-role-badge">
              {getRoleDisplayName(user.role || 'customer')}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent",
                  "transition-colors"
                )}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            ))
          )}
        </div>
        {isDynamic && (
          <div className="mt-4 text-xs text-green-600 px-2">
            Dynamic menu loaded
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-border bg-card">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="text-username">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.email
              }
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-email">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
