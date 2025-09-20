// Simple storage service for SQLite demo
import { pool } from "./db";

export const simpleStorage = {
  // Get testimonials
  async getTestimonials(activeOnly = true) {
    try {
      const query = activeOnly 
        ? "SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order"
        : "SELECT * FROM testimonials ORDER BY sort_order";
      
      const stmt = pool.prepare(query);
      const results = stmt.all();
      
      // Convert SQLite results to match expected format
      return results.map((row: any) => ({
        ...row,
        isActive: Boolean(row.is_active),
        createdAt: new Date(row.created_at * 1000).toISOString(),
        updatedAt: new Date(row.updated_at * 1000).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },

  // Get cities
  async getCities() {
    try {
      const stmt = pool.prepare("SELECT * FROM cities WHERE is_active = 1 ORDER BY name");
      const results = stmt.all();
      
      return results.map((row: any) => ({
        ...row,
        isActive: Boolean(row.is_active),
        createdAt: new Date(row.created_at * 1000).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUser(userId: string) {
    try {
      const stmt = pool.prepare("SELECT * FROM users WHERE id = ?");
      const result = stmt.get(userId);
      
      if (!result) return null;
      
      return {
        ...result,
        isApproved: Boolean((result as any).is_approved),
        createdAt: new Date((result as any).created_at * 1000).toISOString(),
        updatedAt: new Date((result as any).updated_at * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get roles
  async getRoles() {
    try {
      const stmt = pool.prepare("SELECT * FROM roles ORDER BY level DESC");
      const results = stmt.all();
      
      return results.map((row: any) => ({
        ...row,
        isActive: Boolean(row.is_active),
        createdAt: new Date(row.created_at * 1000).toISOString(),
        updatedAt: new Date(row.updated_at * 1000).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  // Get projects
  async getProjects(filters: any = {}) {
    try {
      let query = "SELECT * FROM projects WHERE 1=1";
      const params: any[] = [];
      
      if (filters.cityId) {
        query += " AND city_id = ?";
        params.push(filters.cityId);
      }
      
      if (filters.designerId) {
        query += " AND designer_id = ?";
        params.push(filters.designerId);
      }
      
      if (filters.customerId) {
        query += " AND customer_id = ?";
        params.push(filters.customerId);
      }
      
      query += " ORDER BY created_at DESC";
      
      const stmt = pool.prepare(query);
      const results = stmt.all(params);
      
      return results.map((row: any) => ({
        ...row,
        createdAt: new Date(row.created_at * 1000).toISOString(),
        updatedAt: new Date(row.updated_at * 1000).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Simple dashboard stats
  async getDashboardStats() {
    try {
      const totalUsers = pool.prepare("SELECT COUNT(*) as count FROM users").get() as any;
      const totalProjects = pool.prepare("SELECT COUNT(*) as count FROM projects").get() as any;
      const totalVendors = pool.prepare("SELECT COUNT(*) as count FROM vendors").get() as any;
      const activeProjects = pool.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'in_progress'").get() as any;
      
      return {
        totalUsers: totalUsers.count,
        totalProjects: totalProjects.count,
        totalVendors: totalVendors.count,
        activeProjects: activeProjects.count,
        totalRevenue: 0, // Mock value
        monthlyRevenue: 0, // Mock value
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Mock implementations for other required methods
  async getVendors(cityId?: string) {
    return [];
  },

  async getProducts(vendorId?: string) {
    try {
      const query = vendorId 
        ? "SELECT * FROM products WHERE vendor_id = ? AND is_active = 1"
        : "SELECT * FROM products WHERE is_active = 1";
      
      const stmt = pool.prepare(query);
      const results = vendorId ? stmt.all(vendorId) : stmt.all();
      
      return results.map((row: any) => ({
        ...row,
        isActive: Boolean(row.is_active),
        createdAt: new Date(row.created_at * 1000).toISOString(),
        updatedAt: new Date(row.updated_at * 1000).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getLeads(filters: any = {}) {
    return [];
  },

  async getOrders(filters: any = {}) {
    return [];
  },

  async getNotificationsByUser(userId: string) {
    return [];
  },

  async getPlatformConfig() {
    try {
      const stmt = pool.prepare("SELECT * FROM platform_config LIMIT 1");
      const result = stmt.get();
      
      return result || {
        designerCommission: 15.00,
        platformFee: 5.00,
        vendorCommission: 8.00
      };
    } catch (error) {
      console.error('Error fetching platform config:', error);
      return {
        designerCommission: 15.00,
        platformFee: 5.00,
        vendorCommission: 8.00
      };
    }
  },

  // Mock methods for other functionality
  async getUsersAwaitingApproval() { return []; },
  async updateUserApprovalStatus() { return true; },
  async createProject() { return {}; },
  async createLead() { return {}; },
  async createVendor() { return {}; },
  async createProduct() { return {}; },
  async createCity() { return {}; },
  async updateCityStatus() { return true; },
  async assignDesignerToProject() { return true; },
  async updateLeadStatus() { return true; },
  async updateProjectStatus() { return true; },
  async getProductsWithLowStock() { return []; },
  async getDocumentsByProject() { return []; },
  async markNotificationAsRead() { return true; },
  async getPermissions() { return []; },
  async getPermissionsByModule() { return []; },
  async getRolePermissions() { return []; },
  async assignPermissionsToRole() { return true; },
  async getMenuItemsByRole() { return []; },
  async createMenuItem() { return {}; },
  async updateMenuItem() { return true; },
  async deleteMenuItem() { return true; },
  async createRole() { return {}; },
  async updateRole() { return true; },
  async deleteRole() { return true; },
  async createTestimonial() { return {}; },
  async updateTestimonial() { return true; },
  async deleteTestimonial() { return true; },
  async getLeadSources() { return []; },
  async getVendorStats() { return {}; },
  async getDesignerStats() { return {}; },
  async getAdminCityStats() { return {}; },
  async upsertUser() { return {}; },
  async getUsersByRole() { return []; },
  async updatePlatformConfig() { return true; }
};