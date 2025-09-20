import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  FolderOpen, 
  Archive, 
  MessageSquare, 
  Star,
  Calendar,
  DollarSign,
  Camera,
  FileText,
  CheckCircle,
  Clock,
  User
} from "lucide-react";

export default function EnhancedCustomerDashboard() {
  const { user } = useAuth();

  // Fetch customer-specific data
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    select: (data) => data?.filter((p: any) => p.customerId === user?.id),
  });

  const { data: documents } = useQuery({
    queryKey: ['/api/projects/documents'],
  });

  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const activeProject = Array.isArray(projects) ? projects.find((p: any) => p.status === 'in_progress') : null;

  return (
    <div className="space-y-8">
      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-foreground">
                  {Array.isArray(projects) ? projects.length : 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FolderOpen className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">
                {Array.isArray(projects) ? projects.filter(p => p.status === 'completed').length : 0} completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Project</p>
                <p className="text-2xl font-bold text-foreground">
                  {activeProject ? '1' : '0'}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Clock className="text-green-600 dark:text-green-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">
                {activeProject ? activeProject.title : 'No active project'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold text-foreground">
                  {Array.isArray(documents) ? documents.length : 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Archive className="text-purple-600 dark:text-purple-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">In digital vault</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold text-foreground">
                  {Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-yellow-600 dark:text-yellow-400 w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">Unread</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="vault">Digital Vault</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Active Project Progress */}
          {activeProject && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2" />
                  Current Project Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{activeProject.title}</h3>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">Design Approved</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium">Material Procurement</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Installation</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Designer: John Smith</span>
                      </div>
                    </div>
                    <Button variant="outline">View Full Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Updates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Material samples approved",
                      description: "Kitchen tiles and countertop samples approved by customer",
                      time: "2 hours ago",
                      type: "approval"
                    },
                    {
                      title: "Progress photos uploaded",
                      description: "Latest construction progress photos from site",
                      time: "1 day ago",
                      type: "media"
                    },
                    {
                      title: "Payment milestone reached",
                      description: "Second payment milestone completed successfully",
                      time: "3 days ago",
                      type: "payment"
                    }
                  ].map((update, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {update.type === 'approval' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {update.type === 'media' && <Camera className="w-4 h-4 text-blue-600" />}
                        {update.type === 'payment' && <DollarSign className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{update.title}</p>
                        <p className="text-xs text-muted-foreground">{update.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{update.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <MessageSquare className="w-6 h-6 mb-2" />
                    <span className="text-sm">Contact Designer</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Calendar className="w-6 h-6 mb-2" />
                    <span className="text-sm">Schedule Visit</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Archive className="w-6 h-6 mb-2" />
                    <span className="text-sm">View Documents</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Star className="w-6 h-6 mb-2" />
                    <span className="text-sm">Leave Review</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
                        {project.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Budget: ₹{project.budget ? parseFloat(project.budget).toLocaleString() : 'TBD'}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Progress</Button>
                        {project.status === 'completed' && (
                          <Button size="sm">Leave Review</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vault">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Archive className="w-5 h-5 mr-2" />
                Digital Vault
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Project Contract", type: "PDF", size: "2.4 MB", date: "Dec 15, 2024" },
                  { name: "Design Drawings", type: "ZIP", size: "15.7 MB", date: "Dec 10, 2024" },
                  { name: "Material Specifications", type: "PDF", size: "3.1 MB", date: "Dec 8, 2024" },
                  { name: "Progress Photos", type: "ZIP", size: "45.2 MB", date: "Dec 5, 2024" },
                  { name: "Warranty Documents", type: "PDF", size: "1.8 MB", date: "Dec 1, 2024" }
                ].map((doc, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center mb-3">
                      <FileText className="w-8 h-8 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{doc.date}</span>
                      <Button size="sm" variant="outline">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Messages & Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Message center coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Customer Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our customer support team is here to help you with any questions or concerns.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Contact Support</Button>
                    <Button size="sm" variant="outline">FAQ</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}