const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const { ApiError } = require('../utils/ApiError');
const { uploadToLocal } = require('../utils/upload');
const { User } = require('../models');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get user profile
router.get('/profile', verifyToken, async (req, res, next) => {
  try {
    res.json(req.user.toJSON());
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res, next) => {
  try {
    console.log('=== Profile Update Request ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user._id);

    const {
      firstName,
      lastName,
      phoneNumber,
      address,
      city,
      state,
      country,
      pincode,
      dateOfBirth,
      gender,
      emergencyContact,
      emergencyPhone,
      preferredLanguage,
      travelPreferences,
      dietaryRestrictions,
      passportNumber,
      passportExpiry
    } = req.body;

    // Log extracted fields
    console.log('Extracted Fields:', {
      firstName,
      lastName,
      phoneNumber,
      address,
      city,
      state,
      country,
      pincode,
      dateOfBirth,
      gender,
      emergencyContact,
      emergencyPhone,
      preferredLanguage,
      travelPreferences,
      dietaryRestrictions,
      passportNumber,
      passportExpiry
    });

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber) {
      console.log('Validation failed: Missing required fields');
      throw new ApiError('First name, last name, and phone number are required', 400);
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      console.log('Validation failed: Invalid phone number format');
      throw new ApiError('Invalid phone number format', 400);
    }

    // Update user fields
    const updateData = {
      firstName,
      lastName,
      phoneNumber,
      address,
      city,
      state,
      country,
      pincode,
      dateOfBirth,
      gender,
      emergencyContact,
      emergencyPhone,
      preferredLanguage,
      travelPreferences,
      dietaryRestrictions,
      passportNumber,
      passportExpiry,
      updatedAt: new Date()
    };

    console.log('Update Data:', JSON.stringify(updateData, null, 2));

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('Error: User not found');
      throw new ApiError('User not found', 404);
    }

    // Log the profile update
    console.log('Profile updated successfully:', {
      userId: updatedUser._id,
      email: updatedUser.email,
      timestamp: new Date().toISOString()
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });
    next(error);
  }
});

// Test avatar upload endpoint
router.get('/test-upload', verifyToken, (req, res) => {
  res.json({ message: 'Upload endpoint is accessible' });
});

// Upload avatar
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    console.log('=== Avatar Upload Request ===');
    console.log('User ID:', req.user._id);
    console.log('Request headers:', req.headers);
    console.log('Request file:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to local storage
    console.log('Calling uploadToLocal...');
    const avatarUrl = await uploadToLocal(req.file);
    console.log('Avatar URL returned:', avatarUrl);
    
    if (!avatarUrl) {
      throw new Error('Failed to save avatar file');
    }

    // Update user's avatar in database
    console.log('Updating user avatar in database...');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    console.log('Database update result:', updatedUser ? 'Success' : 'Failed');
    console.log('Updated user avatar field:', updatedUser?.avatar);

    if (!updatedUser) {
      throw new Error('Failed to update user avatar in database');
    }

    console.log('Sending response to client...');
    res.json({
      message: 'Avatar uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to upload avatar'
    });
  }
});

