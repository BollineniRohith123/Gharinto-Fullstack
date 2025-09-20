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

  const httpServer = createServer(app);
  return httpServer;
}
