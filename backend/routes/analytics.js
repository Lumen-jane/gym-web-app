import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user fitness analytics
router.get('/fitness-progress', authenticateToken, (req, res) => {
  const { timeframe = '30' } = req.query;
  
  const workoutQuery = `
    SELECT 
      DATE(completed_date) as date,
      COUNT(*) as workouts_completed,
      SUM(calories_burned) as total_calories,
      AVG(duration_minutes) as avg_duration
    FROM user_workout_progress 
    WHERE user_id = ? 
    AND completed_date >= date('now', '-${timeframe} days')
    GROUP BY DATE(completed_date)
    ORDER BY date DESC
  `;
  
  db.all(workoutQuery, [req.user.id], (err, workoutData) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch workout analytics' });
    }
    
    // Get diet progress
    const dietQuery = `
      SELECT 
        current_week,
        weight_current,
        weight_start,
        updated_at
      FROM user_diet_progress 
      WHERE user_id = ? AND is_active = 1
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    
    db.get(dietQuery, [req.user.id], (err, dietData) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch diet analytics' });
      }
      
      // Calculate streaks and achievements
      const streakQuery = `
        SELECT COUNT(*) as current_streak
        FROM (
          SELECT completed_date,
                 ROW_NUMBER() OVER (ORDER BY completed_date DESC) as rn,
                 DATE(completed_date, '+' || (ROW_NUMBER() OVER (ORDER BY completed_date DESC) - 1) || ' days') as expected_date
          FROM user_workout_progress 
          WHERE user_id = ?
          ORDER BY completed_date DESC
        ) 
        WHERE completed_date = expected_date
      `;
      
      db.get(streakQuery, [req.user.id], (err, streakData) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to calculate streak' });
        }
        
        const analytics = {
          workoutProgress: workoutData,
          dietProgress: dietData,
          currentStreak: streakData?.current_streak || 0,
          totalWorkouts: workoutData.reduce((sum, day) => sum + day.workouts_completed, 0),
          totalCaloriesBurned: workoutData.reduce((sum, day) => sum + (day.total_calories || 0), 0),
          weightLoss: dietData ? (dietData.weight_start - dietData.weight_current) : 0
        };
        
        res.json(analytics);
      });
    });
  });
});

// Get gym usage statistics
router.get('/gym-usage', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      c.type as class_type,
      COUNT(b.id) as bookings_count,
      AVG(CASE WHEN b.status = 'completed' THEN 5 ELSE 0 END) as avg_satisfaction
    FROM bookings b
    JOIN class_schedules cs ON b.schedule_id = cs.id
    JOIN classes c ON cs.class_id = c.id
    WHERE b.user_id = ?
    GROUP BY c.type
    ORDER BY bookings_count DESC
  `;
  
  db.all(query, [req.user.id], (err, usage) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }
    
    res.json(usage);
  });
});

// Get achievement progress
router.get('/achievements', authenticateToken, (req, res) => {
  const achievements = [
    {
      id: 'first_workout',
      title: 'First Steps',
      description: 'Complete your first workout',
      icon: '🏃‍♂️',
      target: 1,
      category: 'workout'
    },
    {
      id: 'workout_streak_7',
      title: 'Week Warrior',
      description: 'Workout for 7 consecutive days',
      icon: '🔥',
      target: 7,
      category: 'streak'
    },
    {
      id: 'calories_1000',
      title: 'Calorie Crusher',
      description: 'Burn 1000 calories in total',
      icon: '⚡',
      target: 1000,
      category: 'calories'
    },
    {
      id: 'weight_loss_5',
      title: 'Transformation',
      description: 'Lose 5 pounds',
      icon: '🎯',
      target: 5,
      category: 'weight'
    }
  ];
  
  // Get user's current progress for each achievement
  const progressQuery = `
    SELECT 
      COUNT(DISTINCT completed_date) as total_workouts,
      SUM(calories_burned) as total_calories,
      MAX(
        SELECT current_streak FROM (
          SELECT COUNT(*) as current_streak
          FROM (
            SELECT completed_date,
                   ROW_NUMBER() OVER (ORDER BY completed_date DESC) as rn,
                   DATE(completed_date, '+' || (ROW_NUMBER() OVER (ORDER BY completed_date DESC) - 1) || ' days') as expected_date
            FROM user_workout_progress 
            WHERE user_id = ?
            ORDER BY completed_date DESC
          ) 
          WHERE completed_date = expected_date
        )
      ) as current_streak
    FROM user_workout_progress 
    WHERE user_id = ?
  `;
  
  db.get(progressQuery, [req.user.id, req.user.id], (err, progress) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch achievement progress' });
    }
    
    // Get weight loss progress
    const weightQuery = `
      SELECT (weight_start - weight_current) as weight_lost
      FROM user_diet_progress 
      WHERE user_id = ? AND is_active = 1
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    
    db.get(weightQuery, [req.user.id], (err, weightData) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch weight progress' });
      }
      
      const userProgress = {
        total_workouts: progress?.total_workouts || 0,
        total_calories: progress?.total_calories || 0,
        current_streak: progress?.current_streak || 0,
        weight_lost: weightData?.weight_lost || 0
      };
      
      const achievementsWithProgress = achievements.map(achievement => {
        let currentProgress = 0;
        
        switch (achievement.category) {
          case 'workout':
            currentProgress = userProgress.total_workouts;
            break;
          case 'calories':
            currentProgress = userProgress.total_calories;
            break;
          case 'streak':
            currentProgress = userProgress.current_streak;
            break;
          case 'weight':
            currentProgress = userProgress.weight_lost;
            break;
        }
        
        return {
          ...achievement,
          currentProgress,
          completed: currentProgress >= achievement.target,
          progressPercentage: Math.min((currentProgress / achievement.target) * 100, 100)
        };
      });
      
      res.json(achievementsWithProgress);
    });
  });
});

export default router;