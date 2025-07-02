import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// Get all classes with schedules
router.get('/', (req, res) => {
  const { date, type, instructor_id } = req.query;
  
  let query = `
    SELECT 
      c.*,
      i.first_name as instructor_first_name,
      i.last_name as instructor_last_name,
      i.specializations,
      COUNT(cs.id) as schedule_count
    FROM classes c
    LEFT JOIN instructors i ON c.instructor_id = i.id
    LEFT JOIN class_schedules cs ON c.id = cs.class_id
    WHERE c.is_active = 1
  `;
  
  const params = [];
  
  if (type) {
    query += ' AND c.type = ?';
    params.push(type);
  }
  
  if (instructor_id) {
    query += ' AND c.instructor_id = ?';
    params.push(instructor_id);
  }
  
  if (date) {
    query += ' AND cs.date = ?';
    params.push(date);
  }
  
  query += ' GROUP BY c.id ORDER BY c.name';
  
  db.all(query, params, (err, classes) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch classes' });
    }
    
    const formattedClasses = classes.map(cls => ({
      ...cls,
      instructor_name: `${cls.instructor_first_name} ${cls.instructor_last_name}`
    }));
    
    res.json(formattedClasses);
  });
});

// Get class by ID with schedules
router.get('/:classId', (req, res) => {
  const { classId } = req.params;
  
  const query = `
    SELECT 
      c.*,
      i.first_name as instructor_first_name,
      i.last_name as instructor_last_name,
      i.specializations,
      i.bio,
      i.experience_years
    FROM classes c
    LEFT JOIN instructors i ON c.instructor_id = i.id
    WHERE c.uuid = ? AND c.is_active = 1
  `;
  
  db.get(query, [classId], (err, class_) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!class_) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Get schedules for this class
    db.all(`
      SELECT * FROM class_schedules 
      WHERE class_id = ? AND date >= date('now') AND is_cancelled = 0
      ORDER BY date, start_time
    `, [class_.id], (err, schedules) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch schedules' });
      }
      
      const formattedClass = {
        ...class_,
        instructor_name: `${class_.instructor_first_name} ${class_.instructor_last_name}`,
        schedules
      };
      
      res.json(formattedClass);
    });
  });
});

// Get class schedules
router.get('/:classId/schedules', (req, res) => {
  const { classId } = req.params;
  const { date } = req.query;
  
  let query = `
    SELECT 
      cs.*,
      c.name as class_name,
      c.max_capacity,
      c.price
    FROM class_schedules cs
    JOIN classes c ON cs.class_id = c.id
    WHERE c.uuid = ? AND cs.is_cancelled = 0
  `;
  
  const params = [classId];
  
  if (date) {
    query += ' AND cs.date = ?';
    params.push(date);
  } else {
    query += ' AND cs.date >= date("now")';
  }
  
  query += ' ORDER BY cs.date, cs.start_time';
  
  db.all(query, params, (err, schedules) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch schedules' });
    }
    
    res.json(schedules);
  });
});

// Create new class (Admin only)
router.post('/', authenticateToken, requireAdmin, validateRequest(schemas.class), (req, res) => {
  const {
    name,
    type,
    description,
    instructor_id,
    duration_minutes,
    max_capacity,
    difficulty_level,
    location,
    price,
    image_url
  } = req.body;
  
  const classUuid = uuidv4();
  
  db.run(`
    INSERT INTO classes (
      uuid, name, type, description, instructor_id, duration_minutes,
      max_capacity, difficulty_level, location, price, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    classUuid, name, type, description, instructor_id, duration_minutes,
    max_capacity, difficulty_level, location, price, image_url
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create class' });
    }
    
    res.status(201).json({
      message: 'Class created successfully',
      class: {
        id: this.lastID,
        uuid: classUuid,
        name
      }
    });
  });
});

// Update class (Admin only)
router.put('/:classId', authenticateToken, requireAdmin, validateRequest(schemas.class), (req, res) => {
  const { classId } = req.params;
  const {
    name,
    type,
    description,
    instructor_id,
    duration_minutes,
    max_capacity,
    difficulty_level,
    location,
    price,
    image_url
  } = req.body;
  
  db.run(`
    UPDATE classes SET
      name = ?, type = ?, description = ?, instructor_id = ?,
      duration_minutes = ?, max_capacity = ?, difficulty_level = ?,
      location = ?, price = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [
    name, type, description, instructor_id, duration_minutes,
    max_capacity, difficulty_level, location, price, image_url, classId
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update class' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({ message: 'Class updated successfully' });
  });
});

