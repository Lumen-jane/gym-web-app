import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"FitLife Gym" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3B82F6;">Welcome to FitLife Gym!</h1>
      <p>Hi ${user.first_name},</p>
      <p>Welcome to the FitLife community! Your ${user.membership_type} membership is now active.</p>
      
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Your Membership Benefits:</h3>
        <ul>
          <li>Access to all gym equipment</li>
          <li>Personalized workout plans</li>
          <li>Mobile app access</li>
          ${user.membership_type !== 'basic' ? '<li>Group fitness classes</li>' : ''}
          ${user.membership_type === 'vip' ? '<li>Personal training sessions</li>' : ''}
        </ul>
      </div>
      
      <p>Ready to start your fitness journey?</p>
      <a href="${process.env.FRONTEND_URL}/workout" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Browse Workouts</a>
      
      <p style="margin-top: 30px; color: #6B7280;">
        Need help? Reply to this email or visit our support center.
      </p>
    </div>
  `;
  
  await sendEmail(user.email, 'Welcome to FitLife Gym!', html);
};

export const sendBookingConfirmation = async (user, booking, classInfo) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10B981;">Booking Confirmed!</h1>
      <p>Hi ${user.first_name},</p>
      <p>Your class booking has been confirmed. Here are the details:</p>
      
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${classInfo.name}</h3>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.start_time}</p>
        <p><strong>Instructor:</strong> ${classInfo.instructor_name}</p>
        <p><strong>Location:</strong> ${classInfo.location}</p>
      </div>
      
      <p>Please arrive 10 minutes early. Don't forget to bring water and a towel!</p>
      
      <a href="${process.env.FRONTEND_URL}/booking" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View My Bookings</a>
    </div>
  `;
  
  await sendEmail(user.email, 'Class Booking Confirmed', html);
};