import express from 'express';
import { PaymentService } from '../services/paymentService.js';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../database/init.js';

const router = express.Router();

// Create payment intent for membership
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const prices = { basic: 29, premium: 59, vip: 99 };
    
    if (!prices[membershipType]) {
      return res.status(400).json({ error: 'Invalid membership type' });
    }
    
    const paymentIntent = await PaymentService.createPaymentIntent(
      prices[membershipType],
      'usd',
      {
        userId: req.user.id,
        membershipType,
        type: 'membership'
      }
    );
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: prices[membershipType]
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment setup failed' });
  }
});

// Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    await PaymentService.handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook failed' });
  }
});

// Get payment history
router.get('/history', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      'membership' as type,
      membership_type as description,
      created_at as date,
      CASE membership_type
        WHEN 'basic' THEN 29.00
        WHEN 'premium' THEN 59.00
        WHEN 'vip' THEN 99.00
      END as amount
    FROM users 
    WHERE id = ?
    ORDER BY created_at DESC
  `;
  
  db.all(query, [req.user.id], (err, payments) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch payment history' });
    }
    
    res.json(payments);
  });
});

export default router;