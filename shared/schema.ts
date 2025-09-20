import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'admin', 
  'designer',
  'customer',
  'vendor',
  'employee'
]);

// Project status enum
export const projectStatusEnum = pgEnum('project_status', [
  'lead',
  'assigned',
  'in_progress',
  'review',
  'completed',
  'cancelled'
]);

// Lead status enum
export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'assigned',
  'accepted',
  'declined',
  'converted'
]);

// Order status enum
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
]);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('customer'),
  cityId: varchar("city_id"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cities table
export const cities = pgTable("cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  state: varchar("state").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  customerId: varchar("customer_id").notNull(),
  designerId: varchar("designer_id"),
  cityId: varchar("city_id").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  status: projectStatusEnum("status").default('lead'),
  timeline: integer("timeline_months"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  designerId: varchar("designer_id"),
  assignedById: varchar("assigned_by_id"),
  status: leadStatusEnum("status").default('new'),
  assignedAt: timestamp("assigned_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  businessName: varchar("business_name").notNull(),
  description: text("description"),
  cityId: varchar("city_id").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  sku: varchar("sku").unique().notNull(),
  stockQuantity: integer("stock_quantity").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  vendorId: varchar("vendor_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default('pending'),
  orderDate: timestamp("order_date").defaultNow(),
  deliveryDate: timestamp("delivery_date"),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  uploadedById: varchar("uploaded_by_id").notNull(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform configuration table
export const platformConfig = pgTable("platform_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  designerCommission: decimal("designer_commission", { precision: 5, scale: 2 }).default('15.00'),
  platformFee: decimal("platform_fee", { precision: 5, scale: 2 }).default('5.00'),
  vendorCommission: decimal("vendor_commission", { precision: 5, scale: 2 }).default('8.00'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  city: one(cities, {
    fields: [users.cityId],
    references: [cities.id],
  }),
  projects: many(projects),
  leads: many(leads),
  vendor: one(vendors),
  notifications: many(notifications),
}));

export const citiesRelations = relations(cities, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  vendors: many(vendors),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  customer: one(users, {
    fields: [projects.customerId],
    references: [users.id],
  }),
  designer: one(users, {
    fields: [projects.designerId],
    references: [users.id],
  }),
  city: one(cities, {
    fields: [projects.cityId],
    references: [cities.id],
  }),
  leads: many(leads),
  orders: many(orders),
  documents: many(documents),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  project: one(projects, {
    fields: [leads.projectId],
    references: [projects.id],
  }),
  designer: one(users, {
    fields: [leads.designerId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [leads.assignedById],
    references: [users.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, {
    fields: [vendors.userId],
    references: [users.id],
  }),
  city: one(cities, {
    fields: [vendors.cityId],
    references: [cities.id],
  }),
  products: many(products),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  project: one(projects, {
    fields: [orders.projectId],
    references: [projects.id],
  }),
  vendor: one(vendors, {
    fields: [orders.vendorId],
    references: [vendors.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

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

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderDate: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type PlatformConfig = typeof platformConfig.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
