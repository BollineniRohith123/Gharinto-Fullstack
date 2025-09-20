import { storage } from "../storage";
import { type InsertNotification } from "@shared/schema";

export class NotificationService {
  async createNotification(notification: InsertNotification): Promise<void> {
    try {
      await storage.createNotification(notification);
      
      // Here you could integrate with email service for important notifications
      if (notification.type === 'project_assigned' || notification.type === 'account_status') {
        // await this.sendEmailNotification(notification);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }

  async notifyProjectAssignment(designerId: string, projectTitle: string): Promise<void> {
    await this.createNotification({
      userId: designerId,
      title: 'New Project Assigned',
      message: `You have been assigned to project: ${projectTitle}`,
      type: 'project_assigned'
    });
  }

  async notifyLeadResponse(userId: string, response: 'accepted' | 'declined', projectTitle: string): Promise<void> {
    await this.createNotification({
      userId: userId,
      title: `Lead ${response}`,
      message: `Your lead for project "${projectTitle}" has been ${response}`,
      type: 'lead_response'
    });
  }

  async notifyOrderUpdate(userId: string, orderId: string, status: string): Promise<void> {
    await this.createNotification({
      userId: userId,
      title: 'Order Status Update',
      message: `Order ${orderId} status has been updated to: ${status}`,
      type: 'order_update'
    });
  }

  async notifyUserApproval(userId: string, isApproved: boolean): Promise<void> {
    await this.createNotification({
      userId: userId,
      title: isApproved ? 'Account Approved' : 'Account Rejected',
      message: isApproved 
        ? 'Your account has been approved. Welcome to Gharinto!'
        : 'Your account application requires additional review.',
      type: 'account_status'
    });
  }

  // Bulk notifications
  async notifyAllAdmins(title: string, message: string): Promise<void> {
    try {
      const admins = await storage.getUsersByRole('admin');
      const superAdmins = await storage.getUsersByRole('super_admin');
      
      const allAdmins = [...admins, ...superAdmins];
      
      for (const admin of allAdmins) {
        await this.createNotification({
          userId: admin.id,
          title,
          message,
          type: 'system_alert'
        });
      }
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  }

  async notifyVendorsInCity(cityId: string, title: string, message: string): Promise<void> {
    try {
      const vendors = await storage.getVendors(cityId);
      
      for (const vendor of vendors) {
        await this.createNotification({
          userId: vendor.userId,
          title,
          message,
          type: 'vendor_alert'
        });
      }
    } catch (error) {
      console.error("Error notifying vendors:", error);
    }
  }

  // Email integration placeholder
  private async sendEmailNotification(notification: InsertNotification): Promise<void> {
    // TODO: Integrate with SendGrid or other email service
    // This would send email notifications for critical updates
    console.log("Email notification would be sent:", notification);
  }
}

export const notificationService = new NotificationService();
