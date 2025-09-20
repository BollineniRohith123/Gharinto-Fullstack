import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Building, CheckCircle, DollarSign, Plus, Download, Eye, MessageCircle, Headphones, Star, AlertTriangle } from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();

  // Fetch customer's projects
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects', user?.id],
    queryFn: () => fetch(`/api/projects?customerId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Fetch customer's documents
  const { data: documents = [] } = useQuery({
    queryKey: ['/api/documents', user?.id],
    queryFn: () => {
      if (projects.length > 0) {
        return fetch(`/api/projects/${projects[0]?.id}/documents`).then(res => res.json());
      }
      return [];
    },
    enabled: projects.length > 0,
  });

  const activeProjects = projects.filter((project: any) => ['assigned', 'in_progress'].includes(project.status));
  const completedProjects = projects.filter((project: any) => project.status === 'completed');
  const totalInvestment = projects.reduce((sum: number, project: any) => sum + parseFloat(project.budget || 0), 0);

  return (
    <div className="space-y-6">
      {/* Customer Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Welcome back, {user?.firstName || 'Valued Customer'}!
            </h3>
            <Button data-testid="button-new-project">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Building className="text-blue-600 dark:text-blue-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-active-projects">
                {activeProjects.length}
              </p>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="text-green-600 dark:text-green-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-completed-projects">
                {completedProjects.length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-total-investment">
                ₹{totalInvestment.toFixed(1)}L
              </p>
              <p className="text-sm text-muted-foreground">Total Investment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Status and Digital Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  <Button data-testid="button-start-first-project">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Your First Project
                  </Button>
                </div>
              ) : (
                projects.map((project: any) => (
                  <div key={project.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground" data-testid={`project-title-${project.id}`}>
                          {project.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Designer: {project.designerId ? 'Assigned' : 'Pending Assignment'}
                        </p>
                      </div>
                      <Badge 
                        variant={project.status === 'in_progress' ? 'default' : 'secondary'}
                        data-testid={`project-status-${project.id}`}
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {project.status === 'in_progress' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Budget: ₹{project.budget}
                      </span>
                      <Button variant="link" size="sm" data-testid={`button-view-project-${project.id}`}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Digital Vault</CardTitle>
            <Button variant="link" size="sm" data-testid="button-view-all-documents">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No documents uploaded yet</p>
              ) : (
                documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center p-3 bg-muted rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                      <Eye className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground" data-testid={`document-name-${doc.id}`}>
                        {doc.fileName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" data-testid={`button-download-${doc.id}`}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent messages</p>
                <p className="text-sm text-muted-foreground">
                  Your designer will communicate with you here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support & Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" data-testid="button-contact-support">
                <Headphones className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Contact Support</p>
                  <p className="text-sm text-muted-foreground">Get help with your projects</p>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start" data-testid="button-rate-review">
                <Star className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Rate & Review</p>
                  <p className="text-sm text-muted-foreground">Share your experience</p>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start" data-testid="button-report-issue">
                <AlertTriangle className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Report Issue</p>
                  <p className="text-sm text-muted-foreground">Escalate any concerns</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
