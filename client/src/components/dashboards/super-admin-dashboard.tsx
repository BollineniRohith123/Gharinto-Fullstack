import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Building, DollarSign, MapPin, Plus, Edit, Settings, Check, Server, Cloud } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCityData, setNewCityData] = useState({ name: '', state: '' });

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/analytics/dashboard-stats'],
  });

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ['/api/cities'],
  });

  // Fetch platform config
  const { data: config } = useQuery({
    queryKey: ['/api/config/platform'],
  });

  // Create city mutation
  const createCityMutation = useMutation({
    mutationFn: async (cityData: { name: string; state: string }) => {
      return await apiRequest('POST', '/api/cities', cityData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "City created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
      setNewCityData({ name: '', state: '' });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create city",
        variant: "destructive",
      });
    },
  });

  // Update platform config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      return await apiRequest('PATCH', '/api/config/platform', configData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Configuration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/config/platform'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  const handleCreateCity = () => {
    if (newCityData.name && newCityData.state) {
      createCityMutation.mutate(newCityData);
    }
  };

  const handleConfigUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const configData = {
      designerCommission: formData.get('designerCommission'),
      platformFee: formData.get('platformFee'),
      vendorCommission: formData.get('vendorCommission'),
    };
    updateConfigMutation.mutate(configData);
  };

  return (
    <div className="space-y-8">
      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-users">
                  {(stats as any)?.totalUsers || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+12%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-active-projects">
                  {(stats as any)?.activeProjects || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Building className="text-green-600 dark:text-green-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+8%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-revenue">
                  ₹{(stats as any)?.totalRevenue || '0'}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <DollarSign className="text-yellow-600 dark:text-yellow-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+23%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cities Active</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-active-cities">
                  {(stats as any)?.activeCities || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <MapPin className="text-purple-600 dark:text-purple-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+2</span>
              <span className="text-muted-foreground ml-1">new cities</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City Management and Role Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>City Management</CardTitle>
            <div className="space-x-2">
              <Input
                placeholder="City name"
                value={newCityData.name}
                onChange={(e) => setNewCityData(prev => ({ ...prev, name: e.target.value }))}
                className="inline-block w-24"
                data-testid="input-city-name"
              />
              <Input
                placeholder="State"
                value={newCityData.state}
                onChange={(e) => setNewCityData(prev => ({ ...prev, state: e.target.value }))}
                className="inline-block w-20"
                data-testid="input-city-state"
              />
              <Button 
                size="sm"
                onClick={handleCreateCity}
                disabled={createCityMutation.isPending}
                data-testid="button-add-city"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add City
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(cities) && cities.map((city: any) => (
                <div key={city.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                      <Building className="text-primary-foreground text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground" data-testid={`city-name-${city.id}`}>
                        {city.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{city.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={city.isActive ? "default" : "secondary"}>
                      {city.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="ghost" size="sm" data-testid={`button-edit-city-${city.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Role Management</CardTitle>
            <Button variant="outline" size="sm" data-testid="button-configure-roles">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { role: 'Admin', users: 8, icon: Users },
                { role: 'Designer', users: 24, icon: Users },
                { role: 'Vendor', users: 67, icon: Users },
                { role: 'Customer', users: 156, icon: Users },
              ].map((roleData) => (
                <div key={roleData.role} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                      <roleData.icon className="text-blue-600 dark:text-blue-400 text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{roleData.role}</p>
                      <p className="text-sm text-muted-foreground">{roleData.users} users</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-edit-role-${roleData.role.toLowerCase()}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConfigUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="designerCommission">Designer Commission (%)</Label>
              <Input
                id="designerCommission"
                name="designerCommission"
                type="number"
                step="0.01"
                defaultValue={(config as any)?.designerCommission || 15}
                data-testid="input-designer-commission"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platformFee">Platform Fee (%)</Label>
              <Input
                id="platformFee"
                name="platformFee"
                type="number"
                step="0.01"
                defaultValue={(config as any)?.platformFee || 5}
                data-testid="input-platform-fee"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorCommission">Vendor Commission (%)</Label>
              <Input
                id="vendorCommission"
                name="vendorCommission"
                type="number"
                step="0.01"
                defaultValue={(config as any)?.vendorCommission || 8}
                data-testid="input-vendor-commission"
              />
            </div>
            <div className="md:col-span-3">
              <Button 
                type="submit" 
                disabled={updateConfigMutation.isPending}
                data-testid="button-update-config"
              >
                Update Configuration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'Database', status: 'Healthy', icon: Server, color: 'green' },
              { name: 'API', status: '99.9% Uptime', icon: Check, color: 'green' },
              { name: 'Storage', status: '72% Used', icon: Cloud, color: 'yellow' },
              { name: 'Notifications', status: 'Active', icon: Check, color: 'green' },
            ].map((service) => (
              <div key={service.name} className="text-center">
                <div className={`w-16 h-16 bg-${service.color}-100 dark:bg-${service.color}-900 rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <service.icon className={`text-${service.color}-600 dark:text-${service.color}-400 text-xl`} />
                </div>
                <p className="text-sm font-medium text-foreground">{service.name}</p>
                <p className={`text-xs text-${service.color}-600 dark:text-${service.color}-400`}>{service.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
