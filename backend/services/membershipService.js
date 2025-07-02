import { db } from '../database/init.js';
import { sendEmail } from './emailService.js';

export class MembershipService {
  static async checkMembershipExpiry() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM users 
        WHERE membership_end_date <= date('now', '+7 days') 
        AND is_active = 1
      `;
      
      db.all(query, [], (err, users) => {
        if (err) {
          reject(err);
          return;
        }
        
        users.forEach(user => {
          const daysLeft = Math.ceil(
            (new Date(user.membership_end_date) - new Date()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysLeft <= 0) {
            this.suspendMembership(user.id);
          } else if (daysLeft <= 7) {
            this.sendRenewalReminder(user);
          }
        });
        
        resolve(users);
      });
    });
  }
  
  static async suspendMembership(userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET is_active = 0 WHERE id = ?',
        [userId],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes);
        }
      );
    });
  }
  
  static async sendRenewalReminder(user) {
    const emailContent = `
      <h2>Membership Renewal Reminder</h2>
      <p>Hi ${user.first_name},</p>
      <p>Your ${user.membership_type} membership expires on ${user.membership_end_date}.</p>
      <p>Renew now to continue enjoying all FitLife benefits!</p>
      <a href="${process.env.FRONTEND_URL}/membership" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Renew Membership</a>
    `;
    
    await sendEmail(user.email, 'Membership Renewal Reminder', emailContent);
  }
  
  static async upgradeMembership(userId, newPlan) {
    return new Promise((resolve, reject) => {
      const prices = { basic: 29, premium: 59, vip: 99 };
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      
      db.run(`
        UPDATE users 
        SET membership_type = ?, membership_end_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newPlan, newEndDate.toISOString(), userId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ plan: newPlan, price: prices[newPlan], endDate: newEndDate });
      });
    });
  }
}