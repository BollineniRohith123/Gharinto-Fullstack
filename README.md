# Gharinto Platform - Complete Interior Design Marketplace

🏠 **Transform India's home interiors sector with our technology-driven, three-sided marketplace connecting homeowners, designers, and vendors with transparency and excellence.**

## 🎯 Overview

Gharinto is a production-ready, enterprise-grade interior design marketplace platform that revolutionizes how customers, designers, and vendors collaborate on home transformation projects. Built with modern technologies and featuring comprehensive RBAC, real-time analytics, and seamless user experiences.

## ✨ Features

### 🔐 **Dynamic RBAC System**
- Database-driven role management
- Granular permission system
- Dynamic menu configuration
- Hierarchical user access control

### 🏡 **Professional Homepage**
- Pale green/black/green theme design
- Lead capture with "Get Free Quote" form
- Partner registration with role selection
- Admin-editable testimonials
- Mobile-responsive design

### 📊 **Advanced Dashboards**
- **Super Admin**: Global platform control, role management, system analytics
- **Admin**: User approvals, lead assignment, testimonial management, city analytics
- **Designer**: Lead marketplace, project management, earnings tracking
- **Customer**: Project progress tracking, digital vault, communication center
- **Vendor**: Self-service product catalog, inventory management, order tracking

### 🛠 **Self-Service Portals**
- Vendor product catalog management
- Real-time inventory tracking
- Automated lead assignment
- Project progress monitoring

### 🎨 **Modern UI/UX**
- Consistent design system with Tailwind CSS
- Shadcn/ui components
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1 AA)

## 🚀 Quick Start

### Prerequisites
- Node.js v18.0.0+
- PostgreSQL v14.0+
- npm v8.0.0+

### Installation

```bash
# Clone the repository
git clone https://github.com/BollineniRohith123/Gharinto-Fullstack.git
cd Gharinto-Fullstack

# Install dependencies
npm install

# Setup database
createdb gharinto_platform
psql -d gharinto_platform -f database-migration.sql

# Configure environment
cp .env.example .env
# Edit DATABASE_URL and other configurations

# Start development server
npm run dev

# Open application
open http://localhost:5000
```

### Environment Configuration

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gharinto_platform"
SESSION_SECRET="your-super-secret-session-key-min-32-chars"
PORT=5000
NODE_ENV=development
```

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with 50+ endpoints
- **[Application Startup Guide](./APPLICATION_STARTUP_GUIDE.md)** - Detailed setup instructions
- **[CRM Architecture](./CRM_ARCHITECTURE.md)** - CRM integration strategy
- **[Implementation Summary](./FINAL_IMPLEMENTATION_SUMMARY.md)** - Complete feature overview

## 🏗 Architecture

### Frontend
- **React 19** with TypeScript
- **TanStack Query** for state management
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Session-based authentication**
- **Role-based authorization**
- **RESTful API design**

### Database
- **PostgreSQL** with optimized schema
- **Dynamic RBAC tables**
- **Audit trails and logging**
- **Performance indexes**

## 📊 Dashboard Features

### Super Admin Dashboard
- ✅ Global platform analytics
- ✅ Dynamic role management
- ✅ City management with real-time stats
- ✅ System health monitoring
- ✅ Commission configuration

### Admin Dashboard
- ✅ User approval management
- ✅ Lead assignment interface
- ✅ Testimonial management
- ✅ City-wise performance analytics
- ✅ Project oversight

### Designer Dashboard
- ✅ Lead marketplace access
- ✅ Project management tools
- ✅ Earnings and performance tracking
- ✅ Portfolio management
- ✅ Client communication

### Vendor Dashboard
- ✅ Product catalog management
- ✅ Inventory tracking with alerts
- ✅ Order management
- ✅ Financial dashboard
- ✅ Performance analytics

### Customer Dashboard
- ✅ Real-time project progress
- ✅ Digital document vault
- ✅ Communication center
- ✅ Payment tracking
- ✅ Support system

## 🔧 API Endpoints

### Authentication
- `GET /api/login` - Initiate login
- `GET /api/logout` - User logout
- `GET /api/user` - Current user info

### RBAC Management
- `GET/POST/PUT/DELETE /api/roles` - Role management
- `GET /api/permissions` - Permission management
- `PUT /api/roles/:roleId/permissions` - Assign permissions
- `GET /api/menu-items/:roleId` - Dynamic navigation

### Business Operations
- `GET/POST /api/projects` - Project management
- `GET/POST /api/leads` - Lead management
- `GET/POST /api/vendor/products` - Vendor self-service
- `GET/POST/PUT/DELETE /api/testimonials` - Content management

### Analytics
- `GET /api/analytics/dashboard-stats` - Platform metrics
- `GET /api/analytics/vendor-stats/:vendorId` - Vendor analytics
- `GET /api/analytics/designer-stats/:designerId` - Designer metrics

## 🎨 Design System

### Color Palette
- **Primary Green**: `#059669` (green-600)
- **Light Green**: `#dcfce7` (green-50)
- **Accent Black**: `#111827` (gray-900)
- **Background**: Gradients from green-50 to white

### Typography
- **Headers**: Bold, clear hierarchy
- **Body**: Readable, accessible text
- **CTAs**: Prominent, action-oriented

## 🔐 Security Features

- **Session-based authentication** with Replit OAuth
- **Role-based access control** with granular permissions
- **Input validation** and sanitization
- **SQL injection prevention** with parameterized queries
- **CSRF protection** and secure headers
- **Audit logging** for all critical operations

## 📱 Mobile Support

- **Mobile-first design** approach
- **Responsive layouts** for all screen sizes
- **Touch-friendly interfaces**
- **Progressive Web App** ready

## 🌍 Multi-City Operations

- **City-based data segregation**
- **Regional performance analytics**
- **Localized user management**
- **Scalable architecture** for expansion

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-host:5432/gharinto_prod"
SESSION_SECRET="production-secret-key"
```

### Health Checks
- `GET /api/health` - Application health
- Database connectivity monitoring
- Real-time system metrics

## 📈 Performance

- **Sub-500ms API responses**
- **Optimized database queries** with proper indexing
- **Efficient caching** with TanStack Query
- **Bundle optimization** with Vite
- **CDN-ready** static assets

## 🧪 Testing

### Manual Testing Checklist
- [ ] Homepage loads with green theme
- [ ] Authentication workflow
- [ ] Role-based access control
- [ ] CRUD operations
- [ ] Mobile responsiveness

### API Testing
```bash
# Test public endpoints
curl http://localhost:5000/api/testimonials
curl http://localhost:5000/api/product-categories

# Test protected endpoints (requires authentication)
curl http://localhost:5000/api/roles
```

## 🔮 Future Enhancements

### Phase 2 Features
- **Real-time chat** system
- **Advanced analytics** with ML
- **CRM integration** (LeadPro + Perfex)
- **Mobile applications** (iOS/Android)
- **Payment gateway** integration

### Scalability
- **Microservices** architecture
- **Container deployment** with Docker
- **Load balancing** and auto-scaling
- **Multi-region** support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- **Documentation**: See docs folder for detailed guides
- **Issues**: Create GitHub issue with error logs
- **Email**: support@gharinto.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- Built with modern web technologies
- Inspired by leading marketplace platforms
- Designed for Indian market requirements
- Focused on transparency and quality

---

**🎉 Transform your interior design business with Gharinto Platform!**

**Built with ❤️ for India's interior design industry**