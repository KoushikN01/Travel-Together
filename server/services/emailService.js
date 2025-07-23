const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Debug logging for SMTP configuration
    console.log('Email Configuration:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
    console.log('CLIENT_URL:', process.env.CLIENT_URL);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

    this.initializeTransporter();
  }

  async initializeTransporter() {
    // Check if email configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email configuration missing. Email service will be disabled.');
      console.warn('Missing variables:', {
        EMAIL_USER: !process.env.EMAIL_USER,
        EMAIL_PASSWORD: !process.env.EMAIL_PASSWORD
      });
      this.transporter = null;
      return;
    }

    try {
      // Create transporter
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('Email server is ready to send emails');
    } catch (error) {
      console.error('Failed to initialize email connection:', error);
      this.transporter = null;
    }
  }

  async sendCollaborationInvite(tripId, email) {
    try {
      // If transporter is not initialized, try to initialize it
      if (!this.transporter) {
        console.log('Transporter not initialized, attempting to initialize...');
        await this.initializeTransporter();
      }

      if (!this.transporter) {
        console.warn('Email service is disabled. Skipping email send.');
        return { success: false, message: 'Email service is not configured' };
      }

      // Verify SMTP connection before sending
      try {
        await this.transporter.verify();
      } catch (verifyError) {
        console.error('Email connection verification failed:', verifyError);
        // Try to reinitialize the transporter
        await this.initializeTransporter();
        if (!this.transporter) {
          return { success: false, message: 'Email connection failed' };
        }
      }

      // Use hardcoded base URL for now
      const baseUrl = 'http://localhost:3001';
      const collaborationUrl = `${baseUrl}/trips/${tripId}/collaboration`;

      console.log('Sending collaboration invite with URL:', collaborationUrl);

      // Send the email
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Trip Collaboration Invitation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2196F3;">You've been invited to collaborate on a trip!</h1>
            <p>Someone has invited you to collaborate on their trip in TravelApp.</p>
            <p>Click the button below to accept the invitation:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${collaborationUrl}" 
                 style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              If the button above doesn't work, copy and paste this link into your browser:<br>
              ${collaborationUrl}
            </p>
          </div>
        `
      });
      
      console.log(`Successfully sent collaboration invite to ${email} for trip ${tripId}`);
      console.log('Email details:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });
      
      return { success: true, message: 'Invitation sent successfully' };
    } catch (error) {
      console.error('Error sending collaboration invite:', error);
      return { 
        success: false, 
        message: `Failed to send invitation email: ${error.message}`,
        error: error
      };
    }
  }
}

module.exports = new EmailService(); 