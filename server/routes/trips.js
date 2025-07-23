const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { verifyToken } = require('../middleware/auth');
const { ApiError } = require('../utils/ApiError');
const ActivityLog = require('../models/ActivityLog');
const { checkTripAccess } = require('../middleware/tripAccess');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const { generateTicketPDF, sendConfirmationEmail } = require('../utils/ticketGenerator');
const emailService = require('../services/emailService');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// Get all trips for the authenticated user
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const trips = await Trip.find({
      $or: [
        { creator: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .sort({ startDate: 1 })
    .populate('creator', 'firstName lastName email')
    .populate('collaborators.user', 'firstName lastName email');

    res.json(trips);
  } catch (error) {
    next(error);
  }
});

// Get a specific trip
router.get('/:tripId', verifyToken, async (req, res, next) => {
  try {
    console.log('=== LOADING TRIP DATA ===');
    console.log('Trip ID:', req.params.tripId);
    console.log('User ID:', req.user._id);
    console.log('User Email:', req.user.email);
    
    const trip = await Trip.findById(req.params.tripId)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email')
      .populate({ path: 'itinerary.activities.createdBy', select: 'firstName lastName' })
      .populate('flights')
      .populate('hotels');

    if (!trip) {
      console.error('❌ Trip not found:', req.params.tripId);
      throw new ApiError('Trip not found', 404);
    }

    console.log('✅ Trip found:', trip.title);
    console.log('Trip creator:', trip.creator);
    console.log('Trip collaborators:', trip.collaborators.map(c => ({ user: c.user, role: c.role, status: c.status })));
    
    // Debug user access check
    console.log('=== ACCESS CHECK DEBUG ===');
    console.log('Requesting user ID:', req.user._id);
    console.log('Requesting user ID type:', typeof req.user._id);
    console.log('Trip creator ID:', trip.creator._id);
    console.log('Trip creator ID type:', typeof trip.creator._id);
    console.log('Is user creator?', trip.creator._id.toString() === req.user._id.toString());
    console.log('Collaborators check:');
    trip.collaborators.forEach((collab, index) => {
      console.log(`  Collaborator ${index}:`, {
        user: collab.user._id,
        userType: typeof collab.user._id,
        isMatch: collab.user._id.toString() === req.user._id.toString(),
        role: collab.role,
        status: collab.status
      });
    });
    
    const hasAccess = trip.hasAccess(req.user._id);
    console.log('User has access:', hasAccess);
    
    if (!hasAccess) {
      console.error('❌ UNAUTHORIZED ACCESS - User:', req.user._id, 'does not have access to trip:', req.params.tripId);
      throw new ApiError('Unauthorized access', 403);
    }

    console.log('✅ User has access. Loading trip data...');
    console.log('Number of messages in trip:', trip.messages ? trip.messages.length : 0);
    if (trip.messages && trip.messages.length > 0) {
      console.log('Messages in trip:', trip.messages.map(msg => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      })));
    }

    res.json(trip);
  } catch (error) {
    console.error('❌ ERROR LOADING TRIP:', error);
    next(error);
  }
});

