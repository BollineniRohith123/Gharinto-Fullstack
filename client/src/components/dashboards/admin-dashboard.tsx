import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, RotateCcw, Eye, Settings, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending approvals
  const { data: pendingUsers = [] } = useQuery({
    queryKey: ['/api/users/pending-approval'],
  });

  // Fetch recent leads
  const { data: recentLeads = [] } = useQuery({
    queryKey: ['/api/leads'],
  });

  // Approve user mutation
  const approveUserMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: string; isApproved: boolean }) => {
      return await apiRequest('PATCH', `/api/users/${userId}/approve`, { isApproved });
    },
    onSuccess: (_, { isApproved }) => {
      toast({
        title: "Success",
        description: `User ${isApproved ? 'approved' : 'rejected'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/pending-approval'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const handleUserApproval = (userId: string, isApproved: boolean) => {
    approveUserMutation.mutate({ userId, isApproved });
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="flex items-center p-4 h-auto" data-testid="button-approve-users">
              <UserPlus className="mr-3 w-5 h-5" />
              <span>Approve Users</span>
            </Button>
            <Button variant="secondary" className="flex items-center p-4 h-auto" data-testid="button-assign-leads">
              <RotateCcw className="mr-3 w-5 h-5" />
              <span>Assign Leads</span>
            </Button>
            <Button variant="outline" className="flex items-center p-4 h-auto" data-testid="button-view-reports">
              <Eye className="mr-3 w-5 h-5" />
              <span>View Reports</span>
            </Button>
            <Button variant="ghost" className="flex items-center p-4 h-auto" data-testid="button-settings">
              <Settings className="mr-3 w-5 h-5" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals and Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <Badge variant="destructive" data-testid="badge-pending-count">
              {Array.isArray(pendingUsers) ? pendingUsers.length : 0} pending
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!Array.isArray(pendingUsers) || pendingUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No pending approvals</p>
              ) : (
                (pendingUsers as any[]).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          {user.firstName?.[0] || user.email?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`user-name-${user.id}`}>
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.role?.replace('_', ' ') || 'customer'} • {user.cityId || 'No city'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                        onClick={() => handleUserApproval(user.id, true)}
                        disabled={approveUserMutation.isPending}
                        data-testid={`button-approve-${user.id}`}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                        onClick={() => handleUserApproval(user.id, false)}
                        disabled={approveUserMutation.isPending}
                        data-testid={`button-reject-${user.id}`}
                      >
                        <X className="w-4 h-4" />
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
            <CardTitle>Recent Leads</CardTitle>
            <Button variant="link" size="sm" data-testid="button-view-all-leads">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!Array.isArray(recentLeads) || recentLeads.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent leads</p>
              ) : (
                (recentLeads as any[]).slice(0, 3).map((lead: any) => (
                  <div key={lead.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground" data-testid={`lead-title-${lead.id}`}>
                        Lead #{lead.id.slice(0, 8)}
                      </p>
                      <Badge 
                        variant={lead.status === 'new' ? 'secondary' : 'default'}
                        data-testid={`lead-status-${lead.id}`}
                      >
                        {lead.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Project ID: {lead.projectId}
                    </p>
                    <div className="flex space-x-2">
                      {lead.status === 'new' && (
                        <Button size="sm" data-testid={`button-assign-lead-${lead.id}`}>
                          Assign
                        </Button>
                      )}
                      <Button variant="link" size="sm" data-testid={`button-view-lead-${lead.id}`}>
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

      {/* City-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle>City-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-muted-foreground font-medium">City</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Active Projects</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Pending Leads</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Revenue</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Placeholder data - would be fetched from API */}
                <tr>
                  <td className="p-3 text-foreground font-medium">Mumbai</td>
                  <td className="p-3 text-foreground">45</td>
                  <td className="p-3 text-foreground">8</td>
                  <td className="p-3 text-foreground">₹18.2L</td>
                  <td className="p-3">
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Excellent
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-foreground font-medium">Delhi</td>
                  <td className="p-3 text-foreground">32</td>
                  <td className="p-3 text-foreground">5</td>
                  <td className="p-3 text-foreground">₹12.8L</td>
                  <td className="p-3">
                    <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      Good
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-foreground font-medium">Bangalore</td>
                  <td className="p-3 text-foreground">28</td>
                  <td className="p-3 text-foreground">12</td>
                  <td className="p-3 text-foreground">₹9.5L</td>
                  <td className="p-3">
                    <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      Needs Attention
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
