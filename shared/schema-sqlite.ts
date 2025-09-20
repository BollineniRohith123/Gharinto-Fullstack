import { sql, relations } from 'drizzle-orm';
import {
  index,
  text as jsonb, // SQLite doesn't have jsonb, use text
  sqliteTable,
  integer as timestamp, // SQLite uses integer for timestamps
  text as varchar,
  text,
  integer,
  real as decimal, // SQLite uses real for decimal
  integer as boolean, // SQLite uses integer for boolean
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for auth)
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON as text
    expire: integer("expire").notNull(), // Unix timestamp
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// User storage table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role", { enum: ['super_admin', 'admin', 'designer', 'customer', 'vendor', 'employee'] }).default('customer'),
  cityId: text("city_id"),
  isApproved: integer("is_approved", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`),
});

// Cities table
export const cities = sqliteTable("cities", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  state: text("state").notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Projects table
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  title: text("title").notNull(),
  description: text("description"),
  customerId: text("customer_id").notNull(),
  designerId: text("designer_id"),
  cityId: text("city_id").notNull(),
  budget: real("budget"),
  status: text("status", { enum: ['lead', 'assigned', 'in_progress', 'review', 'completed', 'cancelled'] }).default('lead'),
  timeline: integer("timeline_months"),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`),
});

// Leads table
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  projectId: text("project_id").notNull(),
  designerId: text("designer_id"),
  assignedById: text("assigned_by_id"),
  status: text("status", { enum: ['new', 'assigned', 'accepted', 'declined', 'converted'] }).default('new'),
  assignedAt: integer("assigned_at"),
  respondedAt: integer("responded_at"),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Vendors table
export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull(),
  businessName: text("business_name").notNull(),
  description: text("description"),
  cityId: text("city_id").notNull(),
  isApproved: integer("is_approved", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Products table
export const products = sqliteTable("products", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  vendorId: text("vendor_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: real("price").notNull(),
  sku: text("sku").unique().notNull(),
  stockQuantity: integer("stock_quantity").default(0),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`),
});

// Orders table
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  projectId: text("project_id").notNull(),
  vendorId: text("vendor_id").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status", { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }).default('pending'),
  orderDate: integer("order_date").default(sql`(unixepoch())`),
  deliveryDate: integer("delivery_date"),
});

// Order items table
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
});

// Documents table
export const documents = sqliteTable("documents", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  projectId: text("project_id").notNull(),
  uploadedById: text("uploaded_by_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size"),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Platform configuration table
export const platformConfig = sqliteTable("platform_config", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  designerCommission: real("designer_commission").default(15.00),
  platformFee: real("platform_fee").default(5.00),
  vendorCommission: real("vendor_commission").default(8.00),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`),
});

// Dynamic RBAC Tables
export const roles = sqliteTable("roles", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  level: integer("level").notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`),
});

export const permissions = sqliteTable("permissions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  module: text("module").notNull(),
  action: text("action").notNull(),
  resource: text("resource"),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

export const rolePermissions = sqliteTable("role_permissions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  roleId: text("role_id").notNull(),
  permissionId: text("permission_id").notNull(),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

export const menuItems = sqliteTable("menu_items", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  roleId: text("role_id").notNull(),
  itemId: text("item_id").notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull(),
  href: text("href"),
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").default(0),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Homepage testimonials table
export const testimonials = sqliteTable("testimonials", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  clientName: text("client_name").notNull(),
  clientImage: text("client_image"),
  testimonialText: text("testimonial_text").notNull(),
  projectTitle: text("project_title"),
  rating: integer("rating").default(5),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`),
});

// Lead source tracking
export const leadSources = sqliteTable("lead_sources", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// All the relations and schemas remain the same structure...
// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;

// For compatibility, export the same types
export type {
  UpsertUser as InsertUser,
  City as InsertCity,
  Project as InsertProject,
  Lead as InsertLead,
  Vendor as InsertVendor,
  Product as InsertProduct
};