// Create a new trip
router.post('/', verifyToken, async (req, res, next) => {
  try {
    console.log('=== TRIP CREATION START ===');
    console.log('Creating trip with data:', req.body);
    console.log('User ID:', req.user._id);

    const tripData = {
      ...req.body,
      creator: req.user._id,
      status: 'planning',
      createdAt: new Date(),
      totalCost: req.body.totalCost !== undefined ? req.body.totalCost : 0
    };

    console.log('Trip data prepared:', tripData);

    // Initialize itinerary with days between start and end dates
    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    tripData.itinerary = Array.from({ length: days }, (_, index) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      return {
        date: currentDate,
        activities: []
      };
    });

    console.log('Processed trip data:', tripData);

    // Add creator as collaborator (admin, accepted)
    tripData.collaborators = [
      {
        user: req.user._id,
        role: 'admin',
        status: 'accepted'
      }
    ];

    const trip = new Trip(tripData);
    console.log('Trip object created, attempting to save...');
    await trip.save();
    console.log('Trip saved successfully with ID:', trip._id);

    // Create payment record
    let payment;
    try {
      console.log('=== PAYMENT CREATION START ===');
      console.log('Creating payment record with data:', {
        user: req.user._id,
        amount: trip.totalCost || 0,
        currency: 'INR',
        status: 'completed',
        type: 'trip_booking',
        paymentMethod: req.body.paymentMethod || 'card',
        description: `Payment for trip ${trip.title}`
      });
      
      payment = new Payment({
        user: req.user._id,
        amount: trip.totalCost || 0,
        currency: 'INR',
        status: 'completed',
        type: 'trip_booking',
        paymentMethod: req.body.paymentMethod || 'card',
        description: `Payment for trip ${trip.title}`
      });
      
      console.log('Payment object created, attempting to save...');
      await payment.save();
      console.log('Payment saved successfully with ID:', payment._id);
      
      trip.paymentId = payment._id;
      await trip.save();
      console.log('Trip updated with payment ID:', trip.paymentId);
    } catch (paymentError) {
      console.error('=== PAYMENT ERROR ===');
      console.error('Error saving payment:', paymentError);
      return res.status(500).json({ message: 'Error saving payment', error: paymentError.message });
    }

    console.log('Trip saved:', trip);

    // Log trip booking
    await ActivityLog.create({
      user: req.user._id,
      action: 'book-trip',
      details: { tripId: trip._id, title: trip.title }
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email');

    // Generate ticket and send confirmation email
    try {
      console.log('=== TICKET GENERATION START ===');
      const user = await User.findById(req.user._id);
      console.log('User found for ticket:', user.email);
      
      const ticketData = {
        _id: trip._id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        destination: trip.title,
        date: trip.startDate,
        time: trip.startTime || '09:00 AM', // Default time if not specified
        cost: trip.totalCost || '0.00',
        payment: {
          amount: payment.amount,
          currency: payment.currency,
          method: payment.paymentMethod,
          status: payment.status,
          id: payment._id
        }
      };

      console.log('Ticket data prepared:', ticketData);

      console.log('Generating PDF ticket...');
      const ticketPath = await generateTicketPDF(ticketData);
      console.log('PDF ticket generated at:', ticketPath);
      
      console.log('Sending confirmation email...');
      await sendConfirmationEmail(user.email, ticketData, ticketPath);
      console.log('Confirmation email sent successfully');

      // Update trip with ticket information
      trip.ticketGenerated = true;
      trip.ticketPath = ticketPath;
      await trip.save();
      console.log('Trip updated with ticket information');
    } catch (emailError) {
      console.error('=== TICKET/EMAIL ERROR ===');
      console.error('Error generating ticket or sending email:', emailError);
      // Don't fail the trip creation if email fails
    }

    console.log('=== TRIP CREATION COMPLETE ===');
    console.log('Sending response with trip:', populatedTrip);

    res.status(201).json(populatedTrip);
  } catch (error) {
    console.error('=== TRIP CREATION ERROR ===');
    console.error('Error creating trip:', error);
    next(error);
  }
});

// Update a trip
router.put('/:tripId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    if (!trip.creator.equals(req.user._id) && 
        !trip.collaborators.some(c => c.user.equals(req.user._id) && c.role === 'editor')) {
      throw new ApiError('Unauthorized to edit this trip', 403);
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate('creator', 'firstName lastName email')
    .populate('collaborators.user', 'firstName lastName email');

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

// Delete a trip
router.delete('/:tripId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    if (!trip.creator.equals(req.user._id)) {
      throw new ApiError('Unauthorized to delete this trip', 403);
    }

    await Trip.findByIdAndDelete(req.params.tripId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Add a collaborator to a trip
router.post('/:tripId/collaborators', verifyToken, checkTripAccess, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { email } = req.body;

    console.log('Adding collaborator:', { tripId, email });

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Find the user by email
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Check if user is already a collaborator
    const existingCollaborator = trip.collaborators.find(
      c => c.user && c.user.equals(invitedUser._id)
    );

    if (existingCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator on this trip' });
    }

    // Add new collaborator
    trip.collaborators.push({
      user: invitedUser._id,
      role: 'viewer',
      status: 'pending'
    });

    await trip.save();
    
    // Populate the newly added collaborator to return full data
    await trip.populate('collaborators.user', 'firstName lastName email');

    // Find the newly added collaborator in the populated array
    const newCollaboratorEntry = trip.collaborators.find(c => c.user && c.user.equals(invitedUser._id));

    // Send email notification to the invited user
    console.log('Sending collaboration invite email to:', email);
    const emailResult = await emailService.sendCollaborationInvite(tripId, email);
    console.log('Email send result:', emailResult);

    if (!emailResult.success) {
      console.error('Failed to send collaboration invite email:', emailResult.message);
    }

    res.status(200).json(newCollaboratorEntry);
  } catch (error) {
    console.error('Error in collaborator invitation:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get activity categories
router.get('/:tripId/activities/categories', verifyToken, async (req, res) => {
  try {
    // Return predefined categories
    const categories = [
      'Sightseeing',
      'Dining',
      'Shopping',
      'Entertainment',
      'Adventure',
      'Cultural',
      'Relaxation',
      'Transportation',
      'Accommodation',
      'Other'
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add activity to trip
router.post('/:tripId/activities', verifyToken, checkTripAccess, async (req, res) => {
  try {
    console.log('=== Activity Creation Debug ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Check if user has access to the trip
    if (!trip.creator.equals(req.user._id) && 
        !trip.collaborators.some(c => c.user.equals(req.user._id))) {
      throw new Error('Unauthorized access to trip');
    }

    // Prepare activity data
    const activityData = {
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      startTime: req.body.startTime, // Keep as string
      duration: req.body.duration,
      location: req.body.location,
      cost: Number(req.body.cost) || 0,
      category: req.body.category,
      bookingReference: req.body.bookingReference,
      type: req.body.type || 'activity',
      createdBy: req.user._id,
      updatedAt: new Date(),
      status: req.body.status || 'pending'
    };

    // Validate required fields
    const requiredFields = ['title', 'date', 'startTime', 'type'];
    const missingFields = requiredFields.filter(field => !activityData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(activityData.startTime)) {
      throw new Error('Invalid time format. Use HH:MM');
    }

    // Find or create day in itinerary
    const dateStr = activityData.date.toISOString().split('T')[0];
    let day = trip.itinerary.find(d => d.date.toISOString().split('T')[0] === dateStr);
    if (!day) {
      day = { date: activityData.date, activities: [] };
      trip.itinerary.push(day);
    }

    // Add activity to day
    day.activities.push(activityData);

    // Save trip
    await trip.save();

    // Log activity creation
    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      entityType: 'activity',
      entityId: activityData._id,
      tripId: trip._id,
      details: JSON.stringify({
        title: activityData.title,
        date: dateStr
      })
    });

    // Return updated trip with populated fields
    const updatedTrip = await Trip.findById(trip._id)
      .populate({ path: 'creator', select: 'name email' })
      .populate({ path: 'collaborators.user', select: 'name email' })
      .populate({ path: 'itinerary.activities.createdBy', select: 'name email' });

    res.json(updatedTrip);
  } catch (error) {
    console.error('Activity creation error:', error);
    res.status(400).json({ 
      message: error.message
    });
  }
});

// Update an activity
router.put('/:tripId/activities/:activityId', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    const { activityId } = req.params;
    const activityData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Find the activity in the itinerary
    let activityFound = false;
    trip.itinerary.forEach(day => {
      const activityIndex = day.activities.findIndex(a => a._id.toString() === activityId);
      if (activityIndex !== -1) {
        day.activities[activityIndex] = {
          ...day.activities[activityIndex],
          ...activityData
        };
        activityFound = true;
      }
    });

    if (!activityFound) {
      throw new ApiError('Activity not found', 404);
    }

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email')
      .populate({ path: 'itinerary.activities.createdBy', select: 'firstName lastName' });

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

// Delete an activity
router.delete('/:tripId/activities/:activityId', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    const { activityId } = req.params;

    // Find and remove the activity from the itinerary
    let activityFound = false;
    trip.itinerary.forEach(day => {
      const activityIndex = day.activities.findIndex(a => a._id.toString() === activityId);
      if (activityIndex !== -1) {
        day.activities.splice(activityIndex, 1);
        activityFound = true;
      }
    });

    if (!activityFound) {
      throw new ApiError('Activity not found', 404);
    }

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email')
      .populate({ path: 'itinerary.activities.createdBy', select: 'firstName lastName' });

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

// Add a flight to a trip
router.post('/:tripId/flights', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    console.log('Received flight data:', req.body);
    console.log('Trip ID:', req.params.tripId);

    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    // Validate required fields
    const requiredFields = ['airline', 'flightNumber', 'departureAirport', 'arrivalAirport', 'departureTime', 'arrivalTime'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      throw new ApiError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // Validate dates
    const departureTime = new Date(req.body.departureTime);
    const arrivalTime = new Date(req.body.arrivalTime);

    if (isNaN(departureTime.getTime()) || isNaN(arrivalTime.getTime())) {
      throw new ApiError('Invalid date format for departure or arrival time', 400);
    }

    if (arrivalTime <= departureTime) {
      throw new ApiError('Arrival time must be after departure time', 400);
    }

    // Create flight object
    const flightData = {
      airline: req.body.airline,
      flightNumber: req.body.flightNumber,
      departureAirport: req.body.departureAirport,
      arrivalAirport: req.body.arrivalAirport,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      duration: req.body.duration || '',
      price: req.body.price || '',
      bookingReference: req.body.bookingReference || '',
      createdBy: req.user._id,
      updatedAt: new Date()
    };

    // Add flight to trip
    try {
      // Update the trip using findByIdAndUpdate to avoid validation issues
      const updatedTrip = await Trip.findByIdAndUpdate(
        req.params.tripId,
        { $push: { flights: flightData } },
        { new: true, runValidators: false }
      ).populate('creator', 'firstName lastName email')
        .populate('collaborators.user', 'firstName lastName email');

      if (!updatedTrip) {
        throw new ApiError('Trip not found', 404);
      }

      res.status(201).json(updatedTrip);
    } catch (saveError) {
      console.error('Error saving flight:', saveError);
      if (saveError.name === 'ValidationError') {
        throw new ApiError(`Validation error: ${saveError.message}`, 400);
      }
      throw new ApiError('Error saving flight', 500);
    }
  } catch (error) {
    console.error('Error adding flight:', error);
    next(error);
  }
});

// Update flight in trip
router.put('/:tripId/flights/:flightId', verifyToken, checkTripAccess, async (req, res) => {
  try {
    const { tripId, flightId } = req.params;
    const flightData = req.body;

    // Validate required fields
    const requiredFields = ['airline', 'flightNumber', 'departureAirport', 'arrivalAirport', 'departureTime', 'arrivalTime'];
    const missingFields = requiredFields.filter(field => !flightData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate dates
    const departureDate = new Date(flightData.departureTime);
    const arrivalDate = new Date(flightData.arrivalTime);

    if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format for departure or arrival time' 
      });
    }

    if (arrivalDate <= departureDate) {
      return res.status(400).json({ 
        message: 'Arrival time must be after departure time' 
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user has access to the trip
    if (!trip.creator.equals(req.user._id) && !trip.collaborators.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to modify this trip' });
    }

    // Find the day and flight in the itinerary
    let flightFound = false;
    for (const day of trip.itinerary) {
      const flightIndex = day.activities.findIndex(
        activity => activity._id.toString() === flightId && activity.type === 'flight'
      );

      if (flightIndex !== -1) {
        // Update flight activity
        day.activities[flightIndex] = {
          ...day.activities[flightIndex],
          title: `${flightData.airline} ${flightData.flightNumber}`,
          description: `Flight from ${flightData.departureAirport} to ${flightData.arrivalAirport}`,
          startTime: flightData.departureTime,
          endTime: flightData.arrivalTime,
          location: `${flightData.departureAirport} → ${flightData.arrivalAirport}`,
          duration: flightData.duration || '',
          price: flightData.price || '',
          bookingReference: flightData.bookingReference || '',
          metadata: {
            airline: flightData.airline,
            flightNumber: flightData.flightNumber,
            departureAirport: flightData.departureAirport,
            arrivalAirport: flightData.arrivalAirport
          }
        };
        flightFound = true;
        break;
      }
    }

    if (!flightFound) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Save the trip
    await trip.save();

    // Return the updated trip with populated fields
    const updatedTrip = await Trip.findById(tripId)
      .populate('creator', 'username email')
      .populate('collaborators', 'username email')
      .populate({ path: 'activities.createdBy', select: 'firstName lastName' });

    res.json(updatedTrip);
  } catch (error) {
    console.error('Error updating flight:', error);
    res.status(500).json({ 
      message: 'Error updating flight',
      error: error.message 
    });
  }
});

// Delete a flight
router.delete('/:tripId/flights/:flightId', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    const { flightId } = req.params;

    // Find and remove the flight from the itinerary
    let flightFound = false;
    trip.itinerary.forEach(day => {
      const activityIndex = day.activities.findIndex(a => 
        a._id.toString() === flightId && a.type === 'flight'
      );
      if (activityIndex !== -1) {
        day.activities.splice(activityIndex, 1);
        flightFound = true;
      }
    });

    if (!flightFound) {
      throw new ApiError('Flight not found', 404);
    }

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email')
      .populate({ path: 'itinerary.activities.createdBy', select: 'firstName lastName' });

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

// Get all hotels for a trip
router.get('/:tripId/hotels', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    console.log('Fetching hotels for trip:', req.params.tripId);
    
    const trip = await Trip.findById(req.params.tripId)
      .populate('hotels');
      
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    console.log('Found trip with hotels:', trip.hotels);
    res.json(trip.hotels || []);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    next(error);
  }
});

// Add a hotel to a trip
router.post('/:tripId/hotels', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    console.log('=== Hotel Creation Debug ===');
    console.log('1. Request body:', JSON.stringify(req.body, null, 2));
    console.log('2. Trip ID:', req.params.tripId);
    console.log('3. User ID:', req.user._id);
    
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      console.log('4. Trip not found');
      throw new ApiError('Trip not found', 404);
    }
    console.log('4. Trip found:', trip._id);

    // Create hotel object
    const hotelData = {
      hotelName: req.body.hotelName,
      address: req.body.address,
      checkIn: new Date(req.body.checkIn),
      checkOut: new Date(req.body.checkOut),
      roomType: req.body.roomType || '',
      price: req.body.price || 0,
      bookingReference: req.body.bookingReference || '',
      amenities: req.body.amenities || '',
      notes: req.body.notes || '',
      createdBy: req.user._id
    };

    console.log('5. Hotel data prepared:', JSON.stringify(hotelData, null, 2));

    // Create new hotel
    const hotel = new Hotel(hotelData);
    
    // Validate the hotel data
    const validationError = hotel.validateSync();
    if (validationError) {
      console.log('6. Validation error:', validationError);
      const errors = Object.keys(validationError.errors).map(key => ({
        field: key,
        message: validationError.errors[key].message
      }));
      throw new ApiError('Validation failed', 400, errors);
    }
    console.log('6. Validation passed');

    await hotel.save();
    console.log('7. Hotel saved:', hotel._id);

    // Add hotel to trip
    trip.hotels.push(hotel._id);
    await trip.save();
    console.log('8. Hotel added to trip');

    // Fetch updated trip with populated hotels
    const updatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email')
      .populate('hotels');

    console.log('9. Updated trip fetched');
    res.status(201).json(updatedTrip.hotels);
  } catch (error) {
    console.error('=== Hotel Creation Error ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error instanceof ApiError) {
      next(error);
    } else if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      next(new ApiError('Validation failed', 400, errors));
    } else {
      next(new ApiError(error.message || 'Error adding hotel', 500));
    }
  }
});

// Update a hotel
router.put('/:tripId/hotels/:hotelId', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    // Find the hotel
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      throw new ApiError('Hotel not found', 404);
    }

    // Update hotel data
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Validate dates if provided
    if (updateData.checkIn || updateData.checkOut) {
      const checkIn = new Date(updateData.checkIn || hotel.checkIn);
      const checkOut = new Date(updateData.checkOut || hotel.checkOut);

      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        throw new ApiError('Invalid date format for check-in or check-out time', 400);
      }

      if (checkOut <= checkIn) {
        throw new ApiError('Check-out time must be after check-in time', 400);
      }

      updateData.checkIn = checkIn;
      updateData.checkOut = checkOut;
    }

    // Update the hotel
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.hotelId,
      updateData,
      { new: true }
    );

    res.json(updatedHotel);
  } catch (error) {
    console.error('Error updating hotel:', error);
    next(error);
  }
});

