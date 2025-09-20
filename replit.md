# Overview

Gharinto is a comprehensive three-sided marketplace platform for India's home interiors industry, connecting homeowners, interior designers, and vendors. The system provides role-based access control, project management workflows, lead assignment systems, and vendor product management. Built as a full-stack web application with React frontend and Node.js/Express backend, it features dynamic navigation, real-time notifications, and comprehensive user management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Library**: Radix UI primitives with shadcn/ui components for consistent design system
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth integration with session-based authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful API with role-based authorization middleware

## Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Strongly typed schema definitions with enums for user roles and status values
- **Key Entities**: Users, Cities, Projects, Leads, Vendors, Products, Orders, Documents, Notifications
- **RBAC**: Dynamic role-based access control with hierarchical permissions (super_admin > admin > employee > designer/vendor > customer)

## Authorization & Security
- **Authentication**: OAuth 2.0 with Replit as identity provider
- **Authorization**: Custom middleware with role hierarchy and resource ownership checks
- **Session Management**: Secure session storage with configurable TTL
- **City-based Access**: Geographic access controls for regional operations

## Role-Based System
- **Super Admin**: Global system configuration, analytics, role management
- **Admin**: Operations management, user approvals, lead assignment
- **Designer**: Project management, design uploads, client communication
- **Customer**: Project tracking, document access, communication
- **Vendor**: Product management, inventory, order fulfillment
- **Employee**: Task-specific access for operational support

## Real-time Features
- **Notifications**: Database-driven notification system with email integration capability
- **Project Updates**: Real-time status tracking and communication workflows
- **Lead Management**: Automated lead assignment with response tracking

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle Kit**: Database migrations and schema management

## Authentication & Sessions
- **Replit OAuth**: Primary authentication provider
- **OpenID Connect**: OAuth 2.0 implementation for secure authentication

## UI & Styling
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Consistent iconography throughout the application

## Development & Build Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Production bundling for server-side code

## Email & Notifications
- **SendGrid**: Email service integration for transactional emails
- **Memoization**: Performance optimization for frequently accessed data

## Form & Validation
- **Zod**: Schema validation for API endpoints and form handling
- **React Hook Form**: Efficient form state management with validation

## Production Deployment
- **Express Static**: Production asset serving
- **Environment Configuration**: Separate development and production configurations
- **Error Handling**: Comprehensive error middleware with logging