// Change password
router.post('/change-password', verifyToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isValid = await req.user.comparePassword(currentPassword);
    if (!isValid) {
      throw new ApiError('Current password is incorrect', 401);
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Log activity
router.post('/log-activity', verifyToken, async (req, res, next) => {
  try {
    const { action, details } = req.body;
    // TODO: Implement activity logging
    res.json({ message: 'Activity logged successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /settings - Get user settings
router.get('/settings', verifyToken, async (req, res) => {
  try {
    console.log('=== Settings Fetch Request ===');
    console.log('User ID:', req.user._id);
    console.log('Auth Token:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Check if user exists
    const user = await User.findById(req.user._id);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('Error: User not found');
      throw new ApiError('User not found', 404);
    }

    // Get settings
    const settings = user.settings || {};
    console.log('Current settings:', JSON.stringify(settings, null, 2));
    
    res.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });
    
    res.status(error.statusCode || 500).json({ 
      message: error.message || 'Failed to fetch settings',
      error: error.toString()
    });
  }
});

// PUT /settings - Update user settings
router.put('/settings', verifyToken, async (req, res) => {
  try {
    console.log('=== Settings Update Request ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Get current settings
    const user = await User.findById(req.user._id);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('Error: User not found');
      throw new ApiError('User not found', 404);
    }

    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {};
    }

    // Update each section of settings if provided
    if (req.body.profile) {
      user.settings.profile = {
        ...user.settings.profile,
        ...req.body.profile
      };
    }
    if (req.body.account) {
      user.settings.account = {
        ...user.settings.account,
        ...req.body.account
      };
    }
    if (req.body.notifications) {
      user.settings.notifications = {
        ...user.settings.notifications,
        ...req.body.notifications
      };
    }
    if (req.body.privacy) {
      user.settings.privacy = {
        ...user.settings.privacy,
        ...req.body.privacy
      };
    }
    if (req.body.security) {
      user.settings.security = {
        ...user.settings.security,
        ...req.body.security
      };
    }
    if (req.body.subscription) {
      user.settings.subscription = {
        ...user.settings.subscription,
        ...req.body.subscription
      };
    }

    console.log('Updated settings:', JSON.stringify(user.settings, null, 2));

    // Save the user document
    await user.save();

    console.log('Settings saved successfully');
    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Settings update error:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });
    
    res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to update settings',
      error: error.toString()
    });
  }
});

// Get user notifications
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    console.log('=== Fetching User Notifications ===');
    console.log('User ID:', req.user._id);
    console.log('Auth token:', req.headers.authorization ? 'Present' : 'Missing');
    
    if (!req.user._id) {
      console.error('User ID is missing from request');
      return res.status(400).json({ message: 'User ID is missing' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.error('Invalid user ID format:', req.user._id);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    console.log('Finding notifications for user:', req.user._id);
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    console.log(`Found ${notifications.length} notifications`);
    console.log('Notifications:', notifications.map(n => ({
      id: n._id,
      title: n.title,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      userId: n.user
    })));
    
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });

    if (error instanceof mongoose.Error) {
      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ 
          message: 'Invalid user ID format',
          error: error.message 
        });
      }
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ 
          message: 'Validation error',
          error: error.message 
        });
      }
    }

    res.status(500).json({ 
      message: 'Error fetching notifications',
      error: error.message 
    });
  }
});

// Create notification (used by both user and admin)
router.post('/notifications', verifyToken, async (req, res) => {
  try {
    const { userId, title, message, type, priority } = req.body;
    
    // Check if the request is from an admin
    const isAdmin = req.user.role === 'admin' || (req.user.roles && req.user.roles.includes('admin'));
    
    // If not admin, can only create notifications for themselves
    if (!isAdmin && userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create notifications for other users' });
    }

    const notification = new Notification({
      user: userId,
      type: type || 'system_notification',
      title,
      message,
      priority: priority || 'normal',
      metadata: {
        createdBy: req.user._id,
        createdAt: new Date()
      }
    });

    await notification.save();
    console.log('Notification created:', notification._id);
    res.status(201).json({ notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

// Mark all notifications as read
router.patch('/notifications/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
});

// Delete a single notification
router.delete('/notifications/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// Delete all notifications for a user
router.delete('/notifications', verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ message: 'Error deleting notifications' });
  }
});

// Get user subscription details
router.get('/subscription', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.subscription);
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ message: 'Failed to fetch subscription details' });
  }
});

// Update user subscription (upgrade/cancel/renew)
router.post('/subscription', verifyToken, async (req, res) => {
  try {
    const { action, planName, price, startDate, expiryDate, features } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.subscription) {
      user.subscription = {};
    }
    if (action === 'upgrade' || action === 'subscribe') {
      // Upgrade or subscribe to a new plan
      user.subscription = {
        planName: planName || 'Premium',
        price: price || '',
        startDate: startDate ? new Date(startDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        features: features || [],
        status: 'active',
      };
    } else if (action === 'cancel') {
      // Cancel subscription
      user.subscription.status = 'cancelled';
      user.subscription.expiryDate = new Date();
    } else if (action === 'renew') {
      // Renew subscription
      user.subscription.status = 'active';
      user.subscription.startDate = new Date();
      user.subscription.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
    await user.save();
    res.json(user.subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

module.exports = router; 