// Delete a hotel
router.delete('/:tripId/hotels/:hotelId', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    // Remove hotel from trip
    trip.hotels = trip.hotels.filter(h => h.toString() !== req.params.hotelId);
    await trip.save();

    // Delete the hotel
    await Hotel.findByIdAndDelete(req.params.hotelId);

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    next(error);
  }
});

// Get all flights for a trip
router.get('/:tripId/flights', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    res.json(trip.flights || []);
  } catch (error) {
    next(error);
  }
});

// Get all activities for a trip
router.get('/:tripId/activities', verifyToken, checkTripAccess, async (req, res) => {
  try {
    console.log('Fetching activities for trip:', req.params.tripId);
    
    const trip = await Trip.findById(req.params.tripId)
      .populate({ path: 'creator', select: 'name email' })
      .populate({ path: 'collaborators.user', select: 'name email' })
      .populate({ path: 'itinerary.activities.createdBy', select: 'name email' });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Check if user has access to the trip
    if (!trip.creator.equals(req.user._id) && 
        !trip.collaborators.some(c => c.user.equals(req.user._id))) {
      throw new Error('Unauthorized access to trip');
    }

    console.log('Trip found with itinerary:', trip.itinerary ? 'Yes' : 'No');
    if (trip.itinerary) {
      console.log('Number of days in itinerary:', trip.itinerary.length);
      trip.itinerary.forEach((day, index) => {
        console.log(`Day ${index + 1} activities:`, day.activities ? day.activities.length : 0);
      });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(400).json({ 
      message: error.message
    });
  }
});

// Add a chat message
router.post('/:tripId/chat', verifyToken, async (req, res, next) => {
  try {
    const { message } = req.body;
    console.log('=== CHAT MESSAGE SAVE ATTEMPT ===');
    console.log('Trip ID:', req.params.tripId);
    console.log('User ID:', req.user._id);
    console.log('User Email:', req.user.email);
    console.log('Message content:', message);
    console.log('Message type:', typeof message);
    console.log('Message length:', message ? message.length : 0);
    
    if (!message || typeof message !== 'string' || !message.trim()) {
      console.error('❌ INVALID MESSAGE - Message content is invalid:', message);
      return res.status(400).json({ 
        status: 'error', 
        message: 'Message content is required and must be a non-empty string.' 
      });
    }

    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      console.error('❌ TRIP NOT FOUND - Trip ID:', req.params.tripId);
      throw new ApiError('Trip not found', 404);
    }

    console.log('✅ Trip found:', trip.title);
    console.log('Trip creator ID:', trip.creator);
    console.log('Current user is creator?', trip.creator.toString() === req.user._id.toString());
    console.log('Trip collaborators:', trip.collaborators.map(c => c.user.toString()));

    // Check if user is creator or collaborator
    const isCreator = trip.creator.toString() === req.user._id.toString();
    const isCollaborator = trip.collaborators.some(c => c.user.toString() === req.user._id.toString());
    
    console.log('User is creator?', isCreator);
    console.log('User is collaborator?', isCollaborator);

    if (!isCreator && !isCollaborator) {
      console.error('❌ UNAUTHORIZED - User is neither creator nor collaborator');
      throw new ApiError('Unauthorized access to trip', 403);
    }

    console.log('✅ User authorized. Saving message...');
    
    // Save chat message to the correct field
    const newMessage = {
      sender: req.user._id,
      content: message,
      timestamp: new Date()
    };
    
    console.log('New message object:', newMessage);
    trip.messages.push(newMessage);
    console.log('✅ Message added to trip.messages array');

    await trip.save();
    console.log('✅ Trip saved successfully');

    const updatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email')
      .populate('messages.sender', 'firstName lastName');

    console.log('✅ Message saved. Total messages in trip:', updatedTrip.messages.length);
    console.log('✅ Latest message:', updatedTrip.messages[updatedTrip.messages.length - 1]);

    res.json(updatedTrip.messages[updatedTrip.messages.length - 1]);
  } catch (error) {
    console.error('❌ ERROR SAVING MESSAGE:', error.message);
    console.error('Error stack:', error.stack);
    next(error);
  }
});

