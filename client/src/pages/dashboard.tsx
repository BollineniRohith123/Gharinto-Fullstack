import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import SuperAdminDashboard from "@/components/dashboards/super-admin-dashboard";
import AdminDashboard from "@/components/dashboards/admin-dashboard";
import DesignerDashboard from "@/components/dashboards/designer-dashboard";
import CustomerDashboard from "@/components/dashboards/customer-dashboard";
import VendorDashboard from "@/components/dashboards/vendor-dashboard";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'designer':
        return <DesignerDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background" data-testid="dashboard-container">
      <Sidebar user={user!} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user!} />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}
