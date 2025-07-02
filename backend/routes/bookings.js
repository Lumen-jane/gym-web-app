import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// Get user's bookings
router.get('/my-bookings', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      b.*,
      c.name as class_name,
      c.type as class_type,
      cs.date,
      cs.start_time,
      cs.end_time,
      i.first_name as instructor_first_name,
      i.last_name as instructor_last_name,
      c.location
    FROM bookings b
    JOIN class_schedules cs ON b.schedule_id = cs.id
    JOIN classes c ON cs.class_id = c.id
    JOIN instructors i ON c.instructor_id = i.id
    WHERE b.user_id = ?
    ORDER BY cs.date DESC, cs.start_time DESC
  `;

  db.all(query, [req.user.id], (err, bookings) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    const formattedBookings = bookings.map(booking => ({
      ...booking,
      instructor_name: `${booking.instructor_first_name} ${booking.instructor_last_name}`
    }));

    res.json(formattedBookings);
  });
});

// Create new booking
router.post('/', authenticateToken, validateRequest(schemas.booking), (req, res) => {
  const { schedule_id, notes } = req.body;
  const user_id = req.user.id;

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Check if schedule exists and has capacity
    db.get(`
      SELECT 
        cs.*,
        c.max_capacity,
        c.name as class_name
      FROM class_schedules cs
      JOIN classes c ON cs.class_id = c.id
      WHERE cs.id = ? AND cs.is_cancelled = 0 AND cs.date >= date('now')
    `, [schedule_id], (err, schedule) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      if (!schedule) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Schedule not found or class is in the past' });
      }

      if (schedule.current_bookings >= schedule.max_capacity) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Class is fully booked' });
      }

      // Check if user already booked this class
      db.get('SELECT id FROM bookings WHERE user_id = ? AND schedule_id = ?', [user_id, schedule_id], (err, existingBooking) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingBooking) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'You have already booked this class' });
        }

        // Create booking
        const bookingUuid = uuidv4();
        db.run(`
          INSERT INTO bookings (uuid, user_id, schedule_id, notes)
          VALUES (?, ?, ?, ?)
        `, [bookingUuid, user_id, schedule_id, notes], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to create booking' });
          }

          // Update current bookings count
          db.run(`
            UPDATE class_schedules 
            SET current_bookings = current_bookings + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [schedule_id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update booking count' });
            }

            db.run('COMMIT');
            res.status(201).json({
              message: 'Booking created successfully',
              booking: {
                id: this.lastID,
                uuid: bookingUuid,
                class_name: schedule.class_name,
                date: schedule.date,
                start_time: schedule.start_time
              }
            });
          });
        });
      });
    });
  });
});

// Cancel booking
router.delete('/:bookingId', authenticateToken, (req, res) => {
  const { bookingId } = req.params;
  const user_id = req.user.id;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Get booking details
    db.get(`
      SELECT b.*, cs.date, cs.start_time
      FROM bookings b
      JOIN class_schedules cs ON b.schedule_id = cs.id
      WHERE b.uuid = ? AND b.user_id = ? AND b.status = 'confirmed'
    `, [bookingId, user_id], (err, booking) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      if (!booking) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Booking not found or already cancelled' });
      }

      // Check if cancellation is allowed (e.g., at least 2 hours before class)
      const classDateTime = new Date(`${booking.date}T${booking.start_time}`);
      const now = new Date();
      const timeDiff = classDateTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      if (hoursDiff < 2) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Cannot cancel booking less than 2 hours before class' });
      }

      // Update booking status
      db.run(`
        UPDATE bookings 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [booking.id], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to cancel booking' });
        }

        // Update current bookings count
        db.run(`
          UPDATE class_schedules 
          SET current_bookings = current_bookings - 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [booking.schedule_id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to update booking count' });
          }

          db.run('COMMIT');
          res.json({ message: 'Booking cancelled successfully' });
        });
      });
    });
  });
});

export default router;