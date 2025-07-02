import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all diet plans
router.get('/', (req, res) => {
  const { goal } = req.query;
  
  let query = 'SELECT * FROM diet_plans WHERE is_active = 1';
  const params = [];
  
  if (goal && goal !== 'all') {
    query += ' AND goal = ?';
    params.push(goal);
  }
  
  query += ' ORDER BY title';
  
  db.all(query, params, (err, dietPlans) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch diet plans' });
    }
    
    res.json(dietPlans);
  });
});

// Get diet plan by ID
router.get('/:dietId', (req, res) => {
  const { dietId } = req.params;
  
  db.get(`
    SELECT * FROM diet_plans 
    WHERE uuid = ? AND is_active = 1
  `, [dietId], (err, dietPlan) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!dietPlan) {
      return res.status(404).json({ error: 'Diet plan not found' });
    }
    
    res.json(dietPlan);
  });
});

// Get user's diet progress
router.get('/progress/my', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      udp.*,
      dp.title as diet_title,
      dp.goal,
      dp.duration_weeks
    FROM user_diet_progress udp
    JOIN diet_plans dp ON udp.diet_plan_id = dp.id
    WHERE udp.user_id = ?
    ORDER BY udp.start_date DESC
  `;
  
  db.all(query, [req.user.id], (err, progress) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch diet progress' });
    }
    
    res.json(progress);
  });
});

// Start diet plan
router.post('/progress', authenticateToken, (req, res) => {
  const { diet_plan_id, weight_start, notes } = req.body;
  
  if (!diet_plan_id) {
    return res.status(400).json({ error: 'Diet plan ID is required' });
  }
  
  // Get diet plan internal ID
  db.get('SELECT id FROM diet_plans WHERE uuid = ? AND is_active = 1', [diet_plan_id], (err, dietPlan) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!dietPlan) {
      return res.status(404).json({ error: 'Diet plan not found' });
    }
    
    // Check if user already has an active diet plan
    db.get(`
      SELECT id FROM user_diet_progress 
      WHERE user_id = ? AND diet_plan_id = ? AND is_active = 1
    `, [req.user.id, dietPlan.id], (err, existingProgress) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingProgress) {
        return res.status(400).json({ error: 'You already have an active progress for this diet plan' });
      }
      
      const progressUuid = uuidv4();
      const startDate = new Date().toISOString().split('T')[0];
      
      db.run(`
        INSERT INTO user_diet_progress 
        (uuid, user_id, diet_plan_id, start_date, weight_start, weight_current, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [progressUuid, req.user.id, dietPlan.id, startDate, weight_start, weight_start, notes], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to start diet plan' });
        }
        
        res.status(201).json({
          message: 'Diet plan started successfully',
          progress: {
            id: this.lastID,
            uuid: progressUuid,
            start_date: startDate
          }
        });
      });
    });
  });
});

// Update diet progress
router.put('/progress/:progressId', authenticateToken, (req, res) => {
  const { progressId } = req.params;
  const { current_week, weight_current, notes } = req.body;
  
  db.run(`
    UPDATE user_diet_progress SET
      current_week = ?, weight_current = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ? AND user_id = ?
  `, [current_week, weight_current, notes, progressId, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update diet progress' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Diet progress not found' });
    }
    
    res.json({ message: 'Diet progress updated successfully' });
  });
});

// Complete diet plan
router.put('/progress/:progressId/complete', authenticateToken, (req, res) => {
  const { progressId } = req.params;
  
  db.run(`
    UPDATE user_diet_progress SET
      is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ? AND user_id = ?
  `, [progressId, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to complete diet plan' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Diet progress not found' });
    }
    
    res.json({ message: 'Diet plan completed successfully' });
  });
});

// Create diet plan (Admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const {
    title,
    goal,
    description,
    duration_weeks,
    daily_calories,
    meals_per_day,
    carbs_percentage,
    protein_percentage,
    fat_percentage,
    image_url,
    meal_plan,
    shopping_list
  } = req.body;
  
  if (!title || !goal) {
    return res.status(400).json({ error: 'Title and goal are required' });
  }
  
  const dietUuid = uuidv4();
  
  db.run(`
    INSERT INTO diet_plans (
      uuid, title, goal, description, duration_weeks, daily_calories,
      meals_per_day, carbs_percentage, protein_percentage, fat_percentage,
      image_url, meal_plan, shopping_list
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    dietUuid, title, goal, description, duration_weeks, daily_calories,
    meals_per_day, carbs_percentage, protein_percentage, fat_percentage,
    image_url, meal_plan, shopping_list
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create diet plan' });
    }
    
    res.status(201).json({
      message: 'Diet plan created successfully',
      diet: {
        id: this.lastID,
        uuid: dietUuid,
        title
      }
    });
  });
});

// Update diet plan (Admin only)
router.put('/:dietId', authenticateToken, requireAdmin, (req, res) => {
  const { dietId } = req.params;
  const {
    title,
    goal,
    description,
    duration_weeks,
    daily_calories,
    meals_per_day,
    carbs_percentage,
    protein_percentage,
    fat_percentage,
    image_url,
    meal_plan,
    shopping_list
  } = req.body;
  
  db.run(`
    UPDATE diet_plans SET
      title = ?, goal = ?, description = ?, duration_weeks = ?,
      daily_calories = ?, meals_per_day = ?, carbs_percentage = ?,
      protein_percentage = ?, fat_percentage = ?, image_url = ?,
      meal_plan = ?, shopping_list = ?, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [
    title, goal, description, duration_weeks, daily_calories,
    meals_per_day, carbs_percentage, protein_percentage, fat_percentage,
    image_url, meal_plan, shopping_list, dietId
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update diet plan' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Diet plan not found' });
    }
    
    res.json({ message: 'Diet plan updated successfully' });
  });
});

// Delete diet plan (Admin only)
router.delete('/:dietId', authenticateToken, requireAdmin, (req, res) => {
  const { dietId } = req.params;
  
  db.run(`
    UPDATE diet_plans SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [dietId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete diet plan' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Diet plan not found' });
    }
    
    res.json({ message: 'Diet plan deleted successfully' });
  });
});

// Get diet goals
router.get('/goals/all', (req, res) => {
  db.all(`
    SELECT DISTINCT goal FROM diet_plans 
    WHERE is_active = 1 
    ORDER BY goal
  `, (err, goals) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch goals' });
    }
    
    const goalList = goals.map(g => g.goal);
    res.json(goalList);
  });
});

export default router;