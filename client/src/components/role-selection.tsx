import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Home, UserCheck, Palette, Store, IdCard } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function RoleSelection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles: Role[] = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'System configuration, global analytics, role management',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Operations management, user approval, lead assignment',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'designer',
      name: 'Designer',
      description: 'Project management, design uploads, client communication',
      icon: <Palette className="w-6 h-6" />,
      color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'customer',
      name: 'Customer',
      description: 'Project tracking, design viewing, communication',
      icon: <Home className="w-6 h-6" />,
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
    },
    {
      id: 'vendor',
      name: 'Vendor',
      description: 'Product listings, inventory management, order fulfillment',
      icon: <Store className="w-6 h-6" />,
      color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    },
    {
      id: 'employee',
      name: 'Employee',
      description: 'Task-specific access, support operations',
      icon: <IdCard className="w-6 h-6" />,
      color: 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    }
  ];

  const updateRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return await apiRequest('PATCH', '/api/auth/user/role', { role: roleId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role updated successfully. Redirecting to dashboard...",
      });
      // Redirect to dashboard after successful role selection
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelection = (roleId: string) => {
    setSelectedRole(roleId);
    updateRoleMutation.mutate(roleId);
  };

  const handleBackToLogin = () => {
    window.location.href = '/auth/logout';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl p-8 border border-border">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Home className="text-primary-foreground text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Gharinto</h1>
          <h2 className="text-xl font-semibold text-foreground mb-2">Select Your Role</h2>
          <p className="text-muted-foreground">
            Hello {user.firstName || user.email}, choose how you want to access the platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelection(role.id)}
              disabled={updateRoleMutation.isPending}
              className={`p-6 border rounded-lg hover:bg-accent transition-colors text-left group relative ${
                selectedRole === role.id ? 'ring-2 ring-primary' : 'border-border'
              } ${updateRoleMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              data-testid={`role-card-${role.id}`}
            >
              {selectedRole === role.id && updateRoleMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${role.color}`}>
                  {role.icon}
                </div>
                <h3 className="font-semibold text-foreground">{role.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="link"
            onClick={handleBackToLogin}
            disabled={updateRoleMutation.isPending}
            className="text-primary hover:underline text-sm"
            data-testid="button-back-to-login"
          >
            ← Back to login
          </Button>
        </div>

        {updateRoleMutation.isPending && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Setting up your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
