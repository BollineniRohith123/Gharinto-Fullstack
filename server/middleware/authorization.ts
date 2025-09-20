import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email: string;
    };
  };
}

// Role hierarchy for permissions
const ROLE_HIERARCHY = {
  'super_admin': 5,
  'admin': 4,
  'employee': 3,
  'designer': 2,
  'vendor': 2,
  'customer': 1
};

// Check if user has required role or higher
function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0;
  return userLevel >= requiredLevel;
}

// Authorization middleware factory
export function authorize(requiredRole: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Get user from database to check role
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user account is approved
      if (!user.isApproved) {
        return res.status(403).json({ message: 'Account pending approval' });
      }

      // Check if user has required role
      if (!user.role || !hasRequiredRole(user.role, requiredRole)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: requiredRole,
          current: user.role || 'none'
        });
      }

      // Add user info to request for use in route handlers
      (req as any).currentUser = user;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
}

// Middleware to check resource ownership
export function authorizeResourceOwnership(getResourceUserId: (req: AuthenticatedRequest) => Promise<string | null>) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.claims?.sub;
      const currentUser = (req as any).currentUser;
      
      if (!currentUserId || !currentUser) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Super admins and admins can access any resource
      if (currentUser.role === 'super_admin' || currentUser.role === 'admin') {
        return next();
      }

      // Check if user owns the resource
      const resourceUserId = await getResourceUserId(req);
      
      if (resourceUserId && resourceUserId !== currentUserId) {
        return res.status(403).json({ message: 'Access denied: Resource not owned by user' });
      }

      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({ message: 'Resource ownership check failed' });
    }
  };
}

// Middleware to check city-based access (for admins managing specific cities)
export function authorizeCityAccess() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).currentUser;
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Super admins can access all cities
      if (currentUser.role === 'super_admin') {
        return next();
      }

      // For city-specific operations, check if admin has access to the city
      const cityId = req.params.cityId || req.query.cityId;
      
      if (cityId && currentUser.role === 'admin') {
        // In a full implementation, we'd check if this admin manages this city
        // For now, allowing all admins access to all cities
        return next();
      }

      next();
    } catch (error) {
      console.error('City access check error:', error);
      res.status(500).json({ message: 'City access check failed' });
    }
  };
}