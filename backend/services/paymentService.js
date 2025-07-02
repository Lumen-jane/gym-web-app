import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class PaymentService {
  static async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      return paymentIntent;
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw error;
    }
  }
  
  static async createSubscription(customerId, priceId) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      return subscription;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }
  
  static async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });
      
      return customer;
    } catch (error) {
      console.error('Customer creation failed:', error);
      throw error;
    }
  }
  
  static async handleWebhook(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }
  
  static async handlePaymentSuccess(paymentIntent) {
    // Update user membership based on payment
    const { userId, membershipType } = paymentIntent.metadata;
    
    if (userId && membershipType) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      return new Promise((resolve, reject) => {
        db.run(`
          UPDATE users 
          SET membership_type = ?, membership_end_date = ?, is_active = 1
          WHERE id = ?
        `, [membershipType, endDate.toISOString(), userId], function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes);
        });
      });
    }
  }
}