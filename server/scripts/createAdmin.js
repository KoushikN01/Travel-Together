require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@travelapp.com' });
    console.log('Removed existing admin user');

    // Create admin user with plain password (will be hashed by the User model)
    const adminUser = new User({
      email: 'admin@travelapp.com',
      password: 'admin123', // This will be hashed automatically
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+1234567890',
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
      isMFAEnabled: false,
      preferences: {
        language: 'en',
        currency: 'USD',
        timezone: 'UTC'
      }
    });

    await adminUser.save();
    console.log('----------------------------------------');
    console.log('Admin user created successfully!');
    console.log('Use these credentials to login:');
    console.log('Email: admin@travelapp.com');
    console.log('Password: admin123');
    console.log('----------------------------------------');

    // Verify the admin was created
    const verifyAdmin = await User.findOne({ email: 'admin@travelapp.com' });
    if (verifyAdmin) {
      console.log('Admin user verified in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin(); 