import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all workout plans
router.get('/', (req, res) => {
  const { category, difficulty } = req.query;
  
  let query = 'SELECT * FROM workout_plans WHERE is_active = 1';
  const params = [];
  
  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (difficulty) {
    query += ' AND difficulty_level = ?';
    params.push(difficulty);
  }
  
  query += ' ORDER BY name';
  
  db.all(query, params, (err, workouts) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch workout plans' });
    }
    
    res.json(workouts);
  });
});

// Get workout plan by ID
router.get('/:workoutId', (req, res) => {
  const { workoutId } = req.params;
  
  db.get(`
    SELECT * FROM workout_plans 
    WHERE uuid = ? AND is_active = 1
  `, [workoutId], (err, workout) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }
    
    res.json(workout);
  });
});

// Get user's workout progress
router.get('/progress/my', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      uwp.*,
      wp.name as workout_name,
      wp.category,
      wp.difficulty_level
    FROM user_workout_progress uwp
    JOIN workout_plans wp ON uwp.workout_plan_id = wp.id
    WHERE uwp.user_id = ?
    ORDER BY uwp.completed_date DESC
  `;
  
  db.all(query, [req.user.id], (err, progress) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch workout progress' });
    }
    
    res.json(progress);
  });
});

// Log workout completion
router.post('/progress', authenticateToken, (req, res) => {
  const { workout_plan_id, duration_minutes, calories_burned, notes, rating } = req.body;
  
  if (!workout_plan_id) {
    return res.status(400).json({ error: 'Workout plan ID is required' });
  }
  
  // Get workout plan internal ID
  db.get('SELECT id FROM workout_plans WHERE uuid = ? AND is_active = 1', [workout_plan_id], (err, workout) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }
    
    const progressUuid = uuidv4();
    const completedDate = new Date().toISOString().split('T')[0];
    
    db.run(`
      INSERT INTO user_workout_progress 
      (uuid, user_id, workout_plan_id, completed_date, duration_minutes, calories_burned, notes, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [progressUuid, req.user.id, workout.id, completedDate, duration_minutes, calories_burned, notes, rating], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to log workout progress' });
      }
      
      res.status(201).json({
        message: 'Workout progress logged successfully',
        progress: {
          id: this.lastID,
          uuid: progressUuid,
          completed_date: completedDate
        }
      });
    });
  });
});

// Create workout plan (Admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const {
    name,
    category,
    description,
    duration_minutes,
    difficulty_level,
    calories_burned,
    exercises_count,
    image_url,
    instructions,
    equipment_needed
  } = req.body;
  
  if (!name || !category || !difficulty_level) {
    return res.status(400).json({ error: 'Name, category, and difficulty level are required' });
  }
  
  const workoutUuid = uuidv4();
  
  db.run(`
    INSERT INTO workout_plans (
      uuid, name, category, description, duration_minutes, difficulty_level,
      calories_burned, exercises_count, image_url, instructions, equipment_needed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    workoutUuid, name, category, description, duration_minutes, difficulty_level,
    calories_burned, exercises_count, image_url, instructions, equipment_needed
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create workout plan' });
    }
    
    res.status(201).json({
      message: 'Workout plan created successfully',
      workout: {
        id: this.lastID,
        uuid: workoutUuid,
        name
      }
    });
  });
});

// Update workout plan (Admin only)
router.put('/:workoutId', authenticateToken, requireAdmin, (req, res) => {
  const { workoutId } = req.params;
  const {
    name,
    category,
    description,
    duration_minutes,
    difficulty_level,
    calories_burned,
    exercises_count,
    image_url,
    instructions,
    equipment_needed
  } = req.body;
  
  db.run(`
    UPDATE workout_plans SET
      name = ?, category = ?, description = ?, duration_minutes = ?,
      difficulty_level = ?, calories_burned = ?, exercises_count = ?,
      image_url = ?, instructions = ?, equipment_needed = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [
    name, category, description, duration_minutes, difficulty_level,
    calories_burned, exercises_count, image_url, instructions, equipment_needed, workoutId
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update workout plan' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }
    
    res.json({ message: 'Workout plan updated successfully' });
  });
});

// Delete workout plan (Admin only)
router.delete('/:workoutId', authenticateToken, requireAdmin, (req, res) => {
  const { workoutId } = req.params;
  
  db.run(`
    UPDATE workout_plans SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [workoutId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete workout plan' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }
    
    res.json({ message: 'Workout plan deleted successfully' });
  });
});

// Get workout categories
router.get('/categories/all', (req, res) => {
  db.all(`
    SELECT DISTINCT category FROM workout_plans 
    WHERE is_active = 1 
    ORDER BY category
  `, (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    
    const categoryList = categories.map(c => c.category);
    res.json(categoryList);
  });
});

export default router;