import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  FolderOpen, 
  Inbox, 
  DollarSign, 
  Star,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle
} from "lucide-react";

export default function EnhancedDesignerDashboard() {
  const { user } = useAuth();

  // Fetch designer-specific data
  const { data: designerStats } = useQuery({
    queryKey: ['/api/analytics/designer-stats', user?.id],
    enabled: !!user?.id,
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    select: (data) => data?.filter((p: any) => p.designerId === user?.id),
  });

  const { data: leads } = useQuery({
    queryKey: ['/api/leads'],
    select: (data) => data?.filter((l: any) => l.designerId === user?.id),
  });

  const { data: availableLeads } = useQuery({
    queryKey: ['/api/leads'],
    select: (data) => data?.filter((l: any) => !l.designerId && l.status === 'new'),
  });

  return (
    <div className="space-y-8">
      {/* Designer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground">
                  {(designerStats as any)?.activeProjects || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FolderOpen className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+2</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Projects</p>
                <p className="text-2xl font-bold text-foreground">
                  {(designerStats as any)?.completedProjects || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600 dark:text-green-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+5</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{(designerStats as any)?.totalRevenue || '0'}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <DollarSign className="text-yellow-600 dark:text-yellow-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+18%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Rating</p>
                <p className="text-2xl font-bold text-foreground">
                  {(designerStats as any)?.customerRating || '4.5'}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Star className="text-purple-600 dark:text-purple-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor((designerStats as any)?.customerRating || 4.5) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="leads">Available Leads</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Project Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(projects) && projects.slice(0, 5).map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{project.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={project.status === 'completed' ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(leads) && leads.filter((l: any) => l.status === 'assigned').map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950">
                      <div>
                        <p className="font-medium text-foreground">New Lead Assignment</p>
                        <p className="text-sm text-muted-foreground">
                          Assigned: {new Date(lead.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">Accept</Button>
                        <Button size="sm" variant="outline">Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Inbox className="w-5 h-5 mr-2" />
                Available Lead Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(availableLeads) && availableLeads.map((lead: any) => (
                  <div key={lead.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Lead #{lead.id.slice(-6)}</h3>
                      <Badge variant="outline">New</Badge>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <p className="text-muted-foreground">
                        Created: {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">
                        Score: <span className="font-medium text-foreground">{lead.score || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Accept Lead</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="w-5 h-5 mr-2" />
                My Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(projects) && projects.map((project: any) => (
                  <div key={project.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{project.title}</h3>
                      <Badge variant={
                        project.status === 'completed' ? "default" : 
                        project.status === 'in_progress' ? "secondary" : 
                        "outline"
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Budget: ₹{project.budget ? parseFloat(project.budget).toLocaleString() : 'TBD'}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm">Update Progress</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Design Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Portfolio management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings & Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Earnings dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}