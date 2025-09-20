const Database = require('better-sqlite3');
const path = require('path');

// Create SQLite database
const db = new Database('./dev.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Setting up SQLite database...');

// Create tables
const createTables = `
-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    role TEXT DEFAULT 'customer',
    city_id TEXT,
    is_approved INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch())
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT,
    created_at INTEGER DEFAULT (unixepoch())
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    role_id TEXT NOT NULL,
    permission_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    role_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    label TEXT NOT NULL,
    icon TEXT NOT NULL,
    href TEXT,
    parent_id TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT,
    customer_id TEXT NOT NULL,
    designer_id TEXT,
    city_id TEXT NOT NULL,
    budget REAL,
    status TEXT DEFAULT 'lead',
    timeline_months INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    project_id TEXT NOT NULL,
    designer_id TEXT,
    assigned_by_id TEXT,
    status TEXT DEFAULT 'new',
    assigned_at INTEGER,
    responded_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    business_name TEXT NOT NULL,
    description TEXT,
    city_id TEXT NOT NULL,
    is_approved INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    vendor_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    project_id TEXT NOT NULL,
    vendor_id TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    order_date INTEGER DEFAULT (unixepoch()),
    delivery_date INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    client_name TEXT NOT NULL,
    client_image TEXT,
    testimonial_text TEXT NOT NULL,
    project_title TEXT,
    rating INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Platform config table
CREATE TABLE IF NOT EXISTS platform_config (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    designer_commission REAL DEFAULT 15.00,
    platform_fee REAL DEFAULT 5.00,
    vendor_commission REAL DEFAULT 8.00,
    updated_at INTEGER DEFAULT (unixepoch())
);
`;

// Execute table creation
db.exec(createTables);

console.log('Tables created successfully!');

// Insert sample data
const insertSampleData = `
-- Insert default roles
INSERT OR IGNORE INTO roles (name, display_name, description, level) VALUES
('super_admin', 'Super Admin', 'Full system access and configuration', 5),
('admin', 'Admin', 'Regional operations management', 4),
('employee', 'Employee', 'Task-specific operations', 3),
('designer', 'Designer', 'Interior design services', 2),
('vendor', 'Vendor', 'Product suppliers and vendors', 2),
('customer', 'Customer', 'End customers', 1);

-- Insert sample cities
INSERT OR IGNORE INTO cities (id, name, state) VALUES
('mock-city-id', 'Mumbai', 'Maharashtra'),
('city-delhi', 'Delhi', 'Delhi'),
('city-bangalore', 'Bangalore', 'Karnataka'),
('city-pune', 'Pune', 'Maharashtra'),
('city-hyderabad', 'Hyderabad', 'Telangana');

-- Insert mock users
INSERT OR IGNORE INTO users (id, email, first_name, last_name, role, city_id, is_approved) VALUES
('mock-super-admin-id', 'superadmin@gharinto.com', 'Super', 'Admin', 'super_admin', 'mock-city-id', 1),
('mock-admin-id', 'admin@gharinto.com', 'Admin', 'User', 'admin', 'mock-city-id', 1),
('mock-designer-id', 'designer@gharinto.com', 'Design', 'Professional', 'designer', 'mock-city-id', 1),
('mock-customer-id', 'customer@gharinto.com', 'Happy', 'Customer', 'customer', 'mock-city-id', 1),
('mock-vendor-id', 'vendor@gharinto.com', 'Vendor', 'Partner', 'vendor', 'mock-city-id', 1);

-- Insert sample testimonials
INSERT OR IGNORE INTO testimonials (client_name, testimonial_text, project_title, rating, sort_order) VALUES
('Rajesh & Priya Sharma', 'Gharinto transformed our home beyond our expectations. The transparency in pricing and timeline was exceptional.', '3BHK Modern Home', 5, 1),
('Amit Patel', 'Best decision ever! From initial consultation to final handover, everything was smooth.', 'Luxury Villa Interior', 5, 2),
('Sneha & Vikram', 'The team at Gharinto is simply amazing. They understood our requirements perfectly.', 'Modular Kitchen Design', 5, 3);

-- Insert sample vendor
INSERT OR IGNORE INTO vendors (id, user_id, business_name, description, city_id, is_approved) VALUES
('mock-vendor-profile', 'mock-vendor-id', 'Premium Interiors Pvt Ltd', 'Premium furniture and fittings supplier', 'mock-city-id', 1);

-- Insert sample products
INSERT OR IGNORE INTO products (vendor_id, name, description, category, price, sku, stock_quantity) VALUES
('mock-vendor-profile', 'Premium Sofa Set', 'Luxury 3-seater sofa set with premium fabric', 'Furniture', 75000.00, 'SOF-001', 5),
('mock-vendor-profile', 'LED Ceiling Light', 'Modern LED ceiling light with remote control', 'Lighting', 8500.00, 'LED-001', 10),
('mock-vendor-profile', 'Wooden Dining Table', '6-seater solid wood dining table', 'Furniture', 45000.00, 'TAB-001', 3);

-- Insert sample project
INSERT OR IGNORE INTO projects (id, title, description, customer_id, city_id, budget, status) VALUES
('mock-project-1', '3BHK Complete Interior Design', 'Complete interior design for 3BHK apartment in Mumbai', 'mock-customer-id', 'mock-city-id', 500000.00, 'lead');

-- Insert platform config
INSERT OR IGNORE INTO platform_config (designer_commission, platform_fee, vendor_commission) VALUES (15.00, 5.00, 8.00);
`;

db.exec(insertSampleData);

console.log('Sample data inserted successfully!');
console.log('Database setup complete! 🎉');

// Close database
db.close();