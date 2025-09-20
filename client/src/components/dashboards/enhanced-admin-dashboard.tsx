import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Building, 
  DollarSign, 
  TrendingUp, 
  UserCheck,
  Route,
  FolderOpen,
  Star,
  BarChart3,
  MapPin
} from "lucide-react";
import TestimonialManagement from "./components/TestimonialManagement";

export default function EnhancedAdminDashboard() {
  // Fetch dashboard data
  const { data: stats } = useQuery({
    queryKey: ['/api/analytics/dashboard-stats'],
  });

  const { data: cityStats } = useQuery({
    queryKey: ['/api/analytics/city-stats'],
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ['/api/users/pending-approval'],
  });

  const { data: recentLeads } = useQuery({
    queryKey: ['/api/leads'],
    select: (data) => data?.slice(0, 5),
  });

  return (
    <div className="space-y-8">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">
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
                <p className="text-2xl font-bold text-foreground">
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
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground">
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
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-foreground">
                  {Array.isArray(pendingApprovals) ? pendingApprovals.length : 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <UserCheck className="text-orange-600 dark:text-orange-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-orange-600 dark:text-orange-400">
                {Array.isArray(pendingApprovals) && pendingApprovals.length > 0 ? 'Needs attention' : 'All clear'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">User Approvals</TabsTrigger>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="city-analytics">City Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(recentLeads) && recentLeads.map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Lead #{lead.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={lead.status === 'new' ? "default" : "secondary"}>
                        {lead.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending User Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(pendingApprovals) && pendingApprovals.slice(0, 5).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className="mt-1">{user.role}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                User Approval Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(pendingApprovals) && pendingApprovals.map((user: any) => (
                  <div key={user.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{user.role}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Applied: {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                        <Button size="sm" variant="ghost">View Details</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Route className="w-5 h-5 mr-2" />
                Lead Assignment & Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lead management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials">
          <TestimonialManagement />
        </TabsContent>

        <TabsContent value="city-analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                City-wise Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(cityStats) && cityStats.map((city: any) => (
                  <div key={city.cityName} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center mb-3">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <h3 className="font-semibold text-foreground">{city.cityName}</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Projects:</span>
                        <span className="font-medium">{city.activeProjects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending Leads:</span>
                        <span className="font-medium">{city.pendingLeads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-medium">₹{city.revenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Designers:</span>
                        <span className="font-medium">{city.designersCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendors:</span>
                        <span className="font-medium">{city.vendorsCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}