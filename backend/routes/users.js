import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  db.get(`
    SELECT id, uuid, email, first_name, last_name, phone, membership_type,
           membership_start_date, membership_end_date, is_active, created_at
    FROM users WHERE id = ?
  `, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  });
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const { first_name, last_name, phone } = req.body;
  
  db.run(`
    UPDATE users SET 
      first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [first_name, last_name, phone, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    res.json({ message: 'Profile updated successfully' });
  });
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  const { current_password, new_password } = req.body;
  
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }
  
  try {
    // Get current user
    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(current_password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      
      // Update password
      db.run(`
        UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [hashedNewPassword, req.user.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update password' });
        }
        
        res.json({ message: 'Password updated successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT id, uuid, email, first_name, last_name, phone, membership_type,
           membership_start_date, membership_end_date, is_active, created_at
    FROM users
  `;
  
  const params = [];
  
  if (search) {
    query += ` WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const countParams = [];
    
    if (search) {
      countQuery += ` WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get user count' });
      }
      
      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Update user membership (Admin only)
router.put('/:userId/membership', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params;
  const { membership_type, membership_end_date } = req.body;
  
  db.run(`
    UPDATE users SET 
      membership_type = ?, membership_end_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [membership_type, membership_end_date, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update membership' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Membership updated successfully' });
  });
});

// Deactivate user (Admin only)
router.put('/:userId/deactivate', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params;
  
  db.run(`
    UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to deactivate user' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deactivated successfully' });
  });
});

// Reactivate user (Admin only)
router.put('/:userId/activate', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params;
  
  db.run(`
    UPDATE users SET is_active = 1, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to activate user' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User activated successfully' });
  });
});

export default router;