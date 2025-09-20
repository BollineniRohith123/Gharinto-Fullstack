import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VendorProductCatalog from "./components/VendorProductCatalog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Package, Clock, DollarSign, AlertTriangle, Plus, Edit, Trash2, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vendor profile
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
    queryFn: () => fetch('/api/vendors').then(res => res.json()),
  });

  const currentVendor = Array.isArray(vendors) ? vendors.find((v: any) => v.userId === user?.id) : null;

  // Fetch vendor's products
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', currentVendor?.id],
    queryFn: () => {
      if (currentVendor?.id) {
        return fetch(`/api/products?vendorId=${currentVendor.id}`).then(res => res.json());
      }
      return [];
    },
    enabled: !!currentVendor?.id,
  });

  // Fetch vendor's orders
  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders', currentVendor?.id],
    queryFn: () => {
      if (currentVendor?.id) {
        return fetch(`/api/orders?vendorId=${currentVendor.id}`).then(res => res.json());
      }
      return [];
    },
    enabled: !!currentVendor?.id,
  });

  // Fetch low stock products
  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['/api/products/low-stock'],
  });

  const activeListings = products.filter((product: any) => product.isActive).length;
  const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
  const monthlyRevenue = orders
    .filter((order: any) => {
      const orderDate = new Date(order.orderDate);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount || 0), 0);

  const vendorLowStock = Array.isArray(lowStockProducts) ? lowStockProducts.filter((product: any) => 
    products.some((p: any) => p.id === product.id)
  ) : [];

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const handleOrderStatusUpdate = (orderId: string, status: string) => {
    updateOrderMutation.mutate({ orderId, status });
  };

  if (!currentVendor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Vendor Profile Not Found</h3>
          <p className="text-muted-foreground mb-4">
            You need to set up your vendor profile to access the vendor dashboard.
          </p>
          <Button data-testid="button-setup-vendor">
            Set Up Vendor Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vendor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-active-listings">
                  {activeListings}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-orders">
                  {pendingOrders}
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
                <p className="text-sm font-medium text-muted-foreground">This Month Revenue</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-monthly-revenue">
                  ₹{monthlyRevenue.toFixed(1)}L
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 dark:text-green-400 w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-low-stock">
                  {vendorLowStock.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600 dark:text-red-400 w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Inventory Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="link" size="sm" data-testid="button-view-all-orders">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                orders.slice(0, 3).map((order: any) => (
                  <div key={order.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground" data-testid={`order-id-${order.id}`}>
                          Order #{order.id.slice(0, 8)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Project: {order.projectId}
                        </p>
                      </div>
                      <Badge 
                        variant={order.status === 'pending' ? 'secondary' : 'default'}
                        data-testid={`order-status-${order.id}`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <span className="ml-1 text-foreground font-medium">₹{order.totalAmount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <span className="ml-1 text-foreground font-medium">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Button variant="link" size="sm" data-testid={`button-view-order-${order.id}`}>
                        View Details
                      </Button>
                      {order.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => handleOrderStatusUpdate(order.id, 'processing')}
                          disabled={updateOrderMutation.isPending}
                          data-testid={`button-process-order-${order.id}`}
                        >
                          Process Order
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventory Alerts</CardTitle>
            <Button size="sm" data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendorLowStock.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No low stock alerts</p>
              ) : (
                vendorLowStock.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                        <AlertTriangle className="text-orange-600 dark:text-orange-400 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`low-stock-product-${product.id}`}>
                          {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.stockQuantity === 0 ? 'Out of stock' : `Only ${product.stockQuantity} units left`}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      data-testid={`button-restock-${product.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Listings Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Product Listings</CardTitle>
          <div className="flex space-x-2">
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="lighting">Lighting</SelectItem>
                <SelectItem value="decor">Décor</SelectItem>
              </SelectContent>
            </Select>
            <Button data-testid="button-add-new-product">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-muted-foreground font-medium">Product</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Price</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Stock</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products added yet
                    </td>
                  </tr>
                ) : (
                  products.map((product: any) => (
                    <tr key={product.id}>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-muted rounded-lg mr-3 flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground" data-testid={`product-name-${product.id}`}>
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-foreground">{product.category}</td>
                      <td className="p-3 text-foreground">₹{product.price}</td>
                      <td className="p-3 text-foreground">{product.stockQuantity}</td>
                      <td className="p-3">
                        <Badge 
                          variant={product.isActive ? 'default' : 'secondary'}
                          className={product.stockQuantity === 0 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : ''}
                        >
                          {product.stockQuantity === 0 ? 'Out of Stock' : product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            data-testid={`button-edit-product-${product.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            data-testid={`button-view-product-${product.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                            data-testid={`button-delete-product-${product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
