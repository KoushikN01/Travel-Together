const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendLoginNotificationEmail = async (user) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Login Notification',
      html: `<h2>Hello ${user.firstName},</h2>
             <p>You have successfully logged in to our app. If this wasn't you, please reset your password immediately.</p>
             <p>Thank you for using our service!</p>`
    });
  } catch (err) {
    console.error('Login notification email failed:', err);
  }
};

const sendWelcomeEmail = async (user) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to Our App!',
      html: `<h2>Welcome, ${user.firstName}!</h2>
             <p>Thank you for signing up. We're excited to have you on board. Start planning your trips now!</p>`
    });
  } catch (err) {
    console.error('Welcome email failed:', err);
  }
};

module.exports = { sendLoginNotificationEmail, sendWelcomeEmail }; 