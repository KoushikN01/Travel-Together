const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug logging for environment variables
console.log('Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const tripRoutes = require('./routes/trips');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const recommendationsRoutes = require('./routes/recommendations');
const { errorHandler } = require('./middleware/errorHandler');
const { verifyToken } = require('./middleware/auth');
const Trip = require('./models/Trip'); // Add this import at the top

// Debug logging
console.log('Environment variables loaded:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);

// Database connection function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Initialize Express app
const app = express();
const server = http.createServer(app);

// WebSocket server setup
const wss = new WebSocket.Server({ server });

// Store active connections
const connections = new Map();
const tripConnections = new Map();
const directChatConnections = new Map(); // chatId -> Set of userIds

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  const userId = req.url.split('?userId=')[1];
  
  if (userId) {
    connections.set(userId, ws);
    console.log(`User ${userId} connected. Total connections: ${connections.size}`);
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'message':
            // Broadcast message only to users in the trip
            const tripUsers = tripConnections.get(data.tripId) || new Set();
            tripUsers.forEach(tripUserId => {
              const userWs = connections.get(tripUserId);
              if (userWs && userWs.readyState === WebSocket.OPEN) {
                userWs.send(JSON.stringify({
                  type: 'message',
                  userId: data.userId,
                  username: data.username,
                  content: data.content,
                  timestamp: data.timestamp
                }));
              }
            });
            break;
          case 'direct_message': {
            // Direct user-to-user chat
            const { chatId, userId: senderId, username, content, timestamp } = data;
            console.log(`[WS] Direct message from ${senderId} to chat ${chatId}: ${content}`);
            const chatUsers = directChatConnections.get(chatId) || new Set();
            console.log(`[WS] Chat ${chatId} has ${chatUsers.size} users:`, Array.from(chatUsers));
            chatUsers.forEach(uid => {
              const userWs = connections.get(uid);
              if (userWs && userWs.readyState === WebSocket.OPEN) {
                console.log(`[WS] Sending message to user ${uid}`);
                userWs.send(JSON.stringify({
                  type: 'direct_message',
                  chatId,
                  userId: senderId,
                  username,
                  content,
                  timestamp
                }));
              } else {
                console.log(`[WS] User ${uid} not connected or WebSocket not open. Ready state:`, userWs?.readyState);
              }
            });
            break;
          }
          case 'join_direct_chat': {
            // Join a direct chat room (user-to-user)
            const { chatId } = data;
            if (!directChatConnections.has(chatId)) {
              directChatConnections.set(chatId, new Set());
            }
            directChatConnections.get(chatId).add(userId);
            console.log(`[WS] User ${userId} joined direct chat ${chatId}`);
            console.log(`[WS] Chat ${chatId} now has ${directChatConnections.get(chatId).size} users:`, Array.from(directChatConnections.get(chatId)));
            break;
          }
          case 'leave_direct_chat': {
            // Leave a direct chat room
            const { chatId } = data;
            const chatSet = directChatConnections.get(chatId);
            if (chatSet) {
              chatSet.delete(userId);
              if (chatSet.size === 0) {
                directChatConnections.delete(chatId);
                console.log(`[WS] Chat ${chatId} deleted (no users left)`);
              } else {
                console.log(`[WS] Chat ${chatId} now has ${chatSet.size} users:`, Array.from(chatSet));
              }
              console.log(`[WS] User ${userId} left direct chat ${chatId}`);
            }
            break;
          }
          case 'join_trip':
            // Only allow collaborators or creator to join the trip chat
            (async () => {
              try {
                const trip = await Trip.findById(data.tripId);
                if (!trip) {
                  ws.send(JSON.stringify({ type: 'error', message: 'Trip not found' }));
                  return;
                }
                if (
                  trip.creator.toString() === userId ||
                  trip.collaborators.some(c => c.user && c.user.toString() === userId)
                ) {
                  if (!tripConnections.has(data.tripId)) {
                    tripConnections.set(data.tripId, new Set());
                  }
                  tripConnections.get(data.tripId).add(userId);
                  console.log(`User ${userId} joined trip ${data.tripId}`);
                } else {
                  ws.send(JSON.stringify({ type: 'error', message: 'Not a collaborator on this trip' }));
                }
              } catch (err) {
                ws.send(JSON.stringify({ type: 'error', message: 'Error checking trip access' }));
              }
            })();
            break;
            
          case 'leave_trip':
            // Remove user from trip's connection set
            const tripSet = tripConnections.get(data.tripId);
            if (tripSet) {
              tripSet.delete(userId);
              if (tripSet.size === 0) {
                tripConnections.delete(data.tripId);
              }
              console.log(`User ${userId} left trip ${data.tripId}`);
            }
            break;
            
          case 'activity':
            // Broadcast activity updates to all users in the trip
            const activityUsers = tripConnections.get(data.tripId) || new Set();
            activityUsers.forEach(userId => {
              const userWs = connections.get(userId);
              if (userWs && userWs.readyState === WebSocket.OPEN) {
                userWs.send(JSON.stringify(data));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'An error occurred processing your message'
        }));
      }
    });
    
    ws.on('close', () => {
      connections.delete(userId);
      // Remove user from all trip connections
      tripConnections.forEach((users, tripId) => {
        users.delete(userId);
        if (users.size === 0) {
          tripConnections.delete(tripId);
        }
      });
      // Remove user from all direct chat connections
      directChatConnections.forEach((users, chatId) => {
        users.delete(userId);
        if (users.size === 0) {
          directChatConnections.delete(chatId);
        }
      });
      console.log(`User ${userId} disconnected. Remaining connections: ${connections.size}`);
    });
    
    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connection_status',
      status: 'connected'
    }));
  }
});

// Performance optimization for Express
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase JSON payload limit and add compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Add debugging middleware for uploads (before static file serving)
app.use('/uploads', (req, res, next) => {
  console.log('=== UPLOADS REQUEST ===');
  console.log('Request URL:', req.url);
  console.log('Request path:', req.path);
  console.log('Full path:', path.join(__dirname, '../uploads', req.path));
  console.log('File exists:', require('fs').existsSync(path.join(__dirname, '../uploads', req.path)));
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'up',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test uploads route
app.get('/test-uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads/avatars', filename);
  console.log('=== TEST UPLOADS ROUTE ===');
  console.log('Filename:', filename);
  console.log('Filepath:', filepath);
  console.log('File exists:', require('fs').existsSync(filepath));
  
  if (require('fs').existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'File not found', filepath });
  }
});

// Check database connection status middleware
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection is not ready'
    });
  }
  next();
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', verifyToken, userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trips', verifyToken, tripRoutes);
app.use('/api/ai',  aiRoutes);
app.use('/api/recommendations', verifyToken, recommendationsRoutes);

// Error handling
app.use(errorHandler);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

// Update server to use the HTTP server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

module.exports = server;
