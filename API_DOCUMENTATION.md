# Gharinto Platform API Documentation

## Overview
This document provides comprehensive documentation for all Gharinto Platform API endpoints. The API follows RESTful conventions and returns JSON responses.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require authentication via Replit OAuth. The authentication middleware checks for a valid session and user permissions.

### Headers
```
Content-Type: application/json
Cookie: connect.sid=<session-id>
```

## Error Responses
All endpoints may return these error formats:

```json
{
  "message": "Error description",
  "error": "Optional error details"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Login
```http
GET /api/login
```
Redirects to Replit OAuth login page.

### Logout
```http
GET /api/logout
```
Logs out the current user and destroys session.

### Current User
```http
GET /api/user
```
Returns the current authenticated user's information.

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "designer",
  "isApproved": true,
  "cityId": "city-id",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## User Management

### Get Users by Role
```http
GET /api/users/role/:role
```
**Auth Required:** Admin+
**Parameters:**
- `role` - User role (super_admin, admin, designer, customer, vendor, employee)

### Get Pending Approvals
```http
GET /api/users/pending-approval
```
**Auth Required:** Admin+

### Update User Approval
```http
PATCH /api/users/:id/approval
```
**Auth Required:** Admin+
**Body:**
```json
{
  "isApproved": true
}
```

---

## RBAC Management

### Roles

#### Get All Roles
```http
GET /api/roles
```
**Auth Required:** Super Admin

#### Create Role
```http
POST /api/roles
```
**Auth Required:** Super Admin
**Body:**
```json
{
  "name": "project_manager",
  "displayName": "Project Manager",
  "description": "Manages project execution",
  "level": 3
}
```

#### Update Role
```http
PUT /api/roles/:id
```
**Auth Required:** Super Admin

#### Delete Role
```http
DELETE /api/roles/:id
```
**Auth Required:** Super Admin

### Permissions

#### Get All Permissions
```http
GET /api/permissions
```
**Auth Required:** Super Admin

#### Get Permissions by Module
```http
GET /api/permissions/module/:module
```
**Auth Required:** Super Admin

### Role Permissions

#### Get Role Permissions
```http
GET /api/role-permissions/:roleId
```
**Auth Required:** Super Admin

#### Assign Permissions to Role
```http
PUT /api/roles/:roleId/permissions
```
**Auth Required:** Super Admin
**Body:**
```json
{
  "permissionIds": ["perm-id-1", "perm-id-2"]
}
```

### Menu Items

#### Get Menu Items by Role
```http
GET /api/menu-items/:roleId
```
**Auth Required:** Authenticated

**Response:**
```json
[
  {
    "id": "menu-item-id",
    "itemId": "dashboard",
    "label": "Dashboard",
    "icon": "BarChart3",
    "href": "/dashboard",
    "sortOrder": 1,
    "isActive": true
  }
]
```

#### Create Menu Item
```http
POST /api/menu-items
```
**Auth Required:** Super Admin

#### Update Menu Item
```http
PUT /api/menu-items/:id
```
**Auth Required:** Super Admin

#### Delete Menu Item
```http
DELETE /api/menu-items/:id
```
**Auth Required:** Super Admin

---

## City Management

### Get Cities
```http
GET /api/cities
```
**Auth Required:** Authenticated

### Create City
```http
POST /api/cities
```
**Auth Required:** Super Admin
**Body:**
```json
{
  "name": "Mumbai",
  "state": "Maharashtra"
}
```

### Update City Status
```http
PATCH /api/cities/:id/status
```
**Auth Required:** Super Admin

---

## Project Management

### Get Projects
```http
GET /api/projects?cityId=&designerId=&customerId=
```
**Auth Required:** Authenticated

### Get Project by ID
```http
GET /api/projects/:id
```
**Auth Required:** Authenticated (Owner or Admin)

### Create Project
```http
POST /api/projects
```
**Auth Required:** Authenticated
**Body:**
```json
{
  "title": "3BHK Interior Design",
  "description": "Modern apartment interior",
  "customerId": "customer-id",
  "cityId": "city-id",
  "budget": "500000"
}
```

### Update Project Status
```http
PATCH /api/projects/:id/status
```
**Auth Required:** Designer/Admin

### Assign Designer
```http
PATCH /api/projects/:id/assign-designer
```
**Auth Required:** Admin
**Body:**
```json
{
  "designerId": "designer-id"
}
```

---

## Lead Management

### Get Leads
```http
GET /api/leads?designerId=&status=
```
**Auth Required:** Authenticated

### Create Lead
```http
POST /api/leads
```
**Auth Required:** Admin

### Update Lead Status
```http
PATCH /api/leads/:id/status
```
**Auth Required:** Designer/Admin

### Assign Lead
```http
PATCH /api/leads/:id/assign
```
**Auth Required:** Admin
**Body:**
```json
{
  "designerId": "designer-id"
}
```

### Quote Request (Public)
```http
POST /api/leads/quote-request
```
**Auth Required:** None
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "city": "Mumbai",
  "projectType": "Full Home Interior",
  "budget": "₹10-20 Lakhs",
  "description": "Looking for modern interior design"
}
```

