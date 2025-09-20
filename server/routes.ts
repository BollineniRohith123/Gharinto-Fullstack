import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { authorize, authorizeResourceOwnership, authorizeCityAccess, type AuthenticatedRequest } from "./middleware/authorization";
import { z } from "zod";
import { insertProjectSchema, insertLeadSchema, insertVendorSchema, insertProductSchema, insertCitySchema } from "@shared/schema";
import { notificationService } from "./services/notificationService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "No user session found" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // City management routes
  app.get('/api/cities', isAuthenticated, async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  app.post('/api/cities', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const cityData = insertCitySchema.parse(req.body);
      const city = await storage.createCity(cityData);
      res.json(city);
    } catch (error) {
      console.error("Error creating city:", error);
      res.status(400).json({ message: "Failed to create city" });
    }
  });

  app.patch('/api/cities/:id/status', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      await storage.updateCityStatus(id, isActive);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating city status:", error);
      res.status(500).json({ message: "Failed to update city status" });
    }
  });

  // Project management routes
  app.get('/api/projects', isAuthenticated, async (req, res) => {
    try {
      const { cityId, designerId, customerId } = req.query;
      const projects = await storage.getProjects({
        cityId: cityId as string,
        designerId: designerId as string,
        customerId: customerId as string,
      });
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      // Create notification for admins
      const admins = await storage.getUsersByRole('admin');
      for (const admin of admins) {
        await notificationService.createNotification({
          userId: admin.id,
          title: 'New Project Created',
          message: `New project "${project.title}" has been created and needs assignment.`,
          type: 'project_created'
        });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.patch('/api/projects/:id/assign', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const { designerId } = req.body;
      
      await storage.assignDesignerToProject(id, designerId);
      
      // Create lead for the designer
      await storage.createLead({
        projectId: id,
        designerId,
        assignedById: (req.user as any)?.claims?.sub || req.user?.id,
        status: 'assigned'
      });
      
      // Notify designer
      await notificationService.createNotification({
        userId: designerId,
        title: 'New Project Assigned',
        message: 'You have been assigned a new project. Please review and accept.',
        type: 'project_assigned'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error assigning project:", error);
      res.status(500).json({ message: "Failed to assign project" });
    }
  });

  // Lead management routes
  app.get('/api/leads', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { designerId, status } = req.query;
      const currentUser = (req as any).currentUser;
      
      // Users can only see their own leads unless they're admin+
      let queryDesignerId = designerId as string;
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin') {
        queryDesignerId = req.user?.claims?.sub || '';
      }
      
      const leads = await storage.getLeads({
        designerId: queryDesignerId,
        status: status as string,
      });
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.patch('/api/leads/:id/respond', isAuthenticated, authorizeResourceOwnership(async (req: AuthenticatedRequest) => {
    const lead = await storage.getLeads({ designerId: req.user?.claims?.sub || '' });
    const currentLead = lead.find(l => l.id === req.params.id);
    return currentLead?.designerId || null;
  }), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'accepted' or 'declined'
      
      await storage.updateLeadStatus(id, status);
      
      // If accepted, update project status
      if (status === 'accepted') {
        const userId = (req.user as any)?.claims?.sub || req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: "No user session found" });
        }
        const lead = await storage.getLeads({ designerId: userId });
        const currentLead = lead.find(l => l.id === id);
        if (currentLead) {
          await storage.updateProjectStatus(currentLead.projectId, 'in_progress');
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error responding to lead:", error);
      res.status(500).json({ message: "Failed to respond to lead" });
    }
  });

  // User management routes
  app.get('/api/users/pending-approval', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const pendingUsers = await storage.getUsersAwaitingApproval();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.patch('/api/users/:id/approve', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;
      
      await storage.updateUserApprovalStatus(id, isApproved);
      
      // Notify user
      await notificationService.createNotification({
        userId: id,
        title: isApproved ? 'Account Approved' : 'Account Rejected',
        message: isApproved 
          ? 'Your account has been approved. You can now access all features.'
          : 'Your account application has been rejected. Please contact support.',
        type: 'account_status'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user approval:", error);
      res.status(500).json({ message: "Failed to update user approval" });
    }
  });

  // Vendor management routes
  app.get('/api/vendors', isAuthenticated, async (req, res) => {
    try {
      const { cityId } = req.query;
      const vendors = await storage.getVendors(cityId as string);
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post('/api/vendors', isAuthenticated, async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(400).json({ message: "Failed to create vendor" });
    }
  });

  // Product management routes
  app.get('/api/products', isAuthenticated, async (req, res) => {
    try {
      const { vendorId } = req.query;
      const products = await storage.getProducts(vendorId as string);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.get('/api/products/low-stock', isAuthenticated, async (req, res) => {
    try {
      const products = await storage.getProductsWithLowStock();
      res.json(products);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  // Order management routes
  app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const { vendorId, projectId } = req.query;
      const orders = await storage.getOrders({
        vendorId: vendorId as string,
        projectId: projectId as string,
      });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Document management routes
  app.get('/api/projects/:projectId/documents', isAuthenticated, async (req, res) => {
    try {
      const { projectId } = req.params;
      const documents = await storage.getDocumentsByProject(projectId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "No user session found" });
      }
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, authorizeResourceOwnership(async (req: AuthenticatedRequest) => {
    const notification = await storage.getNotificationsByUser(req.user?.claims?.sub || '');
    const targetNotification = notification.find(n => n.id === req.params.id);
    return targetNotification?.userId || null;
  }), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/dashboard-stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Platform configuration routes
  app.get('/api/config/platform', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const config = await storage.getPlatformConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching platform config:", error);
      res.status(500).json({ message: "Failed to fetch platform config" });
    }
  });

  app.patch('/api/config/platform', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      await storage.updatePlatformConfig(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating platform config:", error);
      res.status(500).json({ message: "Failed to update platform config" });
    }
  });

  // RBAC Management Routes
  // Roles
  app.get('/api/roles', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.post('/api/roles', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const roleData = req.body;
      const role = await storage.createRole(roleData);
      res.json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(400).json({ message: "Failed to create role" });
    }
  });

  app.put('/api/roles/:id', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const roleData = req.body;
      await storage.updateRole(id, roleData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(400).json({ message: "Failed to update role" });
    }
  });

  app.delete('/api/roles/:id', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRole(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(400).json({ message: "Failed to delete role" });
    }
  });

  // Permissions
  app.get('/api/permissions', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.get('/api/permissions/module/:module', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const { module } = req.params;
      const permissions = await storage.getPermissionsByModule(module);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions by module:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  // Role Permissions
  app.get('/api/role-permissions/:roleId', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const { roleId } = req.params;
      const rolePermissions = await storage.getRolePermissions(roleId);
      res.json(rolePermissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.put('/api/roles/:roleId/permissions', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;
      await storage.assignPermissionsToRole(roleId, permissionIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error assigning permissions to role:", error);
      res.status(400).json({ message: "Failed to assign permissions" });
    }
  });

  // Menu Items
  app.get('/api/menu-items/:roleId', isAuthenticated, async (req, res) => {
    try {
      const { roleId } = req.params;
      const menuItems = await storage.getMenuItemsByRole(roleId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post('/api/menu-items', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const menuItemData = req.body;
      const menuItem = await storage.createMenuItem(menuItemData);
      res.json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(400).json({ message: "Failed to create menu item" });
    }
  });

  app.put('/api/menu-items/:id', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const menuItemData = req.body;
      await storage.updateMenuItem(id, menuItemData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(400).json({ message: "Failed to update menu item" });
    }
  });

  app.delete('/api/menu-items/:id', isAuthenticated, authorize('super_admin'), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMenuItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(400).json({ message: "Failed to delete menu item" });
    }
  });

  // Testimonials Management
  app.get('/api/testimonials', async (req, res) => {
    try {
      const { activeOnly } = req.query;
      const testimonials = await storage.getTestimonials(activeOnly !== 'false');
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.post('/api/testimonials', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const testimonialData = req.body;
      const testimonial = await storage.createTestimonial(testimonialData);
      res.json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(400).json({ message: "Failed to create testimonial" });
    }
  });

  app.put('/api/testimonials/:id', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const testimonialData = req.body;
      await storage.updateTestimonial(id, testimonialData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(400).json({ message: "Failed to update testimonial" });
    }
  });

  app.delete('/api/testimonials/:id', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTestimonial(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(400).json({ message: "Failed to delete testimonial" });
    }
  });

  // Lead Sources
  app.get('/api/lead-sources', isAuthenticated, async (req, res) => {
    try {
      const leadSources = await storage.getLeadSources();
      res.json(leadSources);
    } catch (error) {
      console.error("Error fetching lead sources:", error);
      res.status(500).json({ message: "Failed to fetch lead sources" });
    }
  });

  // Enhanced Analytics Routes
  app.get('/api/analytics/vendor-stats/:vendorId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { vendorId } = req.params;
      const currentUser = (req as any).currentUser;
      
      // Check if user is requesting their own stats or has admin access
      if (currentUser.role !== 'vendor' && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const stats = await storage.getVendorStats(vendorId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching vendor stats:", error);
      res.status(500).json({ message: "Failed to fetch vendor stats" });
    }
  });

  app.get('/api/analytics/designer-stats/:designerId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { designerId } = req.params;
      const currentUser = (req as any).currentUser;
      
      // Check if user is requesting their own stats or has admin access
      if (currentUser.role !== 'designer' && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const stats = await storage.getDesignerStats(designerId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching designer stats:", error);
      res.status(500).json({ message: "Failed to fetch designer stats" });
    }
  });

  app.get('/api/analytics/city-stats', isAuthenticated, authorize('admin'), async (req, res) => {
    try {
      const { cityId } = req.query;
      const stats = await storage.getAdminCityStats(cityId as string);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching city stats:", error);
      res.status(500).json({ message: "Failed to fetch city stats" });
    }
  });

  // Vendor Product Management (Self-service)
  app.get('/api/vendor/products', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const currentUser = (req as any).currentUser;
      
      // Get vendor profile for current user
      const vendors = await storage.getVendors();
      const vendor = vendors.find(v => v.userId === currentUser.id);
      
      if (!vendor && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        return res.status(404).json({ message: 'Vendor profile not found' });
      }
      
      const vendorId = vendor?.id || req.query.vendorId as string;
      const products = await storage.getProducts(vendorId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/vendor/products', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const currentUser = (req as any).currentUser;
      
      // Get vendor profile for current user
      const vendors = await storage.getVendors();
      const vendor = vendors.find(v => v.userId === currentUser.id);
      
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor profile not found' });
      }
      
      const productData = { ...req.body, vendorId: vendor.id };
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating vendor product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/vendor/products/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).currentUser;
      
      // Verify product ownership for vendors
      if (currentUser.role === 'vendor') {
        const vendors = await storage.getVendors();
        const vendor = vendors.find(v => v.userId === currentUser.id);
        
        if (!vendor) {
          return res.status(404).json({ message: 'Vendor profile not found' });
        }
        
        const products = await storage.getProducts(vendor.id);
        const product = products.find(p => p.id === id);
        
        if (!product) {
          return res.status(404).json({ message: 'Product not found or access denied' });
        }
      }
      
      // Update product logic would go here
      res.json({ success: true, message: 'Product update endpoint - implementation needed' });
    } catch (error) {
      console.error("Error updating vendor product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/vendor/products/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).currentUser;
      
      // Verify product ownership for vendors
      if (currentUser.role === 'vendor') {
        const vendors = await storage.getVendors();
        const vendor = vendors.find(v => v.userId === currentUser.id);
        
        if (!vendor) {
          return res.status(404).json({ message: 'Vendor profile not found' });
        }
        
        const products = await storage.getProducts(vendor.id);
        const product = products.find(p => p.id === id);
        
        if (!product) {
          return res.status(404).json({ message: 'Product not found or access denied' });
        }
      }
      
      // Delete product logic would go here
      res.json({ success: true, message: 'Product deletion endpoint - implementation needed' });
    } catch (error) {
      console.error("Error deleting vendor product:", error);
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  // Product Categories (for dropdown population)
  app.get('/api/product-categories', isAuthenticated, async (req, res) => {
    try {
      // Return static categories for now - in production this would be from database
      const categories = [
        { id: '1', name: 'Flooring' },
        { id: '2', name: 'Lighting' },
        { id: '3', name: 'Furniture' },
        { id: '4', name: 'Tiles' },
        { id: '5', name: 'Paint' },
        { id: '6', name: 'Hardware' },
        { id: '7', name: 'Plumbing' },
        { id: '8', name: 'Electrical' },
        { id: '9', name: 'Textiles' },
        { id: '10', name: 'Appliances' }
      ];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching product categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Lead capture from homepage
  app.post('/api/leads/quote-request', async (req, res) => {
    try {
      const quoteData = req.body;
      
      // Create customer account first
      const customerData = {
        email: quoteData.email,
        firstName: quoteData.name.split(' ')[0],
        lastName: quoteData.name.split(' ').slice(1).join(' ') || '',
        role: 'customer' as any,
        cityId: null, // Would need city lookup
        isApproved: true // Auto-approve customers
      };
      
      const customer = await storage.upsertUser(customerData);
      
      // Create project from quote
      const projectData = {
        title: `${quoteData.projectType} - ${quoteData.name}`,
        description: quoteData.description || `${quoteData.projectType} project`,
        customerId: customer.id,
        cityId: null, // Would need city lookup
        budget: null, // Parse from budget range
        status: 'lead' as any
      };
      
      const project = await storage.createProject(projectData);
      
      // Create lead
      const leadData = {
        projectId: project.id,
        status: 'new' as any
      };
      
      const lead = await storage.createLead(leadData);
      
      // Send notification to admins
      await notificationService.createNotification({
        userId: 'admin', // Would need admin user lookup
        title: 'New Quote Request',
        message: `New quote request from ${quoteData.name} for ${quoteData.projectType}`,
        type: 'new_lead'
      });
      
      res.json({ success: true, leadId: lead.id, projectId: project.id });
    } catch (error) {
      console.error("Error processing quote request:", error);
      res.status(400).json({ message: "Failed to process quote request" });
    }
  });

  // Partner registration from homepage
  app.post('/api/partners/register', async (req, res) => {
    try {
      const partnerData = req.body;
      
      // Create user account
      const userData = {
        email: partnerData.email,
        firstName: partnerData.name.split(' ')[0],
        lastName: partnerData.name.split(' ').slice(1).join(' ') || '',
        role: partnerData.role as any,
        cityId: null, // Would need city lookup
        isApproved: false // Require approval
      };
      
      const user = await storage.upsertUser(userData);
      
      // Create vendor profile if role is vendor
      if (partnerData.role === 'vendor') {
        const vendorData = {
          userId: user.id,
          businessName: partnerData.businessName,
          description: partnerData.description,
          cityId: null, // Would need city lookup
          isApproved: false
        };
        
        await storage.createVendor(vendorData);
      }
      
      // Send notification to admins
      await notificationService.createNotification({
        userId: 'admin', // Would need admin user lookup
        title: 'New Partner Registration',
        message: `New ${partnerData.role} registration from ${partnerData.name}`,
        type: 'partner_registration'
      });
      
      res.json({ success: true, message: 'Registration submitted for review' });
    } catch (error) {
      console.error("Error processing partner registration:", error);
      res.status(400).json({ message: "Failed to process registration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
