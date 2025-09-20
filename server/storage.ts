import {
  users,
  cities,
  projects,
  leads,
  vendors,
  products,
  orders,
  orderItems,
  documents,
  notifications,
  platformConfig,
  type User,
  type UpsertUser,
  type City,
  type Project,
  type Lead,
  type Vendor,
  type Product,
  type Order,
  type Document,
  type Notification,
  type PlatformConfig,
  type InsertUser,
  type InsertCity,
  type InsertProject,
  type InsertLead,
  type InsertVendor,
  type InsertProduct,
  type InsertOrder,
  type InsertDocument,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sum, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // City operations
  getCities(): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;
  updateCityStatus(id: string, isActive: boolean): Promise<void>;
  
  // Project operations
  getProjects(filters?: { cityId?: string; designerId?: string; customerId?: string }): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProjectStatus(id: string, status: string): Promise<void>;
  assignDesignerToProject(projectId: string, designerId: string): Promise<void>;
  
  // Lead operations
  getLeads(filters?: { designerId?: string; status?: string }): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLeadStatus(id: string, status: string): Promise<void>;
  assignLead(leadId: string, designerId: string, assignedById: string): Promise<void>;
  
  // User management
  getUsersByRole(role: string): Promise<User[]>;
  updateUserApprovalStatus(id: string, isApproved: boolean): Promise<void>;
  getUsersAwaitingApproval(): Promise<User[]>;
  
  // Vendor operations
  getVendors(cityId?: string): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendorApprovalStatus(id: string, isApproved: boolean): Promise<void>;
  
  // Product operations
  getProducts(vendorId?: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(id: string, quantity: number): Promise<void>;
  getProductsWithLowStock(threshold?: number): Promise<Product[]>;
  
  // Order operations
  getOrders(filters?: { vendorId?: string; projectId?: string }): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  
  // Document operations
  getDocumentsByProject(projectId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  // Notification operations
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  
  // Analytics
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeProjects: number;
    totalRevenue: string;
    activeCities: number;
  }>;
  getCityStats(): Promise<Array<{
    cityName: string;
    activeProjects: number;
    pendingLeads: number;
    revenue: string;
  }>>;
  
  // Platform configuration
  getPlatformConfig(): Promise<PlatformConfig | undefined>;
  updatePlatformConfig(config: Partial<PlatformConfig>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // City operations
  async getCities(): Promise<City[]> {
    return await db.select().from(cities).orderBy(asc(cities.name));
  }

  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async updateCityStatus(id: string, isActive: boolean): Promise<void> {
    await db.update(cities).set({ isActive }).where(eq(cities.id, id));
  }

  // Project operations
  async getProjects(filters?: { cityId?: string; designerId?: string; customerId?: string }): Promise<Project[]> {
    let query = db.select().from(projects);
    const conditions = [];
    
    if (filters?.cityId) {
      conditions.push(eq(projects.cityId, filters.cityId));
    }
    if (filters?.designerId) {
      conditions.push(eq(projects.designerId, filters.designerId));
    }
    if (filters?.customerId) {
      conditions.push(eq(projects.customerId, filters.customerId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(projects.createdAt));
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProjectStatus(id: string, status: string): Promise<void> {
    await db.update(projects).set({ status: status as any, updatedAt: new Date() }).where(eq(projects.id, id));
  }

  async assignDesignerToProject(projectId: string, designerId: string): Promise<void> {
    await db.update(projects).set({ designerId, status: 'assigned', updatedAt: new Date() }).where(eq(projects.id, projectId));
  }

  // Lead operations
  async getLeads(filters?: { designerId?: string; status?: string }): Promise<Lead[]> {
    let query = db.select().from(leads);
    const conditions = [];
    
    if (filters?.designerId) {
      conditions.push(eq(leads.designerId, filters.designerId));
    }
    if (filters?.status) {
      conditions.push(eq(leads.status, filters.status as any));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLeadStatus(id: string, status: string): Promise<void> {
    await db.update(leads).set({ status: status as any, respondedAt: new Date() }).where(eq(leads.id, id));
  }

  async assignLead(leadId: string, designerId: string, assignedById: string): Promise<void> {
    await db.update(leads).set({
      designerId,
      assignedById,
      status: 'assigned',
      assignedAt: new Date()
    }).where(eq(leads.id, leadId));
  }

  // User management
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any)).orderBy(asc(users.firstName));
  }

  async updateUserApprovalStatus(id: string, isApproved: boolean): Promise<void> {
    await db.update(users).set({ isApproved, updatedAt: new Date() }).where(eq(users.id, id));
  }

  async getUsersAwaitingApproval(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isApproved, false)).orderBy(desc(users.createdAt));
  }

  // Vendor operations
  async getVendors(cityId?: string): Promise<Vendor[]> {
    let query = db.select().from(vendors);
    
    if (cityId) {
      query = query.where(eq(vendors.cityId, cityId));
    }
    
    return await query.orderBy(asc(vendors.businessName));
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendorApprovalStatus(id: string, isApproved: boolean): Promise<void> {
    await db.update(vendors).set({ isApproved }).where(eq(vendors.id, id));
  }

  // Product operations
  async getProducts(vendorId?: string): Promise<Product[]> {
    let query = db.select().from(products);
    
    if (vendorId) {
      query = query.where(eq(products.vendorId, vendorId));
    }
    
    return await query.orderBy(asc(products.name));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProductStock(id: string, quantity: number): Promise<void> {
    await db.update(products).set({ stockQuantity: quantity, updatedAt: new Date() }).where(eq(products.id, id));
  }

  async getProductsWithLowStock(threshold: number = 10): Promise<Product[]> {
    return await db.select().from(products).where(sql`${products.stockQuantity} <= ${threshold}`);
  }

  // Order operations
  async getOrders(filters?: { vendorId?: string; projectId?: string }): Promise<Order[]> {
    let query = db.select().from(orders);
    const conditions = [];
    
    if (filters?.vendorId) {
      conditions.push(eq(orders.vendorId, filters.vendorId));
    }
    if (filters?.projectId) {
      conditions.push(eq(orders.projectId, filters.projectId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(orders.orderDate));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
  }

  // Document operations
  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.projectId, projectId)).orderBy(desc(documents.createdAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  // Notification operations
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Analytics
  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeProjects: number;
    totalRevenue: string;
    activeCities: number;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [projectCount] = await db.select({ count: count() }).from(projects).where(sql`${projects.status} IN ('assigned', 'in_progress')`);
    const [revenueSum] = await db.select({ sum: sum(orders.totalAmount) }).from(orders);
    const [cityCount] = await db.select({ count: count() }).from(cities).where(eq(cities.isActive, true));

    return {
      totalUsers: userCount.count,
      activeProjects: projectCount.count,
      totalRevenue: revenueSum.sum || '0',
      activeCities: cityCount.count,
    };
  }

  async getCityStats(): Promise<Array<{
    cityName: string;
    activeProjects: number;
    pendingLeads: number;
    revenue: string;
  }>> {
    // This would be a complex query joining multiple tables
    // For now, returning empty array - would need proper implementation
    return [];
  }

  // Platform configuration
  async getPlatformConfig(): Promise<PlatformConfig | undefined> {
    const [config] = await db.select().from(platformConfig).limit(1);
    return config;
  }

  async updatePlatformConfig(config: Partial<PlatformConfig>): Promise<void> {
    const existingConfig = await this.getPlatformConfig();
    
    if (existingConfig) {
      await db.update(platformConfig).set({ ...config, updatedAt: new Date() }).where(eq(platformConfig.id, existingConfig.id));
    } else {
      await db.insert(platformConfig).values({ ...config, updatedAt: new Date() });
    }
  }
}

export const storage = new DatabaseStorage();
