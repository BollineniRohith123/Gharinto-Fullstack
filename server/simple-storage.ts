// Simple storage service for SQLite demo
import { pool } from "./db";
import { nanoid } from 'nanoid';

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

      if (result) {
        return {
          id: result.id,
          designerCommission: result.designer_commission,
          platformFee: result.platform_fee,
          vendorCommission: result.vendor_commission,
          updatedAt: new Date(result.updated_at * 1000).toISOString(),
        };
      }

      return {
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
  async createLead(leadData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    projectType: string;
    budget: string;
    description: string;
  }) {
    try {
      // First create a temporary customer record or use anonymous customer
      const customerId = `temp-customer-${nanoid()}`;
      const projectId = nanoid();
      const timestamp = Math.floor(Date.now() / 1000);

      // Parse budget range to get numeric value
      const budgetValue = parseFloat(leadData.budget.split('-')[0]) || 0;

      const stmt = pool.prepare(`
        INSERT INTO projects (id, title, description, customer_id, city_id, budget, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'lead', ?, ?)
      `);

      const title = `${leadData.projectType} - ${leadData.name}`;
      const description = `${leadData.description}\n\nContact: ${leadData.email}, ${leadData.phone}\nBudget Range: ${leadData.budget}`;

      stmt.run(projectId, title, description, customerId, leadData.city, budgetValue, timestamp, timestamp);

      return {
        id: projectId,
        title,
        description,
        customerId,
        cityId: leadData.city,
        budget: budgetValue,
        status: 'lead',
        customerName: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        projectType: leadData.projectType,
        budgetRange: leadData.budget,
        createdAt: new Date(timestamp * 1000).toISOString(),
        updatedAt: new Date(timestamp * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },
  async createVendor() { return {}; },

  async createUserRegistration(userData: {
    name: string;
    email: string;
    phone: string;
    businessName: string;
    role: string;
    city: string;
    experience: string;
    description: string;
  }) {
    try {
      const id = nanoid();
      const timestamp = Math.floor(Date.now() / 1000);

      const stmt = pool.prepare(`
        INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, city_id, is_approved, created_at, updated_at)
        VALUES (?, ?, ?, ?, NULL, ?, ?, 0, ?, ?)
      `);

      const [firstName, ...lastNameParts] = userData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      stmt.run(id, userData.email, firstName, lastName, userData.role, userData.city, timestamp, timestamp);

      return {
        id,
        email: userData.email,
        firstName,
        lastName,
        role: userData.role,
        cityId: userData.city,
        isApproved: false,
        businessName: userData.businessName,
        experience: userData.experience,
        description: userData.description,
        createdAt: new Date(timestamp * 1000).toISOString(),
        updatedAt: new Date(timestamp * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error creating user registration:', error);
      throw error;
    }
  },
  async createProduct() { return {}; },
  async createCity(cityData: { name: string; state: string }) {
    try {
      const id = `city-${cityData.name.toLowerCase().replace(/\s+/g, '-')}`;
      const now = Math.floor(Date.now() / 1000);

      const stmt = pool.prepare(`
        INSERT INTO cities (id, name, state, is_active, created_at)
        VALUES (?, ?, ?, 1, ?)
      `);

      stmt.run(id, cityData.name, cityData.state, now);

      return {
        id,
        name: cityData.name,
        state: cityData.state,
        is_active: 1,
        created_at: now,
        isActive: true,
        createdAt: new Date(now * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error creating city:', error);
      throw error;
    }
  },

  async updateCity(cityId: string, updates: any) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const fields = [];
      const values = [];

      if (updates.name) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.state) {
        fields.push('state = ?');
        values.push(updates.state);
      }
      if (updates.isActive !== undefined) {
        fields.push('is_active = ?');
        values.push(updates.isActive ? 1 : 0);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push('updated_at = ?');
      values.push(now);
      values.push(cityId);

      const stmt = pool.prepare(`
        UPDATE cities SET ${fields.join(', ')} WHERE id = ?
      `);

      stmt.run(...values);

      // Return updated city
      const getStmt = pool.prepare("SELECT * FROM cities WHERE id = ?");
      const result = getStmt.get(cityId);

      return {
        ...result,
        isActive: Boolean(result.is_active),
        createdAt: new Date(result.created_at * 1000).toISOString(),
        updatedAt: new Date(result.updated_at * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error updating city:', error);
      throw error;
    }
  },

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
  async updatePlatformConfig(configData: any) {
    try {
      const now = Math.floor(Date.now() / 1000);

      // Check if config exists
      const existingStmt = pool.prepare("SELECT * FROM platform_config LIMIT 1");
      const existing = existingStmt.get();

      if (existing) {
        // Update existing config
        const fields = [];
        const values = [];

        if (configData.designerCommission !== undefined) {
          fields.push('designer_commission = ?');
          values.push(parseFloat(configData.designerCommission));
        }
        if (configData.platformFee !== undefined) {
          fields.push('platform_fee = ?');
          values.push(parseFloat(configData.platformFee));
        }
        if (configData.vendorCommission !== undefined) {
          fields.push('vendor_commission = ?');
          values.push(parseFloat(configData.vendorCommission));
        }

        if (fields.length > 0) {
          fields.push('updated_at = ?');
          values.push(now);
          values.push(existing.id);

          const updateStmt = pool.prepare(`
            UPDATE platform_config SET ${fields.join(', ')} WHERE id = ?
          `);
          updateStmt.run(...values);
        }
      } else {
        // Create new config
        const insertStmt = pool.prepare(`
          INSERT INTO platform_config (id, designer_commission, platform_fee, vendor_commission, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertStmt.run(
          'default-config',
          parseFloat(configData.designerCommission) || 15,
          parseFloat(configData.platformFee) || 5,
          parseFloat(configData.vendorCommission) || 8,
          now,
          now
        );
      }

      // Return updated config
      return await this.getPlatformConfig();
    } catch (error) {
      console.error('Error updating platform config:', error);
      throw error;
    }
  }
};