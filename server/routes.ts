import type { Express } from "express";
import { createServer, type Server } from "http";
import { simpleStorage as storage } from "./simple-storage";
import { setupMockAuth, isAuthenticated } from "./mockAuth";
// import { authorize, authorizeResourceOwnership, authorizeCityAccess, type AuthenticatedRequest } from "./middleware/authorization";
import { z } from "zod";
// import { insertProjectSchema, insertLeadSchema, insertVendorSchema, insertProductSchema, insertCitySchema } from "@shared/schema";
// import { notificationService } from "./services/notificationService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup mock authentication instead of Replit OAuth
  await setupMockAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "No user session found" });
      }
      const user = await storage.getUser(userId);
      res.json(user || req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(req.user); // Fallback to session user
    }
  });

  // City management routes
  app.get('/api/cities', async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
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

  // Product categories (for dropdown population)
  app.get('/api/product-categories', async (req, res) => {
    try {
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

  // Vendor/Product routes
  app.get('/api/vendors', async (req, res) => {
    try {
      const { cityId } = req.query;
      const vendors = await storage.getVendors(cityId as string);
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { vendorId } = req.query;
      const products = await storage.getProducts(vendorId as string);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Basic RBAC routes
  app.get('/api/roles', isAuthenticated, async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  // Mock other endpoints for now
  const mockEndpoints = [
    '/api/leads', '/api/orders', '/api/notifications', '/api/users/pending-approval',
    '/api/permissions', '/api/menu-items', '/api/lead-sources', '/api/config/platform'
  ];

  mockEndpoints.forEach(endpoint => {
    app.get(endpoint, isAuthenticated, (req, res) => {
      res.json([]); // Return empty array for now
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