// Vote on an activity
router.post('/:tripId/activities/:activityId/vote', verifyToken, async (req, res, next) => {
  try {
    const { tripId, activityId } = req.params;
    const { vote } = req.body; // `vote` will be true for 'Yes' and false for 'No'

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    const activity = trip.activities.id(activityId);
    if (!activity) {
      throw new ApiError('Activity not found', 404);
    }

    const existingVoteIndex = activity.votes.findIndex(v => v.user && v.user.equals(req.user._id));

    if (existingVoteIndex > -1) {
      // Update existing vote
      activity.votes[existingVoteIndex].vote = vote;
    } else {
      // Add new vote
      activity.votes.push({ user: req.user._id, vote });
    }

    await trip.save();

    // Send back the updated activity to the client
    res.json(activity);
  } catch (error) {
    next(error);
  }
});

// Remove collaborator
router.delete('/:tripId/collaborators/:collaboratorId', verifyToken, checkTripAccess, async (req, res) => {
  try {
    const { tripId, collaboratorId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.collaborators = trip.collaborators.filter(
      c => c._id.toString() !== collaboratorId
    );

    await trip.save();
    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update collaborator role
router.patch('/:tripId/collaborators/:collaboratorId', verifyToken, checkTripAccess, async (req, res) => {
  try {
    const { tripId, collaboratorId } = req.params;
    const { role } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const collaborator = trip.collaborators.id(collaboratorId);
    if (!collaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }

    collaborator.role = role;
    await trip.save();
    res.json(collaborator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload a document to a trip
router.post('/:tripId/documents', verifyToken, checkTripAccess, upload.single('file'), async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { type } = req.body; // Assuming 'type' is sent from client (e.g., 'flight', 'hotel', 'other')
    const file = req.file;

    if (!file) {
      throw new ApiError('No file uploaded', 400);
    }

    if (!type) {
      throw new ApiError('Document type is required', 400);
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
      resource_type: 'auto',
      folder: `travel-app/trips/${tripId}/documents`,
      originalname: file.originalname, // Store original filename
    });

    // Add document details to trip
    trip.documents.push({
      fileName: file.originalname,
      fileType: type,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      uploadedBy: req.user._id,
    });

    await trip.save();
    res.status(201).json(trip.documents[trip.documents.length - 1]);
  } catch (error) {
    console.error('Error uploading document:', error);
    next(error);
  }
});

// Get all documents for a trip
router.get('/:tripId/documents', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId).populate('documents.uploadedBy', 'firstName lastName');

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    res.json(trip.documents);
  } catch (error) {
    next(error);
  }
});

// Delete a document from a trip
router.delete('/:tripId/documents/:documentId', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    const { tripId, documentId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    const documentToDelete = trip.documents.id(documentId);
    if (!documentToDelete) {
      throw new ApiError('Document not found', 404);
    }

    // Ensure the user deleting the document is the uploader or has admin access
    if (!documentToDelete.uploadedBy.equals(req.user._id) && !req.user.isAdmin) { // Assuming isAdmin property on user
      throw new ApiError('Unauthorized to delete this document', 403);
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(documentToDelete.cloudinaryPublicId);

    // Remove from MongoDB
    documentToDelete.remove();
    await trip.save();

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting document:', error);
    next(error);
  }
});

// Share a document (if applicable - implementation can be added later)
router.post('/:tripId/documents/:documentId/share', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    // This is a placeholder. Actual sharing logic (e.g., sending email, generating shareable link)
    // would be implemented here.
    res.status(200).json({ message: 'Document sharing initiated (placeholder)' });
  } catch (error) {
    next(error);
  }
});

