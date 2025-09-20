# Gharinto Platform - Complete Application Startup Guide

## 🚀 Quick Start Overview

This guide provides step-by-step instructions to start the Gharinto Platform without any errors. Follow these steps in order for a smooth setup.

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Git**: Latest version

### Environment Setup
1. **Check Node.js version:**
   ```bash
   node --version  # Should be v18+
   npm --version   # Should be v8+
   ```

2. **Install PostgreSQL:**
   - **macOS**: `brew install postgresql`
   - **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download from https://www.postgresql.org/download/

## 🛠 Step-by-Step Installation

### Step 1: Clone and Setup Repository
```bash
# Clone the repository
git clone <your-repo-url>
cd gharinto-platform

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 2: Database Setup

#### Create PostgreSQL Database
```bash
# Start PostgreSQL service
# macOS/Linux:
sudo service postgresql start
# or brew services start postgresql

# Create database
createdb gharinto_platform

# Create user (optional but recommended)
psql -c "CREATE USER gharinto_user WITH PASSWORD 'your_secure_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE gharinto_platform TO gharinto_user;"
```

#### Environment Configuration
Create `.env` file in root directory:
```env
# Database Configuration
DATABASE_URL="postgresql://gharinto_user:your_secure_password@localhost:5432/gharinto_platform"

# Session Configuration  
SESSION_SECRET="your-super-secret-session-key-min-32-chars"

# Replit OAuth (if using Replit hosting)
REPLIT_CLIENT_ID="your-replit-client-id"
REPLIT_CLIENT_SECRET="your-replit-client-secret"

# Application Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (optional)
SENDGRID_API_KEY="your-sendgrid-key"

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH="./uploads"
```

### Step 3: Database Migration
```bash
# Run the database migration
psql -d gharinto_platform -f database-migration.sql

# Verify tables were created
psql -d gharinto_platform -c "\dt"
```

Expected tables:
- `sessions`
- `users`
- `cities`
- `roles`
- `permissions`
- `role_permissions`
- `menu_items`
- `testimonials`
- `projects`
- `leads`
- `vendors`
- `products`
- `orders`
- `notifications`
- And more...

### Step 4: Verify Database Schema
```bash
# Check if sample data was inserted
psql -d gharinto_platform -c "SELECT name, display_name FROM roles;"
psql -d gharinto_platform -c "SELECT name FROM cities;"
psql -d gharinto_platform -c "SELECT client_name FROM testimonials;"
```

### Step 5: Build and Start Application

#### Development Mode
```bash
# Start in development mode with hot reload
npm run dev

# Application should start on http://localhost:5000
```

#### Production Mode
```bash
# Build the application
npm run build

# Start in production mode
npm start
```

### Step 6: Verify Installation

#### Check Application Health
1. **Open browser**: Go to `http://localhost:5000`
2. **Homepage should load**: Verify pale green theme and forms work
3. **Login functionality**: Click "Sign In" - should redirect to auth
4. **Database connectivity**: Check browser console for errors

#### Test API Endpoints
```bash
# Test public endpoints
curl http://localhost:5000/api/testimonials
curl http://localhost:5000/api/product-categories

# Should return JSON responses
```

## 🔧 Troubleshooting Common Issues

### Database Connection Issues

**Error**: `database "gharinto_platform" does not exist`
```bash
# Solution: Create the database
createdb gharinto_platform
```

**Error**: `password authentication failed`
```bash
# Solution: Reset PostgreSQL password
sudo -u postgres psql
ALTER USER postgres PASSWORD 'newpassword';
\q

# Update DATABASE_URL in .env
```

**Error**: `relation "users" does not exist`
```bash
# Solution: Run migration again
psql -d gharinto_platform -f database-migration.sql
```

### Node.js Issues

**Error**: `Cannot find module '@shared/schema'`
```bash
# Solution: Ensure TypeScript paths are configured
npm run check  # Type check
```