---

## Vendor Management

### Get Vendors
```http
GET /api/vendors?cityId=
```
**Auth Required:** Authenticated

### Create Vendor
```http
POST /api/vendors
```
**Auth Required:** Authenticated

### Get Vendor Products
```http
GET /api/vendor/products
```
**Auth Required:** Vendor (self-service)

### Create Vendor Product
```http
POST /api/vendor/products
```
**Auth Required:** Vendor
**Body:**
```json
{
  "name": "Premium Oak Flooring",
  "description": "High-quality oak flooring",
  "category": "Flooring",
  "price": 25000,
  "sku": "FLOOR-OAK-001",
  "stockQuantity": 100
}
```

### Update Vendor Product
```http
PUT /api/vendor/products/:id
```
**Auth Required:** Vendor (owner)

### Delete Vendor Product
```http
DELETE /api/vendor/products/:id
```
**Auth Required:** Vendor (owner)

---

## Product Management

### Get Products
```http
GET /api/products?vendorId=
```
**Auth Required:** Authenticated

### Create Product
```http
POST /api/products
```
**Auth Required:** Vendor/Admin

### Get Low Stock Products
```http
GET /api/products/low-stock
```
**Auth Required:** Vendor/Admin

### Get Product Categories
```http
GET /api/product-categories
```
**Auth Required:** Authenticated

**Response:**
```json
[
  {
    "id": "1",
    "name": "Flooring"
  },
  {
    "id": "2", 
    "name": "Lighting"
  }
]
```

---

## Order Management

### Get Orders
```http
GET /api/orders?vendorId=&projectId=
```
**Auth Required:** Authenticated

### Create Order
```http
POST /api/orders
```
**Auth Required:** Admin/Designer

### Update Order Status
```http
PATCH /api/orders/:id/status
```
**Auth Required:** Vendor/Admin

---

## Document Management

### Get Project Documents
```http
GET /api/projects/:projectId/documents
```
**Auth Required:** Project stakeholder

### Upload Document
```http
POST /api/projects/:projectId/documents
```
**Auth Required:** Project stakeholder

---

## Notification Management

### Get User Notifications
```http
GET /api/notifications
```
**Auth Required:** Authenticated (self)

### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
```
**Auth Required:** Authenticated (owner)

---

## Analytics

### Dashboard Stats
```http
GET /api/analytics/dashboard-stats
```
**Auth Required:** Admin+

**Response:**
```json
{
  "totalUsers": 1250,
  "activeProjects": 45,
  "totalRevenue": "2500000",
  "activeCities": 8
}
```

### Vendor Stats
```http
GET /api/analytics/vendor-stats/:vendorId
```
**Auth Required:** Vendor (self) or Admin+

**Response:**
```json
{
  "totalProducts": 25,
  "activeOrders": 8,
  "monthlyRevenue": "150000",
  "inventoryItems": 500
}
```

### Designer Stats
```http
GET /api/analytics/designer-stats/:designerId
```
**Auth Required:** Designer (self) or Admin+

**Response:**
```json
{
  "activeProjects": 5,
  "completedProjects": 12,
  "totalRevenue": "350000",
  "customerRating": 4.5
}
```

### City Stats
```http
GET /api/analytics/city-stats?cityId=
```
**Auth Required:** Admin+

---

## Testimonial Management

### Get Testimonials
```http
GET /api/testimonials?activeOnly=true
```
**Auth Required:** None (public) or Admin (all)

### Create Testimonial
```http
POST /api/testimonials
```
**Auth Required:** Admin
**Body:**
```json
{
  "clientName": "John & Jane Doe",
  "testimonialText": "Excellent service and quality work!",
  "projectTitle": "3BHK Modern Home",
  "rating": 5,
  "sortOrder": 1
}
```

### Update Testimonial
```http
PUT /api/testimonials/:id
```
**Auth Required:** Admin

### Delete Testimonial
```http
DELETE /api/testimonials/:id
```
**Auth Required:** Admin

---

## Lead Sources

### Get Lead Sources
```http
GET /api/lead-sources
```
**Auth Required:** Authenticated

---

## Partner Registration

### Register Partner (Public)
```http
POST /api/partners/register
```
**Auth Required:** None
**Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "businessName": "Smith Interiors",
  "role": "designer",
  "city": "Mumbai",
  "experience": "5 years",
  "description": "Specialized in modern residential interiors"
}
```

---

## Platform Configuration

### Get Platform Config
```http
GET /api/config/platform
```
**Auth Required:** Admin+

### Update Platform Config
```http
PATCH /api/config/platform
```
**Auth Required:** Super Admin
**Body:**
```json
{
  "designerCommission": 15.00,
  "platformFee": 5.00,
  "vendorCommission": 8.00
}
```

---

## Rate Limits
- Public endpoints: 100 requests per hour per IP
- Authenticated endpoints: 1000 requests per hour per user
- File upload endpoints: 10 requests per minute per user

## Webhooks
(To be implemented in future versions)

## SDK Support
Official SDKs available for:
- JavaScript/TypeScript
- React Hooks
- React Query integration

## Support
For API support, contact: api-support@gharinto.com