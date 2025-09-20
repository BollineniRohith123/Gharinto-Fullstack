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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Star, Quote, ArrowUp, ArrowDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TestimonialManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [newTestimonial, setNewTestimonial] = useState({
    clientName: '',
    testimonialText: '',
    projectTitle: '',
    rating: 5,
    sortOrder: 0
  });

  // Fetch testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ['/api/testimonials'],
  });

  // Create testimonial mutation
  const createTestimonialMutation = useMutation({
    mutationFn: async (testimonialData: any) => {
      return await apiRequest('POST', '/api/testimonials', testimonialData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Testimonial created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create testimonial",
        variant: "destructive",
      });
    },
  });

  // Update testimonial mutation
  const updateTestimonialMutation = useMutation({
    mutationFn: async ({ id, ...testimonialData }: any) => {
      return await apiRequest('PUT', `/api/testimonials/${id}`, testimonialData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      setEditingTestimonial(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update testimonial",
        variant: "destructive",
      });
    },
  });

  // Delete testimonial mutation
  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/testimonials/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewTestimonial({
      clientName: '',
      testimonialText: '',
      projectTitle: '',
      rating: 5,
      sortOrder: 0
    });
  };

  const handleCreateTestimonial = () => {
    if (newTestimonial.clientName && newTestimonial.testimonialText) {
      createTestimonialMutation.mutate(newTestimonial);
    }
  };

  const handleUpdateTestimonial = () => {
    if (editingTestimonial) {
      updateTestimonialMutation.mutate(editingTestimonial);
    }
  };

  const handleMoveUp = (testimonial: any, index: number) => {
    if (index > 0) {
      const updatedTestimonial = { ...testimonial, sortOrder: testimonial.sortOrder - 1 };
      updateTestimonialMutation.mutate(updatedTestimonial);
    }
  };

  const handleMoveDown = (testimonial: any, index: number) => {
    if (index < testimonials.length - 1) {
      const updatedTestimonial = { ...testimonial, sortOrder: testimonial.sortOrder + 1 };
      updateTestimonialMutation.mutate(updatedTestimonial);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Quote className="w-5 h-5 mr-2" />
            Testimonial Management
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Testimonial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={newTestimonial.clientName}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, clientName: e.target.value }))}
                      placeholder="e.g., John & Jane Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectTitle">Project Title</Label>
                    <Input
                      id="projectTitle"
                      value={newTestimonial.projectTitle}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, projectTitle: e.target.value }))}
                      placeholder="e.g., 3BHK Modern Home"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Select value={newTestimonial.rating.toString()} onValueChange={(value) => setNewTestimonial(prev => ({ ...prev, rating: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} Star{rating !== 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Display Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={newTestimonial.sortOrder}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="testimonialText">Testimonial Text *</Label>
                  <Textarea
                    id="testimonialText"
                    value={newTestimonial.testimonialText}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, testimonialText: e.target.value }))}
                    placeholder="What the client said about their experience..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={handleCreateTestimonial} 
                    disabled={createTestimonialMutation.isPending}
                    className="flex-1"
                  >
                    Add Testimonial
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testimonials.map((testimonial: any, index: number) => (
              <div key={testimonial.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-foreground mr-3">{testimonial.clientName}</h3>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Badge variant={testimonial.isActive ? "default" : "secondary"} className="ml-3">
                        {testimonial.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {testimonial.projectTitle && (
                      <p className="text-sm text-muted-foreground mb-2">{testimonial.projectTitle}</p>
                    )}
                    <p className="text-gray-700 italic">"{testimonial.testimonialText}"</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveUp(testimonial, index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveDown(testimonial, index)}
                        disabled={index === testimonials.length - 1}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTestimonial(testimonial)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTestimonialMutation.mutate(testimonial.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Order: {testimonial.sortOrder} • Created: {new Date(testimonial.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Testimonial Dialog */}
      {editingTestimonial && (
        <Dialog open={!!editingTestimonial} onOpenChange={() => setEditingTestimonial(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editClientName">Client Name *</Label>
                  <Input
                    id="editClientName"
                    value={editingTestimonial.clientName}
                    onChange={(e) => setEditingTestimonial(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editProjectTitle">Project Title</Label>
                  <Input
                    id="editProjectTitle"
                    value={editingTestimonial.projectTitle || ''}
                    onChange={(e) => setEditingTestimonial(prev => ({ ...prev, projectTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editRating">Rating</Label>
                  <Select 
                    value={editingTestimonial.rating.toString()} 
                    onValueChange={(value) => setEditingTestimonial(prev => ({ ...prev, rating: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editSortOrder">Display Order</Label>
                  <Input
                    id="editSortOrder"
                    type="number"
                    value={editingTestimonial.sortOrder}
                    onChange={(e) => setEditingTestimonial(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editTestimonialText">Testimonial Text *</Label>
                <Textarea
                  id="editTestimonialText"
                  value={editingTestimonial.testimonialText}
                  onChange={(e) => setEditingTestimonial(prev => ({ ...prev, testimonialText: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={handleUpdateTestimonial} 
                  disabled={updateTestimonialMutation.isPending}
                  className="flex-1"
                >
                  Update Testimonial
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingTestimonial(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}