**Error**: `Port 5000 already in use`
```bash
# Solution: Kill existing process or change port
lsof -ti:5000 | xargs kill -9
# or change PORT in .env file
```

### Build Issues

**Error**: `drizzle-kit push failed`
```bash
# Solution: Ensure database is running
sudo service postgresql status
# Restart if needed
sudo service postgresql restart
```

**Error**: `TypeScript compilation errors`
```bash
# Solution: Check and fix TypeScript errors
npm run check
```

### Runtime Issues

**Error**: `Session store not found`
```bash
# Solution: Ensure sessions table exists
psql -d gharinto_platform -c "SELECT * FROM sessions LIMIT 1;"
```

**Error**: `Authentication failed`
```bash
# Solution: Check Replit OAuth configuration
# Verify REPLIT_CLIENT_ID and REPLIT_CLIENT_SECRET in .env
```

## 🧪 Testing the Application

### Manual Testing Checklist

#### Frontend Testing
- [ ] Homepage loads with green theme
- [ ] "Get Free Quote" form works
- [ ] "Become a Partner" form works
- [ ] Navigation is responsive
- [ ] No console errors

#### Authentication Testing
- [ ] Login redirect works
- [ ] Session persistence works
- [ ] Role-based access works
- [ ] Logout functionality works

#### API Testing
- [ ] Public endpoints accessible
- [ ] Protected endpoints require auth
- [ ] CRUD operations work
- [ ] Error handling works

#### Database Testing
- [ ] All tables exist
- [ ] Sample data inserted
- [ ] Relationships work
- [ ] Queries execute properly

### Automated Testing
```bash
# Run type checking
npm run check

# Run database push (dry run)
npm run db:push

# Test API endpoints
curl -X GET http://localhost:5000/api/testimonials
curl -X GET http://localhost:5000/api/cities
```

## 📊 Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
```

### Application Optimization
1. **Enable gzip compression**
2. **Configure caching headers**
3. **Optimize bundle size**
4. **Use connection pooling**

## 🚀 Deployment Preparation

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-host:5432/gharinto_prod"
SESSION_SECRET="super-secure-production-secret"
```

### Build for Production
```bash
# Clean build
rm -rf dist/
npm run build

# Verify build
ls -la dist/
```

### Health Check Endpoints
```bash
# Add to your monitoring
GET /api/health
GET /api/version
```

## 📱 Mobile Responsiveness Testing

Test on different screen sizes:
- **Desktop**: 1920x1080, 1366x768
- **Tablet**: 768x1024, 1024x768
- **Mobile**: 375x667, 414x896

## 🔒 Security Configuration

### Essential Security Settings
1. **HTTPS only in production**
2. **Secure session cookies**
3. **CSRF protection**
4. **Rate limiting**
5. **Input validation**

### Security Headers
```javascript
// Add to your Express app
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

## 📈 Monitoring and Logging

### Application Logs
```bash
# Check application logs
tail -f logs/application.log

# Database logs
tail -f /var/log/postgresql/postgresql-*.log
```

### Performance Monitoring
1. **Database query performance**
2. **API response times**
3. **Memory usage**
4. **CPU utilization**

## 🆘 Getting Help

### Log Files Location
- **Application logs**: `./logs/`
- **Database logs**: Check PostgreSQL log directory
- **Error logs**: Browser console and server logs

### Common Commands
```bash
# Restart application
npm run dev

# Reset database
dropdb gharinto_platform && createdb gharinto_platform
psql -d gharinto_platform -f database-migration.sql

# Check application status
curl http://localhost:5000/api/health

# View database connections
psql -d gharinto_platform -c "SELECT * FROM pg_stat_activity;"
```

### Support Resources
- **GitHub Issues**: Create issue with error logs
- **Documentation**: API_DOCUMENTATION.md
- **Database Schema**: shared/schema.ts

## ✅ Final Verification

Your application is ready when:
- [ ] Database is connected and migrated
- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] No console errors
- [ ] Sample data is visible

**🎉 Congratulations! Your Gharinto Platform is now running successfully!**