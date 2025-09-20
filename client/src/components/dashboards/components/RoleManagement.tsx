import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    level: 1
  });

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['/api/roles'],
  });

  // Fetch permissions
  const { data: permissions = [] } = useQuery({
    queryKey: ['/api/permissions'],
  });

  // Fetch role permissions for editing
  const { data: rolePermissions = [] } = useQuery({
    queryKey: ['/api/role-permissions', editingRole?.id],
    enabled: !!editingRole?.id,
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      return await apiRequest('POST', '/api/roles', roleData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsCreateDialogOpen(false);
      setNewRole({ name: '', displayName: '', description: '', level: 1 });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Update role permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      return await apiRequest('PUT', `/api/roles/${roleId}/permissions`, { permissionIds });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/role-permissions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    },
  });

  const handleCreateRole = () => {
    if (newRole.name && newRole.displayName) {
      createRoleMutation.mutate(newRole);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (!editingRole) return;
    
    const currentPermissions = rolePermissions.map((rp: any) => rp.permissionId);
    const updatedPermissions = checked
      ? [...currentPermissions, permissionId]
      : currentPermissions.filter((id: string) => id !== permissionId);

    updatePermissionsMutation.mutate({
      roleId: editingRole.id,
      permissionIds: updatedPermissions
    });
  };

  const getPermissionsByModule = () => {
    const grouped = permissions.reduce((acc: any, permission: any) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {});
    return grouped;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Role Management
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roleName">Role Name (Internal)</Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., project_manager"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={newRole.displayName}
                    onChange={(e) => setNewRole(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g., Project Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Role description..."
                  />
                </div>
                <div>
                  <Label htmlFor="level">Hierarchy Level</Label>
                  <Select value={newRole.level.toString()} onValueChange={(value) => setNewRole(prev => ({ ...prev, level: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>Level {level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending}>
                  Create Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role: any) => (
              <div key={role.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{role.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{role.name}</p>
                  </div>
                  <Badge variant={role.isActive ? "default" : "secondary"}>
                    Level {role.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRole(role)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit Permissions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Management Dialog */}
      {editingRole && (
        <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Permissions: {editingRole.displayName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {Object.entries(getPermissionsByModule()).map(([module, modulePermissions]: [string, any]) => (
                <div key={module} className="space-y-3">
                  <h3 className="text-lg font-semibold capitalize">{module} Module</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulePermissions.map((permission: any) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={rolePermissions.some((rp: any) => rp.permissionId === permission.id)}
                          onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                        />
                        <Label htmlFor={permission.id} className="text-sm">
                          <span className="font-medium">{permission.displayName}</span>
                          <span className="text-muted-foreground"> ({permission.action})</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}