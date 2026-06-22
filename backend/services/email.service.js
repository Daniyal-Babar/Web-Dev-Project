/**
 * Email Service for Backend
 * 
 * Handles sending emails for:
 * - Registration confirmation
 * - Email verification
 * - Booking notifications
 * - Payment confirmations
 * - Review notifications
 * - Account updates
 */

const nodemailer = require('nodemailer');

/**
 * Configure email transporter
 * Uses Gmail SMTP (or your email provider)
 */
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Email templates
 */
const emailTemplates = {
  /**
   * Welcome email for new user
   */
  welcome: (user) => ({
    subject: 'Welcome to My Rental Marketplace!',
    html: `
      <h1>Welcome, ${user.firstName}!</h1>
      <p>Thank you for joining My Rental Marketplace, the most trusted rental platform in Pakistan.</p>
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Verify your email address</li>
        <li>Complete your profile</li>
        <li>Browse available rentals or create your own listing</li>
      </ul>
      <p>Happy renting!</p>
      <p>Best regards,<br>My Rental Marketplace Team</p>
    `
  }),

  /**
   * Email verification confirmation
   */
  emailVerification: (user, verificationLink) => ({
    subject: 'Verify Your Email Address',
    html: `
      <h2>Email Verification</h2>
      <p>Hi ${user.firstName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
      <p>Or copy this link: ${verificationLink}</p>
      <p>This link expires in 24 hours.</p>
    `
  }),

  /**
   * Booking confirmation
   */
  bookingConfirmation: (booking) => ({
    subject: `Booking Confirmed - ${booking.listing.title}`,
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Your booking has been confirmed.</p>
      <p><strong>Booking Details:</strong></p>
      <ul>
        <li><strong>Item:</strong> ${booking.listing.title}</li>
        <li><strong>Dates:</strong> ${booking.startDate} to ${booking.endDate}</li>
        <li><strong>Total Amount:</strong> Rs ${booking.pricing.totalAmount}</li>
        <li><strong>Delivery Method:</strong> ${booking.deliveryMethod}</li>
      </ul>
      <p><strong>Owner Contact:</strong></p>
      <ul>
        <li>${booking.owner.firstName} ${booking.owner.lastName}</li>
        <li>Phone: ${booking.owner.phoneNumber}</li>
      </ul>
      <p>Secure messaging available in your dashboard.</p>
    `
  }),

  /**
   * New booking notification for owner
   */
  newBookingNotification: (booking) => ({
    subject: `New Booking Request - ${booking.listing.title}`,
    html: `
      <h2>New Booking Request</h2>
      <p>Someone is interested in renting your item!</p>
      <p><strong>Booking Details:</strong></p>
      <ul>
        <li><strong>Item:</strong> ${booking.listing.title}</li>
        <li><strong>Borrower:</strong> ${booking.borrower.firstName} ${booking.borrower.lastName}</li>
        <li><strong>Dates:</strong> ${booking.startDate} to ${booking.endDate}</li>
        <li><strong>Total Amount:</strong> Rs ${booking.pricing.totalAmount}</li>
        <li><strong>Status:</strong> ${booking.status}</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/my-bookings" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking</a></p>
    `
  }),

  /**
   * Payment receipt
   */
  paymentReceipt: (booking) => ({
    subject: `Payment Receipt - ${booking.listing.title}`,
    html: `
      <h2>Payment Receipt</h2>
      <p>Your payment has been received and processed.</p>
      <p><strong>Invoice Details:</strong></p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Item</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${booking.listing.title}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Subtotal</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Rs ${booking.pricing.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Platform Fee (10%)</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Rs ${booking.pricing.platformFee.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Tax (17%)</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Rs ${booking.pricing.tax.toFixed(2)}</td>
        </tr>
        <tr style="background-color: #f0f0f0;">
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Total</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Rs ${booking.pricing.totalAmount.toFixed(2)}</strong></td>
        </tr>
      </table>
      <p><strong>Payment Method:</strong> ${booking.payment.method}</p>
      <p><strong>Transaction ID:</strong> ${booking.payment.transactionId}</p>
    `
  }),

  /**
   * Review received notification
   */
  reviewNotification: (review) => ({
    subject: `New Review for ${review.listing.title}`,
    html: `
      <h2>New Review</h2>
      <p>${review.reviewerUser.firstName} has left a review:</p>
      <p><strong>${review.title}</strong></p>
      <p>Rating: ${'⭐'.repeat(Math.round(review.overallRating))} (${review.overallRating}/5)</p>
      <p>"${review.description}"</p>
      <p><a href="${process.env.FRONTEND_URL}/listing/${review.listing._id}">View Review</a></p>
    `
  })
};

/**
 * Send email function
 */
const emailService = {
  /**
   * Send welcome email
   */
  sendWelcomeEmail: async (user) => {
    try {
      const template = emailTemplates.welcome(user);
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        ...template
      });
      console.log(`✓ Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  },

  /**
   * Send email verification
   */
  sendEmailVerification: async (user, verificationLink) => {
    try {
      const template = emailTemplates.emailVerification(user, verificationLink);
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        ...template
      });
      console.log(`✓ Verification email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  },

  /**
   * Send booking confirmation
   */
  sendBookingConfirmation: async (booking) => {
    try {
      const template = emailTemplates.bookingConfirmation(booking);
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: booking.borrower.email,
        ...template
      });
      console.log(`✓ Booking confirmation sent to ${booking.borrower.email}`);
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
    }
  },

  /**
   * Send new booking notification to owner
   */
  sendNewBookingNotification: async (booking) => {
    try {
      const template = emailTemplates.newBookingNotification(booking);
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: booking.owner.email,
        ...template
      });
      console.log(`✓ New booking notification sent to ${booking.owner.email}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },

  /**
   * Send payment receipt
   */
  sendPaymentReceipt: async (booking) => {
    try {
      const template = emailTemplates.paymentReceipt(booking);
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: booking.borrower.email,
        ...template
      });
      console.log(`✓ Payment receipt sent to ${booking.borrower.email}`);
    } catch (error) {
      console.error('Error sending receipt:', error);
    }
  },

  /**
   * Send review notification
   */
  sendReviewNotification: async (review) => {
    try {
      const template = emailTemplates.reviewNotification(review);
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: review.reviewedUser.email,
        ...template
      });
      console.log(`✓ Review notification sent to ${review.reviewedUser.email}`);
    } catch (error) {
      console.error('Error sending review notification:', error);
    }
  }
};

module.exports = emailService;
