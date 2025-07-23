const mongoose = require('mongoose');
const Hotel = require('./Hotel');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const activityVoteSchema = new mongoose.Schema({
  activity: {
    type: String,
    required: true
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['up', 'down'],
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['proposed', 'approved', 'rejected'],
    default: 'proposed'
  }
});

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Activity date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)`
    },
    set: function(v) {
      // Ensure the value is stored as a string
      return String(v);
    }
  },
  duration: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    trim: true
  },
  bookingReference: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Activity type is required'],
    enum: ['activity', 'transportation', 'accommodation'],
    default: 'activity'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add pre-save middleware for activity validation
activitySchema.pre('save', function(next) {
  // Trim string fields
  if (this.title) this.title = this.title.trim();
  if (this.description) this.description = this.description.trim();
  if (this.location) this.location = this.location.trim();
  if (this.bookingReference) this.bookingReference = this.bookingReference.trim();
  
  // Ensure cost is a number
  if (this.cost) {
    this.cost = Number(this.cost);
    if (isNaN(this.cost)) {
      this.cost = 0;
    }
  }

  // Ensure startTime is a string
  if (this.startTime) {
    this.startTime = String(this.startTime);
  }
  
  next();
});

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  departureAirport: {
    type: String,
    required: true
  },
  arrivalAirport: {
    type: String,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  duration: String,
  price: Number,
  bookingReference: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  activities: [activitySchema]
}, { timestamps: true });

// Add method to sort activities by time
daySchema.methods.sortActivities = function() {
  this.activities.sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
};

// Add method to get activities by type
daySchema.methods.getActivitiesByType = function(type) {
  return this.activities.filter(activity => activity.type === type);
};

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  destination: {
    type: String,
    required: true,
    trim: true,
    default: 'Not specified'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  itinerary: [daySchema],
  flights: [flightSchema],
  hotels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  }],
  documents: [documentSchema],
  messages: [messageSchema],
  activityVotes: [activityVoteSchema],
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'completed', 'cancelled'],
    default: 'planning'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  ticketGenerated: {
    type: Boolean,
    default: false
  },
  ticketPath: {
    type: String
  },
  startTime: {
    type: String,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)`
    }
  },
  totalCost: {
    type: Number,
    default: 0
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: false
  }
});

// Add pre-save middleware to ensure arrays are initialized
tripSchema.pre('save', function(next) {
  if (!this.flights) {
    this.flights = [];
  }
  if (!this.hotels) {
    this.hotels = [];
  }
  if (!this.documents) {
    this.documents = [];
  }
  next();
});

// Add method to check if user has access to the trip
tripSchema.methods.hasAccess = function(userId) {
  return this.creator.equals(userId) || 
         this.collaborators.some(c => c.user && c.user.equals(userId));
};

// Add method to get user's role in the trip
tripSchema.methods.getUserRole = function(userId) {
  if (this.creator.equals(userId)) {
    return 'creator';
  }
  const collaborator = this.collaborators.find(c => c.user && c.user.equals(userId));
  return collaborator ? collaborator.role : null;
};

// Add method to get all activities for a specific date
tripSchema.methods.getActivitiesForDate = function(date) {
  const day = this.itinerary.find(d => 
    d.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
  );
  return day ? day.activities : [];
};

// Add method to get all flights
tripSchema.methods.getAllFlights = function() {
  return this.itinerary
    .flatMap(day => day.activities)
    .filter(activity => activity.type === 'flight');
};

// Add method to get all hotels
tripSchema.methods.getAllHotels = function() {
  return this.itinerary
    .flatMap(day => day.activities)
    .filter(activity => activity.type === 'hotel');
};

// Add method to get all activities
tripSchema.methods.getAllActivities = function() {
  return this.itinerary
    .flatMap(day => day.activities)
    .filter(activity => activity.type === 'activity');
};

// Add indexes for better query performance
tripSchema.index({ creator: 1 });
tripSchema.index({ 'collaborators.user': 1 });
tripSchema.index({ status: 1 });

// Virtual for checking if a user is an admin
tripSchema.methods.isAdmin = function(userId) {
  return (
    this.creator.toString() === userId ||
    this.collaborators.some(c => 
      c.user.toString() === userId && 
      c.role === 'admin'
    )
  );
};

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip; 