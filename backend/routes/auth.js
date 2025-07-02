import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { generateToken } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// Register new user
router.post('/register', validateRequest(schemas.register), async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, membership_type } = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userUuid = uuidv4();

      // Calculate membership dates
      const membershipStart = new Date();
      const membershipEnd = new Date();
      membershipEnd.setFullYear(membershipEnd.getFullYear() + 1);

      // Insert new user
      db.run(`
        INSERT INTO users (uuid, email, password, first_name, last_name, phone, membership_type, membership_start_date, membership_end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userUuid, email, hashedPassword, first_name, last_name, phone, membership_type, membershipStart.toISOString(), membershipEnd.toISOString()], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }

        // Get the created user
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to retrieve user' });
          }

          const token = generateToken(user);
          const { password: _, ...userWithoutPassword } = user;

          res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword,
            token
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', validateRequest(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Refresh token
router.post('/refresh', (req, res) => {
  // Implementation for token refresh
  res.json({ message: 'Token refresh endpoint' });
});

export default router;