// Delete class (Admin only)
router.delete('/:classId', authenticateToken, requireAdmin, (req, res) => {
  const { classId } = req.params;
  
  db.run(`
    UPDATE classes SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [classId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete class' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({ message: 'Class deleted successfully' });
  });
});

// Create class schedule (Admin only)
router.post('/:classId/schedules', authenticateToken, requireAdmin, validateRequest(schemas.schedule), (req, res) => {
  const { classId } = req.params;
  const { date, start_time, end_time } = req.body;
  
  // First get the class ID from UUID
  db.get('SELECT id FROM classes WHERE uuid = ? AND is_active = 1', [classId], (err, class_) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!class_) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    const scheduleUuid = uuidv4();
    
    db.run(`
      INSERT INTO class_schedules (uuid, class_id, date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `, [scheduleUuid, class_.id, date, start_time, end_time], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Schedule already exists for this time slot' });
        }
        return res.status(500).json({ error: 'Failed to create schedule' });
      }
      
      res.status(201).json({
        message: 'Schedule created successfully',
        schedule: {
          id: this.lastID,
          uuid: scheduleUuid,
          date,
          start_time,
          end_time
        }
      });
    });
  });
});

// Update class schedule (Admin only)
router.put('/schedules/:scheduleId', authenticateToken, requireAdmin, validateRequest(schemas.schedule), (req, res) => {
  const { scheduleId } = req.params;
  const { date, start_time, end_time } = req.body;
  
  db.run(`
    UPDATE class_schedules SET
      date = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `, [date, start_time, end_time, scheduleId], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Schedule already exists for this time slot' });
      }
      return res.status(500).json({ error: 'Failed to update schedule' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule updated successfully' });
  });
});

// Cancel class schedule (Admin only)
router.delete('/schedules/:scheduleId', authenticateToken, requireAdmin, (req, res) => {
  const { scheduleId } = req.params;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Cancel the schedule
    db.run(`
      UPDATE class_schedules SET is_cancelled = 1, updated_at = CURRENT_TIMESTAMP
      WHERE uuid = ?
    `, [scheduleId], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to cancel schedule' });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Schedule not found' });
      }
      
      // Get schedule ID for booking updates
      db.get('SELECT id FROM class_schedules WHERE uuid = ?', [scheduleId], (err, schedule) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Cancel all bookings for this schedule
        db.run(`
          UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
          WHERE schedule_id = ? AND status = 'confirmed'
        `, [schedule.id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to cancel bookings' });
          }
          
          db.run('COMMIT');
          res.json({ message: 'Schedule cancelled successfully' });
        });
      });
    });
  });
});

// Get instructors
router.get('/instructors/all', (req, res) => {
  db.all(`
    SELECT * FROM instructors 
    WHERE is_active = 1 
    ORDER BY first_name, last_name
  `, (err, instructors) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch instructors' });
    }
    
    res.json(instructors);
  });
});

// Get class types
router.get('/types/all', (req, res) => {
  db.all(`
    SELECT DISTINCT type FROM classes 
    WHERE is_active = 1 
    ORDER BY type
  `, (err, types) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch class types' });
    }
    
    const typeList = types.map(t => t.type);
    res.json(typeList);
  });
});

export default router;