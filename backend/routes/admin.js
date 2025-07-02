import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, (req, res) => {
  const stats = {};
  
  // Get total members
  db.get('SELECT COUNT(*) as total FROM users WHERE is_active = 1', (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch member count' });
    }
    stats.totalMembers = result.total;
    
    // Get today's bookings
    db.get(`
      SELECT COUNT(*) as total FROM bookings b
      JOIN class_schedules cs ON b.schedule_id = cs.id
      WHERE cs.date = date('now') AND b.status = 'confirmed'
    `, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch booking count' });
      }
      stats.todayBookings = result.total;
      
      // Get active workout plans
      db.get('SELECT COUNT(*) as total FROM workout_plans WHERE is_active = 1', (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch workout count' });
        }
        stats.activeWorkouts = result.total;
        
        // Get active diet plans
        db.get('SELECT COUNT(*) as total FROM diet_plans WHERE is_active = 1', (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch diet count' });
          }
          stats.activeDietPlans = result.total;
          
          // Get recent activities
          db.all(`
            SELECT 
              'booking' as type,
              u.first_name || ' ' || u.last_name as user_name,
              c.name as activity_name,
              b.created_at
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN class_schedules cs ON b.schedule_id = cs.id
            JOIN classes c ON cs.class_id = c.id
            WHERE b.status = 'confirmed'
            ORDER BY b.created_at DESC
            LIMIT 10
          `, (err, activities) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch activities' });
            }
            
            stats.recentActivities = activities;
            res.json(stats);
          });
        });
      });
    });
  });
});

// Get revenue statistics
router.get('/revenue', authenticateToken, requireAdmin, (req, res) => {
  const { period = 'month' } = req.query;
  
  let dateFilter = '';
  switch (period) {
    case 'week':
      dateFilter = "AND cs.date >= date('now', '-7 days')";
      break;
    case 'month':
      dateFilter = "AND cs.date >= date('now', '-30 days')";
      break;
    case 'year':
      dateFilter = "AND cs.date >= date('now', '-365 days')";
      break;
    default:
      dateFilter = "AND cs.date >= date('now', '-30 days')";
  }
  
  db.get(`
    SELECT 
      COUNT(b.id) as total_bookings,
      SUM(c.price) as total_revenue,
      AVG(c.price) as avg_booking_value
    FROM bookings b
    JOIN class_schedules cs ON b.schedule_id = cs.id
    JOIN classes c ON cs.class_id = c.id
    WHERE b.status = 'confirmed' AND b.payment_status = 'paid'
    ${dateFilter}
  `, (err, revenue) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch revenue data' });
    }
    
    res.json({
      totalBookings: revenue.total_bookings || 0,
      totalRevenue: revenue.total_revenue || 0,
      avgBookingValue: revenue.avg_booking_value || 0
    });
  });
});

// Get popular classes
router.get('/popular-classes', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT 
      c.name,
      c.type,
      COUNT(b.id) as booking_count,
      i.first_name || ' ' || i.last_name as instructor_name
    FROM classes c
    LEFT JOIN class_schedules cs ON c.id = cs.class_id
    LEFT JOIN bookings b ON cs.id = b.schedule_id AND b.status = 'confirmed'
    LEFT JOIN instructors i ON c.instructor_id = i.id
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY booking_count DESC
    LIMIT 10
  `, (err, classes) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch popular classes' });
    }
    
    res.json(classes);
  });
});

// Get membership statistics
router.get('/membership-stats', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT 
      membership_type,
      COUNT(*) as count
    FROM users 
    WHERE is_active = 1
    GROUP BY membership_type
  `, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch membership stats' });
    }
    
    res.json(stats);
  });
});

// Get instructor performance
router.get('/instructor-performance', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT 
      i.first_name || ' ' || i.last_name as instructor_name,
      i.specializations,
      COUNT(DISTINCT c.id) as classes_count,
      COUNT(b.id) as total_bookings,
      AVG(CASE WHEN b.status = 'completed' THEN 5 ELSE 0 END) as avg_rating
    FROM instructors i
    LEFT JOIN classes c ON i.id = c.instructor_id AND c.is_active = 1
    LEFT JOIN class_schedules cs ON c.id = cs.class_id
    LEFT JOIN bookings b ON cs.id = b.schedule_id AND b.status IN ('confirmed', 'completed')
    WHERE i.is_active = 1
    GROUP BY i.id
    ORDER BY total_bookings DESC
  `, (err, performance) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch instructor performance' });
    }
    
    res.json(performance);
  });
});

// Get booking trends
router.get('/booking-trends', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT 
      date(cs.date) as booking_date,
      COUNT(b.id) as bookings_count
    FROM bookings b
    JOIN class_schedules cs ON b.schedule_id = cs.id
    WHERE b.status = 'confirmed' 
    AND cs.date >= date('now', '-30 days')
    GROUP BY date(cs.date)
    ORDER BY booking_date
  `, (err, trends) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch booking trends' });
    }
    
    res.json(trends);
  });
});

// Export data (CSV format)
router.get('/export/:type', authenticateToken, requireAdmin, (req, res) => {
  const { type } = req.params;
  
  let query = '';
  let filename = '';
  
  switch (type) {
    case 'users':
      query = `
        SELECT 
          email, first_name, last_name, phone, membership_type,
          membership_start_date, membership_end_date, created_at
        FROM users WHERE is_active = 1
        ORDER BY created_at DESC
      `;
      filename = 'users_export.csv';
      break;
      
    case 'bookings':
      query = `
        SELECT 
          u.email, u.first_name, u.last_name,
          c.name as class_name, cs.date, cs.start_time,
          b.status, b.payment_status, b.created_at
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN class_schedules cs ON b.schedule_id = cs.id
        JOIN classes c ON cs.class_id = c.id
        ORDER BY b.created_at DESC
      `;
      filename = 'bookings_export.csv';
      break;
      
    default:
      return res.status(400).json({ error: 'Invalid export type' });
  }
  
  db.all(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to export data' });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }
    
    // Convert to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  });
});

export default router;