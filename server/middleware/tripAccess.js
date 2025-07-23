const Trip = require('../models/Trip');

const checkTripAccess = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const userId = req.user._id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is the creator
    if (trip.creator.toString() === userId.toString()) {
      req.trip = trip;
      return next();
    }

    // Check if user is a collaborator
    const collaborator = trip.collaborators.find(
      c => c.user.toString() === userId.toString() && c.status === 'accepted'
    );

    if (!collaborator) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Add trip and collaborator role to request
    req.trip = trip;
    req.collaboratorRole = collaborator.role;
    next();
  } catch (error) {
    console.error('Trip access error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { checkTripAccess }; 