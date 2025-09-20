import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Palette, Store, UserCheck, Building, IdCard } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const roles = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'System configuration, global analytics, role management',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Operations management, user approval, lead assignment',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'designer',
      name: 'Designer',
      description: 'Project management, design uploads, client communication',
      icon: <Palette className="w-6 h-6" />,
      color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
    },
    {
      id: 'customer',
      name: 'Customer',
      description: 'Project tracking, design viewing, communication',
      icon: <Home className="w-6 h-6" />,
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
    },
    {
      id: 'vendor',
      name: 'Vendor',
      description: 'Product listings, inventory management, order fulfillment',
      icon: <Store className="w-6 h-6" />,
      color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
    },
    {
      id: 'employee',
      name: 'Employee',
      description: 'Task-specific access, support operations',
      icon: <IdCard className="w-6 h-6" />,
      color: 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Home className="text-primary-foreground text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Gharinto</h1>
          <p className="text-xl text-muted-foreground mb-6">Interior Design Marketplace Platform</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform India's home interiors sector with our technology-driven, three-sided marketplace 
            connecting homeowners, designers, and vendors with transparency and excellence.
          </p>
        </div>

        {/* Role Overview */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Platform Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${role.color}`}>
                      {role.icon}
                    </div>
                    <h3 className="font-semibold text-foreground">{role.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Login Section */}
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Sign in to access your personalized dashboard and start managing your interior design projects.
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="px-8"
              data-testid="button-login"
            >
              Sign In to Continue
            </Button>
            
            <div className="mt-6 text-sm text-muted-foreground">
              <p>Secure authentication powered by Replit</p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Multi-City Operations</h4>
            <p className="text-sm text-muted-foreground">Manage operations across multiple cities with city-based segmentation</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Dynamic RBAC</h4>
            <p className="text-sm text-muted-foreground">Role-based access control with dynamic permissions and workflows</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Project Excellence</h4>
            <p className="text-sm text-muted-foreground">Complete project lifecycle management with transparency and quality</p>
          </div>
        </div>
      </div>
    </div>
  );
}
