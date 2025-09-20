import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";

// Mock user data for testing
const mockUsers = {
  'super_admin': {
    id: 'mock-super-admin-id',
    email: 'superadmin@gharinto.com',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    cityId: 'mock-city-id',
    isApproved: true,
    profileImageUrl: null
  },
  'admin': {
    id: 'mock-admin-id',
    email: 'admin@gharinto.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    cityId: 'mock-city-id',
    isApproved: true,
    profileImageUrl: null
  },
  'designer': {
    id: 'mock-designer-id',
    email: 'designer@gharinto.com',
    firstName: 'Design',
    lastName: 'Professional',
    role: 'designer',
    cityId: 'mock-city-id',
    isApproved: true,
    profileImageUrl: null
  },
  'customer': {
    id: 'mock-customer-id',
    email: 'customer@gharinto.com',
    firstName: 'Happy',
    lastName: 'Customer',
    role: 'customer',
    cityId: 'mock-city-id',
    isApproved: true,
    profileImageUrl: null
  },
  'vendor': {
    id: 'mock-vendor-id',
    email: 'vendor@gharinto.com',
    firstName: 'Vendor',
    lastName: 'Partner',
    role: 'vendor',
    cityId: 'mock-city-id',
    isApproved: true,
    profileImageUrl: null
  }
};

export async function setupMockAuth(app: Express): Promise<void> {
  // Setup session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'mock-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Mock authentication endpoints
  app.get('/auth/login', (req: Request, res: Response) => {
    res.send(`
      <html>
        <head><title>Mock Login - Gharinto Platform</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
          <h2>Mock Authentication - Choose Your Role</h2>
          <p>This is a demo version. Choose a role to login:</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a href="/auth/mock-login/super_admin" style="padding: 10px; background: #059669; color: white; text-decoration: none; border-radius: 5px; text-align: center;">🔧 Super Admin</a>
            <a href="/auth/mock-login/admin" style="padding: 10px; background: #0891b2; color: white; text-decoration: none; border-radius: 5px; text-align: center;">⚙️ Admin</a>
            <a href="/auth/mock-login/designer" style="padding: 10px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px; text-align: center;">🎨 Designer</a>
            <a href="/auth/mock-login/customer" style="padding: 10px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; text-align: center;">🏠 Customer</a>
            <a href="/auth/mock-login/vendor" style="padding: 10px; background: #ea580c; color: white; text-decoration: none; border-radius: 5px; text-align: center;">📦 Vendor</a>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            Demo Mode: This bypasses real authentication for testing purposes.
          </p>
        </body>
      </html>
    `);
  });

  // Mock login handler
  app.get('/auth/mock-login/:role', (req: Request & { session: any }, res: Response) => {
    const role = req.params.role as keyof typeof mockUsers;
    const user = mockUsers[role];
    
    if (!user) {
      return res.status(400).send('Invalid role');
    }

    // Set session
    req.session.user = {
      claims: {
        sub: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      },
      ...user
    };

    // Redirect to dashboard
    res.redirect('/');
  });

  // Mock logout
  app.get('/auth/logout', (req: Request & { session: any }, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.redirect('/');
    });
  });
}

// Mock authentication middleware
export function isAuthenticated(req: Request & { user?: any, session?: any }, res: Response, next: NextFunction) {
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }
  
  // For API calls, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // For web requests, redirect to login
  res.redirect('/auth/login');
}