const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { verifyToken, verifyRefreshToken } = require('../middleware/auth');
const { ApiError } = require('../utils/ApiError');
const { generateTokens, generateMFASecret } = require('../utils/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/upload');
const ActivityLog = require('../models/ActivityLog');
const { sendLoginNotificationEmail, sendWelcomeEmail } = require('../utils/authNotification');

// Debug logging for Google Client ID
console.log('Google Client ID from env:', process.env.GOOGLE_CLIENT_ID);

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('Google Client ID is not configured in environment variables');
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    console.log('Registration attempt:', {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    });

    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      console.log('Registration failed: Missing required fields');
      throw new ApiError('All fields are required', 400);
    }

    // Additional validation
    if (firstName.trim().length < 2) {
      throw new ApiError('First name must be at least 2 characters long', 400);
    }

    if (lastName.trim().length < 2) {
      throw new ApiError('Last name must be at least 2 characters long', 400);
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Registration failed: Database not connected');
      throw new ApiError('Database connection error', 503);
    }

    // Check if user already exists with detailed logging
    console.log('Checking for existing user:', email);
    const existingUser = await User.findOne({ email }).select('email');
    
    if (existingUser) {
      console.log('Registration failed: Email already exists -', email);
      throw new ApiError('Email already registered', 400);
    }

    // Create new user
    console.log('Creating new user:', email);
    const user = new User({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber
    });

    // Save user to database with error handling
    try {
      await user.save();
      console.log('User saved successfully:', email);
    } catch (dbError) {
      console.error('Database save error:', dbError);
      if (dbError.code === 11000) {
        throw new ApiError('Email already registered', 400);
      }
      // Handle validation errors
      if (dbError.name === 'ValidationError') {
        const messages = Object.values(dbError.errors).map(err => err.message);
        throw new ApiError(messages[0], 400);
      }
      throw new ApiError('Error saving user to database', 500);
    }

    // Log successful registration
    await ActivityLog.create({
      user: user._id,
      action: 'register',
      details: 'User registered'
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user);

    console.log('Registration successful:', {
      userId: user._id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Registration successful! Please sign in.',
      success: true
    });
  } catch (error) {
    console.error('Registration error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
});

// Verify email
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    
    const user = await User.findOne({ 
      email: decoded.email,
      verificationToken: token
    });

    if (!user) {
      throw new ApiError('Invalid verification token', 400);
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, timestamp: new Date().toISOString() });

    // Validate input
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      throw new ApiError('Email and password are required', 400);
    }

    // Find user with password
    console.log('Finding user in database:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('Login failed: User not found -', email);
      throw new ApiError('Invalid email or password', 401);
    }

    // Verify password
    console.log('Verifying password for user:', email);
    if (!user.password) {
      console.log('Login failed: No password hash found for user -', email);
      throw new ApiError('Invalid user credentials', 401);
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log('Login failed: Invalid password -', email);
      throw new ApiError('Invalid email or password', 401);
    }

    // Generate tokens
    console.log('Generating tokens for user:', email);
    const { accessToken, refreshToken } = generateTokens(user);

    // Update user's refresh token and last login
    try {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            refreshToken,
            lastLogin: new Date()
          }
        }
      );
      console.log('User login data updated:', email);
    } catch (updateError) {
      console.error('Error updating user login data:', {
        error: updateError.message,
        userId: user._id,
        email: user.email
      });
      throw new ApiError('Error updating user data', 500);
    }

    // Get updated user data without password
    const updatedUser = await User.findById(user._id);

    // Log successful login
    await ActivityLog.create({
      user: updatedUser._id,
      action: 'login',
      details: 'User logged in'
    });

    // Send login notification email (non-blocking)
    sendLoginNotificationEmail(updatedUser);

    console.log('Login successful:', {
      userId: updatedUser._id,
      email: updatedUser.email,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        roles: updatedUser.roles,
        avatar: updatedUser.avatar
      },
      token: accessToken
    });
  } catch (error) {
    console.log('Login error:', error);
    next(error);
  }
});

// Refresh token
router.post('/refresh-token', verifyRefreshToken, async (req, res, next) => {
  try {
    const { token, refreshToken } = generateTokens(req.user);
    
    // Update user's refresh token
    req.user.refreshToken = refreshToken;
    await req.user.save();

    res.json({ token, refreshToken });
  } catch (error) {
    next(error);
  }
});

