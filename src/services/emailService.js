const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Email service will be disabled.');
      this.transporter = null;
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendCollaborationInvite(tripId, email) {
    try {
      if (!this.transporter) {
        console.warn('Email service is disabled. Skipping email send.');
        return { success: true, message: 'Invitation sent successfully (email disabled)' };
      }

      // Verify SMTP connection
      await this.transporter.verify();
      
      // Send the email
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Trip Collaboration Invitation',
        html: `
          <h1>You've been invited to collaborate on a trip!</h1>
          <p>Click the link below to accept the invitation:</p>
          <a href="http://localhost:3001/trips/${tripId}/collaboration">Accept Invitation</a>
        `
      });
      
      console.log(`Successfully sent collaboration invite to ${email} for trip ${tripId}`);
      return { success: true, message: 'Invitation sent successfully' };
    } catch (error) {
      console.error('Error sending collaboration invite:', error);
      if (error.code === 'EAUTH') {
        throw new Error('Email authentication failed. Please check SMTP credentials.');
      } else if (error.code === 'ESOCKET') {
        throw new Error('Could not connect to SMTP server. Please check SMTP settings.');
      } else {
        throw new Error(`Failed to send invitation email: ${error.message}`);
      }
    }
  }

  async sendPasswordReset(email, resetToken) {
    try {
      if (!this.transporter) {
        console.warn('Email service is disabled. Skipping email send.');
        return { success: true, message: 'Password reset email sent (email disabled)' };
      }

      await this.transporter.verify();
      
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="http://localhost:3001/reset-password?token=${resetToken}">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        `
      });

      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email, firstName) {
    try {
      if (!this.transporter) {
        console.warn('Email service is disabled. Skipping email send.');
        return { success: true, message: 'Welcome email sent (email disabled)' };
      }

      await this.transporter.verify();
      
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Welcome to TravelApp!',
        html: `
          <h1>Welcome to TravelApp, ${firstName}!</h1>
          <p>We're excited to have you on board. Here's what you can do with TravelApp:</p>
          <ul>
            <li>Plan and organize your trips</li>
            <li>Collaborate with friends and family</li>
            <li>Get AI-powered travel recommendations</li>
            <li>Book flights, hotels, and activities</li>
          </ul>
          <p>Get started by creating your first trip!</p>
          <a href="http://localhost:3001/trips">Create Your First Trip</a>
        `
      });

      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendTripUpdateNotification(email, tripName, updateType) {
    try {
      if (!this.transporter) {
        console.warn('Email service is disabled. Skipping email send.');
        return { success: true, message: 'Trip update notification sent (email disabled)' };
      }

      await this.transporter.verify();
      
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: `Trip Update: ${tripName}`,
        html: `
          <h1>Trip Update: ${tripName}</h1>
          <p>There has been an update to your trip:</p>
          <p><strong>Update Type:</strong> ${updateType}</p>
          <p>Click below to view the changes:</p>
          <a href="http://localhost:3001/trips">View Trip Updates</a>
        `
      });

      return { success: true, message: 'Trip update notification sent successfully' };
    } catch (error) {
      console.error('Error sending trip update notification:', error);
      throw new Error(`Failed to send trip update notification: ${error.message}`);
    }
  }
}

module.exports = new EmailService(); 