// Download a document (redirect to Cloudinary URL)
router.get('/:tripId/documents/:documentId/download', verifyToken, checkTripAccess, async (req, res, next) => {
  try {
    const { tripId, documentId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    const documentToDownload = trip.documents.id(documentId);
    if (!documentToDownload) {
      throw new ApiError('Document not found', 404);
    }

    // Redirect to Cloudinary URL for download
    res.redirect(documentToDownload.cloudinaryUrl);
  } catch (error) {
    console.error('Error downloading document:', error);
    next(error);
  }
});

// Get pending invitations for the current user
router.get('/invitations/pending', verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find({
      'collaborators.user': req.user._id,
      'collaborators.status': 'pending'
    })
    .populate('creator', 'firstName lastName email')
    .select('title creator collaborators');

    const invitations = trips.map(trip => ({
      _id: trip.collaborators.find(c => c.user.equals(req.user._id))._id,
      trip: {
        _id: trip._id,
        title: trip.title,
        creator: trip.creator
      }
    }));

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept invitation
router.post('/:tripId/invitations/:invitationId/accept', verifyToken, async (req, res) => {
  try {
    const { tripId, invitationId } = req.params;
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const collaborator = trip.collaborators.id(invitationId);
    if (!collaborator || !collaborator.user.equals(req.user._id)) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    collaborator.status = 'accepted';
    await trip.save();

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject invitation
router.post('/:tripId/invitations/:invitationId/reject', verifyToken, async (req, res) => {
  try {
    const { tripId, invitationId } = req.params;
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const collaborator = trip.collaborators.id(invitationId);
    if (!collaborator || !collaborator.user.equals(req.user._id)) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    collaborator.status = 'rejected';
    await trip.save();

    res.json({ message: 'Invitation rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept collaboration invitation
router.post('/:tripId/collaborators/:collaboratorId/accept', verifyToken, async (req, res) => {
  try {
    const { tripId, collaboratorId } = req.params;
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const collaborator = trip.collaborators.id(collaboratorId);
    if (!collaborator) {
      return res.status(404).json({ message: 'Collaboration invitation not found' });
    }

    if (!collaborator.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to accept this invitation' });
    }

    collaborator.status = 'accepted';
    await trip.save();

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject collaboration invitation
router.post('/:tripId/collaborators/:collaboratorId/reject', verifyToken, async (req, res) => {
  try {
    const { tripId, collaboratorId } = req.params;
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const collaborator = trip.collaborators.id(collaboratorId);
    if (!collaborator) {
      return res.status(404).json({ message: 'Collaboration invitation not found' });
    }

    if (!collaborator.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to reject this invitation' });
    }

    collaborator.status = 'rejected';
    await trip.save();

    res.json({ message: 'Invitation rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending invitations for current user
router.get('/invitations/pending', verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find({
      'collaborators.user': req.user._id,
      'collaborators.status': 'pending'
    }).populate('creator', 'firstName lastName email');

    const pendingInvitations = trips.map(trip => ({
      tripId: trip._id,
      tripTitle: trip.title,
      creator: trip.creator,
      collaboratorId: trip.collaborators.find(c => c.user.equals(req.user._id))._id
    }));

    res.json(pendingInvitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate ticket for a trip
router.post('/:tripId/generate-ticket', verifyToken, async (req, res, next) => {
  try {
    console.log('=== TICKET GENERATION START ===');
    console.log('Trip ID:', req.params.tripId);
    console.log('User ID:', req.user._id);

    const { tripId } = req.params;
    const trip = await Trip.findById(tripId)
      .populate('creator', 'firstName lastName email')
      .populate('paymentId');

    console.log('Trip found:', trip ? 'Yes' : 'No');
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    console.log('Checking trip access...');
    const hasAccess = trip.hasAccess(req.user._id);
    console.log('Has access:', hasAccess);
    if (!hasAccess) {
      throw new ApiError('Unauthorized access', 403);
    }

    console.log('Finding user...');
    const user = await User.findById(req.user._id);
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Prepare ticket data
    const ticketData = {
      _id: trip._id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      destination: trip.title,
      date: trip.startDate,
      time: trip.startTime || '09:00 AM',
      cost: trip.totalCost || '0.00',
      payment: trip.paymentId ? {
        amount: trip.paymentId.amount,
        currency: trip.paymentId.currency,
        method: trip.paymentId.paymentMethod,
        status: trip.paymentId.status,
        id: trip.paymentId._id
      } : null
    };

    console.log('Ticket data prepared:', ticketData);

    console.log('Generating PDF ticket...');
    const ticketPath = await generateTicketPDF(ticketData);
    console.log('PDF ticket generated at:', ticketPath);

    // Update trip with ticket information
    trip.ticketGenerated = true;
    trip.ticketPath = ticketPath;
    await trip.save();
    console.log('Trip updated with ticket information');

    // Send the PDF file
    console.log('Sending PDF file...');
    res.download(ticketPath, `ticket_${tripId}.pdf`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error downloading ticket' });
      } else {
        console.log('PDF file sent successfully');
      }
    });

  } catch (error) {
    console.error('=== TICKET GENERATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    next(error);
  }
});

// Test endpoint to debug ticket generation
router.get('/:tripId/test-ticket', verifyToken, async (req, res, next) => {
  try {
    console.log('=== TEST TICKET ENDPOINT ===');
    const { tripId } = req.params;
    console.log('Trip ID:', tripId);
    console.log('User ID:', req.user._id);

    const trip = await Trip.findById(tripId);
    console.log('Trip found:', trip ? 'Yes' : 'No');
    if (trip) {
      console.log('Trip title:', trip.title);
      console.log('Trip creator:', trip.creator);
      console.log('Has access:', trip.hasAccess(req.user._id));
    }

    const user = await User.findById(req.user._id);
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User name:', user.firstName, user.lastName);
      console.log('User email:', user.email);
    }

    res.json({ 
      message: 'Test completed',
      tripFound: !!trip,
      userFound: !!user,
      hasAccess: trip ? trip.hasAccess(req.user._id) : false
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Download existing ticket for a trip
router.get('/:tripId/download-ticket', verifyToken, async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    if (!trip.ticketGenerated || !trip.ticketPath) {
      throw new ApiError('Ticket not generated for this trip', 404);
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(trip.ticketPath)) {
      throw new ApiError('Ticket file not found', 404);
    }

    // Send the PDF file
    res.download(trip.ticketPath, `ticket_${tripId}.pdf`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error downloading ticket' });
      }
    });

  } catch (error) {
    console.error('Error downloading ticket:', error);
    next(error);
  }
});

// Cancel a trip (set status to 'cancelled')
router.patch('/:tripId/cancel', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    // Only the creator or an admin collaborator can cancel
    if (!trip.creator.equals(req.user._id) && !trip.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to cancel this trip' });
    }
    if (trip.status === 'cancelled') {
      return res.status(400).json({ message: 'Trip is already cancelled' });
    }
    trip.status = 'cancelled';
    await trip.save();
    res.json({ message: 'Trip cancelled successfully', trip });
  } catch (error) {
    next(error);
  }
});

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
};

module.exports = router; 