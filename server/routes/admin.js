const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const ActivityLog = require('../models/ActivityLog');
const Payment = require('../models/Payment');
const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Debug middleware for admin routes
router.use((req, res, next) => {
  console.log('Admin route accessed:', req.method, req.path);
  console.log('Admin route headers:', req.headers);
  next();
});

// Admin Authentication
router.post('/login', async (req, res) => {
  try {
    console.log('Admin login attempt:', req.body.email);
    const { email, password } = req.body;
    
    // Find admin user
    const user = await User.findOne({ 
      email, 
      $or: [
        { role: 'admin' },
        { roles: { $in: ['admin'] } }
      ]
    });
    
    if (!user) {
      console.log('Admin login failed: User not found or not admin:', email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Admin login failed: Invalid password:', email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = user.generateAuthToken();
    console.log('Admin login successful:', email);
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role || (user.roles && user.roles[0]),
        name: `${user.firstName} ${user.lastName}`
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify Admin Token
router.post('/verify-token', adminAuth, (req, res) => {
  res.json({ valid: true });
});

// Get All Users
router.get('/users', adminAuth, async (req, res) => {
  try {
    console.log('Fetching all users');
    const users = await User.find({})
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    console.log(`Found ${users.length} users`);
    const formattedUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      joinDate: user.createdAt,
      lastLogin: user.lastLogin,
      status: user.status || 'active',
      subscription: user.subscription || null,
      role: user.role || (user.roles && user.roles[0]) || 'user'
    }));

    res.json({ data: formattedUsers, total: formattedUsers.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get All Trips
router.get('/trips', adminAuth, async (req, res) => {
  try {
    console.log('Fetching all trips');
    const trips = await Trip.find({})
      .populate('creator', 'email firstName lastName')
      .sort({ startDate: -1 });

    console.log(`Found ${trips.length} trips`);
    const formattedTrips = trips.map(trip => ({
      id: trip._id,
      title: trip.title || 'Untitled Trip',
      creator: {
        email: trip.creator?.email || 'Unknown',
        name: trip.creator ? `${trip.creator.firstName} ${trip.creator.lastName}` : 'Unknown User'
      },
      startDate: trip.startDate,
      endDate: trip.endDate,
      destinations: trip.destination ? [trip.destination] : [],
      status: trip.status || 'planning',
      activities: trip.activities ? trip.activities.length : 0,
      collaborators: trip.collaborators ? trip.collaborators.length : 0
    }));

    res.json({ data: formattedTrips, total: formattedTrips.length });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Error fetching trips' });
  }
});

// Update User
router.put('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: req.body },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Get User Activity
router.get('/user-activity', adminAuth, async (req, res) => {
  try {
    const activities = await ActivityLog.find({})
      .populate('user', 'email')
      .sort({ timestamp: -1 })
      .limit(50);

    const formattedActivities = activities.map(activity => ({
      action: activity.action,
      user: activity.user.email,
      details: activity.details,
      timestamp: activity.timestamp
    }));

    res.json({ data: formattedActivities, total: formattedActivities.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user activity' });
  }
});

// Get Trip Statistics
router.get('/trip-statistics', adminAuth, async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const activeTrips = await Trip.countDocuments({ status: 'ongoing' });
    const completedTrips = await Trip.countDocuments({ status: 'completed' });

    // Get monthly trend data
    const trendData = await Trip.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          trips: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalTrips,
      activeTrips,
      completedTrips,
      trendData: trendData.map(item => ({
        month: new Date(2024, item._id - 1).toLocaleString('default', { month: 'short' }),
        trips: item.trips
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip statistics' });
  }
});

// Delete User (Admin only)
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Approve Trip (Admin only)
router.put('/trips/:tripId/approve', adminAuth, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      { status: 'confirmed' },
      { new: true }
    );
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip approved', trip });
  } catch (error) {
    console.error('Error approving trip:', error);
    res.status(500).json({ message: 'Error approving trip' });
  }
});

// Reject Trip (Admin only)
router.put('/trips/:tripId/reject', adminAuth, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      { status: 'rejected' },
      { new: true }
    );
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip rejected', trip });
  } catch (error) {
    console.error('Error rejecting trip:', error);
    res.status(500).json({ message: 'Error rejecting trip' });
  }
});

// Get Detailed User Data
router.get('/users/:userId/details', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -refreshToken')
      .populate('trips')
      .populate('subscription')
      .populate('preferences');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's activity logs
    const activityLogs = await ActivityLog.find({ user: user._id })
      .sort({ timestamp: -1 })
      .limit(50);

    // Get user's payment history
    const payments = await Payment.find({ user: user._id })
      .sort({ createdAt: -1 });

    // Get user's support tickets
    const supportTickets = await SupportTicket.find({ user: user._id })
      .sort({ createdAt: -1 });

    res.json({
      user,
      activityLogs,
      payments,
      supportTickets
    });
  } catch (error) {
    console.error('Error fetching detailed user data:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

// Delete User's Trip
router.delete('/trips/:tripId', adminAuth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Get user details for notification
    const user = await User.findById(trip.creator);
    
    // Delete the trip
    await Trip.findByIdAndDelete(req.params.tripId);

    // Create notification for the user
    const notification = new Notification({
      user: trip.creator,
      type: 'trip_deleted',
      title: 'Trip Deleted by Admin',
      message: `Your trip "${trip.title}" has been deleted by an administrator.`,
      metadata: {
        tripId: trip._id,
        tripTitle: trip.title,
        deletedAt: new Date()
      }
    });
    await notification.save();

    // Log the admin action
    await ActivityLog.create({
      user: req.user._id,
      action: 'delete_trip',
      details: `Admin deleted trip ${trip._id} belonging to user ${trip.creator}`,
      metadata: {
        tripId: trip._id,
        affectedUser: trip.creator
      }
    });

    res.json({ 
      message: 'Trip deleted successfully',
      notification: {
        sent: true,
        userId: trip.creator,
        type: 'trip_deleted'
      }
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Error deleting trip' });
  }
});

// Send Notification to User
router.post('/users/:userId/notify', adminAuth, async (req, res) => {
  try {
    console.log('=== Creating Notification ===');
    console.log('User ID:', req.params.userId);
    console.log('Request body:', req.body);
    console.log('Admin user:', req.user._id);
    
    const { title, message, type, priority } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Creating notification for user:', {
      userId: user._id,
      email: user.email,
      title,
      message,
      type: type || 'admin_notification',
      priority: priority || 'normal'
    });
    
    const notification = new Notification({
      user: user._id,
      type: type || 'admin_notification',
      title: title,
      message: message,
      priority: priority || 'normal',
      metadata: {
        sentBy: req.user._id,
        sentAt: new Date()
      }
    });
    
    const savedNotification = await notification.save();
    console.log('Notification saved successfully:', {
      id: savedNotification._id,
      userId: savedNotification.user,
      type: savedNotification.type,
      title: savedNotification.title,
      createdAt: savedNotification.createdAt
    });
    
    // Log the admin action
    await ActivityLog.create({
      user: req.user._id,
      action: 'send_notification',
      details: `Admin sent notification to user ${user._id}`,
      metadata: {
        notificationId: savedNotification._id,
        recipient: user._id,
        type: type
      }
    });
    
    console.log('Activity log created for notification');
    
    res.json({ 
      message: 'Notification sent successfully',
      notification: savedNotification
    });
  } catch (error) {
    console.error('Error sending notification:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ message: 'Error sending notification' });
  }
});

// Get Complete User Data
router.get('/users/:userId/complete-data', adminAuth, async (req, res) => {
  try {
    console.log('Fetching complete data for user:', req.params.userId);
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid user ID format:', userId);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Get user data
    const user = await User.findById(userId)
      .select('-password -refreshToken');

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found, fetching related data...');

    // Get related data in parallel
    const [trips, activityLogs, payments, supportTickets, notifications] = await Promise.all([
      Trip.find({ creator: userId }).sort({ createdAt: -1 }),
      ActivityLog.find({ user: userId }).sort({ timestamp: -1 }),
      Payment.find({ user: userId }).sort({ createdAt: -1 }),
      SupportTicket.find({ user: userId }).sort({ createdAt: -1 }),
      Notification.find({ user: userId }).sort({ createdAt: -1 })
    ]);

    console.log('Related data fetched successfully');

    // Format response
    const response = {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      trips: trips.map(trip => ({
        id: trip._id,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        status: trip.status,
        createdAt: trip.createdAt
      })),
      activityLogs: activityLogs.map(log => ({
        id: log._id,
        action: log.action,
        details: log.details,
        timestamp: log.timestamp
      })),
      payments: payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        type: payment.type,
        createdAt: payment.createdAt
      })),
      supportTickets: supportTickets.map(ticket => ({
        id: ticket._id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt
      })),
      notifications: notifications.map(notification => ({
        id: notification._id,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        read: notification.read,
        createdAt: notification.createdAt
      }))
    };

    console.log('Sending response for user:', userId);
    res.json(response);
  } catch (error) {
    console.error('Error fetching complete user data:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

module.exports = router; 