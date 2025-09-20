import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Building, Clock, DollarSign, Upload, MessageCircle, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DesignerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch designer's leads
  const { data: leads = [] } = useQuery({
    queryKey: ['/api/leads', user?.id],
    queryFn: () => fetch(`/api/leads?designerId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Fetch designer's projects
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects', user?.id],
    queryFn: () => fetch(`/api/projects?designerId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Respond to lead mutation
  const respondToLeadMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: 'accepted' | 'declined' }) => {
      return await apiRequest('PATCH', `/api/leads/${leadId}/respond`, { status });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Success",
        description: `Lead ${status} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to respond to lead",
        variant: "destructive",
      });
    },
  });

  const newLeads = leads.filter((lead: any) => lead.status === 'assigned');
  const activeProjects = projects.filter((project: any) => project.status === 'in_progress');

  const handleLeadResponse = (leadId: string, status: 'accepted' | 'declined') => {
    respondToLeadMutation.mutate({ leadId, status });
  };

  return (
    <div className="space-y-6">
      {/* Designer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-active-projects">
                  {activeProjects.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Building className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Leads</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-leads">
                  {newLeads.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600 dark:text-yellow-400 w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month Earnings</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-monthly-earnings">
                  ₹2.4L
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 dark:text-green-400 w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Lead Requests and Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Lead Requests</CardTitle>
            <Badge variant="destructive" data-testid="badge-new-leads">
              {newLeads.length} pending
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newLeads.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No new lead requests</p>
              ) : (
                newLeads.map((lead: any) => (
                  <div key={lead.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground" data-testid={`lead-project-${lead.id}`}>
                          Project ID: {lead.projectId}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Assigned: {new Date(lead.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">New</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleLeadResponse(lead.id, 'accepted')}
                        disabled={respondToLeadMutation.isPending}
                        data-testid={`button-accept-${lead.id}`}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLeadResponse(lead.id, 'declined')}
                        disabled={respondToLeadMutation.isPending}
                        data-testid={`button-decline-${lead.id}`}
                      >
                        Decline
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
            <CardTitle>Active Projects</CardTitle>
            <Button variant="link" size="sm" data-testid="button-view-all-projects">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active projects</p>
              ) : (
                activeProjects.map((project: any) => (
                  <div key={project.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground" data-testid={`project-title-${project.id}`}>
                          {project.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Budget: ₹{project.budget}
                        </p>
                      </div>
                      <Badge variant="default">In Progress</Badge>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Timeline: {project.timeline} months
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
      </div>

      {/* Design Resources & BOQ Management */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Vault & BOQ Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" data-testid="button-upload-design">
                  <Upload className="mr-2 w-4 h-4" />
                  Upload Design
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-create-boq">
                  <FileText className="mr-2 w-4 h-4" />
                  Create BOQ
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-message-client">
                  <MessageCircle className="mr-2 w-4 h-4" />
                  Message Client
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Recent Activity</h4>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  No recent uploads or BOQ updates
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