// Setup MFA
router.post('/setup-mfa', verifyToken, async (req, res, next) => {
  try {
    const { secret, qrCode } = generateMFASecret(req.user.email);
    
    req.user.mfaSecret = secret;
    await req.user.save();

    res.json({ qrCode });
  } catch (error) {
    next(error);
  }
});

// Verify MFA
router.post('/verify-mfa', async (req, res, next) => {
  try {
    const { code, tempToken } = req.body;
    
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify MFA code
    const isValid = verifyMFACode(code, user.mfaSecret);
    if (!isValid) {
      throw new ApiError('Invalid MFA code', 401);
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);

    // Update user's refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      user: user.toJSON(),
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Request password reset
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If an account exists, a password reset email has been sent.' });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_SECRET,
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'If an account exists, a password reset email has been sent.' });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    const decoded = jwt.verify(token, process.env.RESET_SECRET);
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError('Invalid or expired reset token', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log password reset
    await ActivityLog.create({
      user: user._id,
      action: 'reset-password',
      details: 'User reset password'
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', verifyToken, async (req, res, next) => {
  try {
    // Clear refresh token
    req.user.refreshToken = undefined;
    await req.user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Google OAuth login
router.post('/google', async (req, res, next) => {
  try {
    console.log('Google OAuth login attempt');
    console.log('Request body:', req.body);
    console.log('Environment variables:', {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set'
    });

    const { credential } = req.body;
    
    if (!credential) {
      console.log('No credential provided in request');
      throw new ApiError(400, 'No Google credential provided');
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.log('Google Client ID not configured in environment variables');
      throw new ApiError(500, 'Google Client ID not configured');
    }
    
    // Verify the Google token
    console.log('Attempting to verify Google token');
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    }).catch(error => {
      console.error('Google token verification error:', error);
      throw new ApiError(401, 'Invalid Google token');
    });
    
    console.log('Google token verified successfully');
    const payload = ticket.getPayload();
    console.log('Token payload:', payload);
    const { email, given_name: firstName, family_name: lastName, picture } = payload;

    if (!email) {
      console.log('No email in Google token payload');
      throw new ApiError(400, 'No email provided by Google');
    }

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        avatar: picture,
        verified: true, // Google accounts are pre-verified
        authProvider: 'google'
      });
      await user.save();
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update user's refresh token and last login
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          refreshToken,
          lastLogin: new Date()
        }
      }
    );

    // Log the activity
    await ActivityLog.create({
      user: user._id,
      action: 'login',
      details: 'User logged in via Google'
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role
      },
      token: accessToken
    });
  } catch (error) {
    console.error('Google login error:', error);
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(500, 'Failed to authenticate with Google'));
    }
  }
});

// Log user activity
router.post('/log-activity', verifyToken, async (req, res) => {
  try {
    const { action, details } = req.body;
    const userId = req.user._id;
    const log = new ActivityLog({ user: userId, action, details });
    await log.save();
    res.json({ message: 'Activity logged' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log activity' });
  }
});

// Verify user token
router.post('/verify-token', verifyToken, (req, res) => {
  res.json({ valid: true });
});

// Upload avatar
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    console.log('Avatar upload request received:', {
      userId: req.user._id,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file',
      headers: req.headers
    });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        message: `Invalid file type: ${req.file.mimetype}. Only JPEG, PNG, and GIF are allowed.`
      });
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        message: `File size too large: ${req.file.size} bytes. Maximum size is 5MB.`
      });
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary configuration');
      return res.status(500).json({ 
        message: 'Server configuration error: Missing Cloudinary credentials'
      });
    }

    // Upload to Cloudinary
    const avatarUrl = await uploadToCloudinary(req.file);
    
    if (!avatarUrl) {
      throw new Error('Failed to get avatar URL from Cloudinary');
    }

    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      throw new Error('Failed to update user avatar in database');
    }

    console.log('Avatar upload successful:', {
      userId: req.user._id,
      avatarUrl
    });

    res.json({
      message: 'Avatar uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Avatar upload error:', {
      userId: req.user._id,
      error: error.message,
      stack: error.stack,
      headers: req.headers
    });

    res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to upload avatar',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/verify', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router; 