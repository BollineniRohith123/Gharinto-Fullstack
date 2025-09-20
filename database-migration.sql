-- Gharinto Platform Database Migration
-- This script creates all the missing tables for Dynamic RBAC and enhanced features

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS lead_sources CASCADE;

-- Create Dynamic RBAC Tables
CREATE TABLE roles (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL UNIQUE,
    display_name VARCHAR NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL UNIQUE,
    display_name VARCHAR NOT NULL,
    description TEXT,
    module VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    resource VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE role_permissions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id VARCHAR NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE TABLE menu_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id VARCHAR NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    item_id VARCHAR NOT NULL,
    label VARCHAR NOT NULL,
    icon VARCHAR NOT NULL,
    href VARCHAR,
    parent_id VARCHAR,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Homepage testimonials table
CREATE TABLE testimonials (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR NOT NULL,
    client_image VARCHAR,
    testimonial_text TEXT NOT NULL,
    project_title VARCHAR,
    rating INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lead source tracking
CREATE TABLE lead_sources (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, display_name, description, level) VALUES
('super_admin', 'Super Admin', 'Full system access and configuration', 5),
('admin', 'Admin', 'Regional operations management', 4),
('employee', 'Employee', 'Task-specific operations', 3),
('designer', 'Designer', 'Interior design services', 2),
('vendor', 'Vendor', 'Product suppliers and vendors', 2),
('customer', 'Customer', 'End customers', 1);

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, module, action) VALUES
-- User Management
('users.create', 'Create Users', 'Create new user accounts', 'users', 'create'),
('users.read', 'View Users', 'View user information', 'users', 'read'),
('users.update', 'Update Users', 'Modify user information', 'users', 'update'),
('users.delete', 'Delete Users', 'Remove user accounts', 'users', 'delete'),
('users.approve', 'Approve Users', 'Approve pending user registrations', 'users', 'approve'),

-- Role Management
('roles.create', 'Create Roles', 'Create new roles', 'roles', 'create'),
('roles.read', 'View Roles', 'View role information', 'roles', 'read'),
('roles.update', 'Update Roles', 'Modify role information', 'roles', 'update'),
('roles.delete', 'Delete Roles', 'Remove roles', 'roles', 'delete'),
('roles.manage_permissions', 'Manage Role Permissions', 'Assign permissions to roles', 'roles', 'manage_permissions'),

-- City Management
('cities.create', 'Create Cities', 'Add new cities', 'cities', 'create'),
('cities.read', 'View Cities', 'View city information', 'cities', 'read'),
('cities.update', 'Update Cities', 'Modify city information', 'cities', 'update'),
('cities.delete', 'Delete Cities', 'Remove cities', 'cities', 'delete'),

-- Project Management
('projects.create', 'Create Projects', 'Create new projects', 'projects', 'create'),
('projects.read', 'View Projects', 'View project information', 'projects', 'read'),
('projects.update', 'Update Projects', 'Modify project information', 'projects', 'update'),
('projects.delete', 'Delete Projects', 'Remove projects', 'projects', 'delete'),
('projects.assign', 'Assign Projects', 'Assign projects to designers', 'projects', 'assign'),

-- Lead Management
('leads.create', 'Create Leads', 'Create new leads', 'leads', 'create'),
('leads.read', 'View Leads', 'View lead information', 'leads', 'read'),
('leads.update', 'Update Leads', 'Modify lead information', 'leads', 'update'),
('leads.delete', 'Delete Leads', 'Remove leads', 'leads', 'delete'),
('leads.assign', 'Assign Leads', 'Assign leads to designers', 'leads', 'assign'),

-- Product Management
('products.create', 'Create Products', 'Add new products', 'products', 'create'),
('products.read', 'View Products', 'View product information', 'products', 'read'),
('products.update', 'Update Products', 'Modify product information', 'products', 'update'),
('products.delete', 'Delete Products', 'Remove products', 'products', 'delete'),

-- Analytics
('analytics.view', 'View Analytics', 'Access analytics dashboards', 'analytics', 'read'),
('analytics.export', 'Export Analytics', 'Export analytics data', 'analytics', 'export'),

-- Configuration
('config.read', 'View Configuration', 'View system configuration', 'config', 'read'),
('config.update', 'Update Configuration', 'Modify system configuration', 'config', 'update'),

-- Testimonials
('testimonials.create', 'Create Testimonials', 'Add new testimonials', 'testimonials', 'create'),
('testimonials.read', 'View Testimonials', 'View testimonials', 'testimonials', 'read'),
('testimonials.update', 'Update Testimonials', 'Modify testimonials', 'testimonials', 'update'),
('testimonials.delete', 'Delete Testimonials', 'Remove testimonials', 'testimonials', 'delete');

-- Assign permissions to roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin';

-- Admin gets most permissions except role management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.module IN ('users', 'cities', 'projects', 'leads', 'analytics', 'config', 'testimonials');

-- Designer gets project and lead permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'designer' AND p.module IN ('projects', 'leads') AND p.action IN ('read', 'update');

-- Vendor gets product permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'vendor' AND p.module = 'products';

-- Customer gets basic read permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'customer' AND p.action = 'read' AND p.module IN ('projects');

-- Insert default menu items for each role
-- Super Admin Menu
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'dashboard', 'Dashboard', 'BarChart3', 1 FROM roles WHERE name = 'super_admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'cities', 'City Management', 'Building', 2 FROM roles WHERE name = 'super_admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'roles', 'Role Management', 'Users', 3 FROM roles WHERE name = 'super_admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'menu-config', 'Menu Configuration', 'Settings', 4 FROM roles WHERE name = 'super_admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'analytics', 'System Analytics', 'BarChart3', 5 FROM roles WHERE name = 'super_admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'security', 'Security Logs', 'Shield', 6 FROM roles WHERE name = 'super_admin';

-- Admin Menu
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'dashboard', 'Dashboard', 'BarChart3', 1 FROM roles WHERE name = 'admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'approvals', 'User Approvals', 'UserCheck', 2 FROM roles WHERE name = 'admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'leads', 'Lead Assignment', 'Route', 3 FROM roles WHERE name = 'admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'projects', 'Project Management', 'FolderOpen', 4 FROM roles WHERE name = 'admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'testimonials', 'Testimonials', 'Star', 5 FROM roles WHERE name = 'admin';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'reports', 'Reports', 'BarChart3', 6 FROM roles WHERE name = 'admin';

-- Designer Menu
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'dashboard', 'Dashboard', 'BarChart3', 1 FROM roles WHERE name = 'designer';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'leads', 'Lead Requests', 'Inbox', 2 FROM roles WHERE name = 'designer';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'projects', 'My Projects', 'FolderOpen', 3 FROM roles WHERE name = 'designer';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'gallery', 'Design Gallery', 'Palette', 4 FROM roles WHERE name = 'designer';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'boq', 'BOQ Management', 'FileText', 5 FROM roles WHERE name = 'designer';

-- Vendor Menu
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'dashboard', 'Dashboard', 'BarChart3', 1 FROM roles WHERE name = 'vendor';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'products', 'Products', 'Package', 2 FROM roles WHERE name = 'vendor';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'orders', 'Orders', 'ShoppingCart', 3 FROM roles WHERE name = 'vendor';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'inventory', 'Inventory', 'Warehouse', 4 FROM roles WHERE name = 'vendor';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'analytics', 'Analytics', 'BarChart3', 5 FROM roles WHERE name = 'vendor';

-- Customer Menu
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'dashboard', 'Dashboard', 'BarChart3', 1 FROM roles WHERE name = 'customer';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'projects', 'My Projects', 'FolderOpen', 2 FROM roles WHERE name = 'customer';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'vault', 'Digital Vault', 'Archive', 3 FROM roles WHERE name = 'customer';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'messages', 'Messages', 'MessageSquare', 4 FROM roles WHERE name = 'customer';
INSERT INTO menu_items (role_id, item_id, label, icon, sort_order) 
SELECT id, 'support', 'Support', 'Headphones', 5 FROM roles WHERE name = 'customer';

-- Insert sample testimonials
INSERT INTO testimonials (client_name, testimonial_text, project_title, rating, sort_order) VALUES
('Rajesh & Priya Sharma', 'Gharinto transformed our home beyond our expectations. The transparency in pricing and timeline was exceptional. Our designer was professional and the quality of work was outstanding.', '3BHK Modern Home', 5, 1),
('Amit Patel', 'Best decision ever! From initial consultation to final handover, everything was smooth. The project was completed on time and within budget. Highly recommended!', 'Luxury Villa Interior', 5, 2),
('Sneha & Vikram', 'The team at Gharinto is simply amazing. They understood our requirements perfectly and delivered a beautiful kitchen that our family loves. Great customer service!', 'Modular Kitchen Design', 5, 3),
('Dr. Sunita Gupta', 'Professional, reliable, and creative. Gharinto helped us create a workspace that truly reflects our brand. The attention to detail was remarkable.', 'Office Cabin Interiors', 5, 4),
('Rohit & Kavya', 'From concept to completion, Gharinto exceeded our expectations. The quality of materials and craftsmanship was top-notch. We could not be happier with our new home!', 'Apartment Makeover', 5, 5);

-- Insert default lead sources
INSERT INTO lead_sources (name, description) VALUES
('Website', 'Leads from company website'),
('Referral', 'Customer referrals'),
('Social Media', 'Social media platforms'),
('Google Ads', 'Google advertising campaigns'),
('Partner', 'Partner referrals'),
('Walk-in', 'Direct walk-in customers');

-- Create indexes for better performance
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_menu_items_role_id ON menu_items(role_id);
CREATE INDEX idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX idx_testimonials_sort_order ON testimonials(sort_order);

-- Add foreign key constraints with proper names
ALTER TABLE menu_items ADD CONSTRAINT fk_menu_items_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;

COMMIT;