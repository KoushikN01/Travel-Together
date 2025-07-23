const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '+1234567890',
};

async function testAuthentication() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');

    // Clear existing test user
    console.log('Clearing existing test user...');
    await User.deleteOne({ email: testUser.email });

    // Create new user
    console.log('Creating test user...');
    const user = new User(testUser);
    await user.save();
    console.log('Test user created successfully');

    // Verify user was saved
    const savedUser = await User.findOne({ email: testUser.email });
    console.log('\nSaved user data:');
    console.log(JSON.stringify(savedUser.toJSON(), null, 2));

    // Verify password is hashed
    console.log('\nVerifying password hashing:');
    console.log('Original password:', testUser.password);
    console.log('Hashed password:', savedUser.password);
    
    // Test password comparison
    console.log('\nTesting password comparison:');
    const isValidPassword = await savedUser.comparePassword(testUser.password);
    console.log('Password comparison result:', isValidPassword);

    // Test invalid password
    const isInvalidPassword = await savedUser.comparePassword('WrongPassword123!');
    console.log('Invalid password comparison result:', isInvalidPassword);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during authentication test:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the test
testAuthentication(); 