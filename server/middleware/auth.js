const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

exports.verifyToken = async (req, res, next) => {
  try {
    console.log('=== Token Verification ===');
    const authHeader = req.headers.authorization;
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Error: No token provided or invalid format');
      throw new ApiError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? 'Yes' : 'No');
    
    if (!process.env.JWT_SECRET) {
      console.error('Error: JWT_SECRET is not set in environment variables');
      throw new ApiError('Server configuration error', 500);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded ? 'Yes' : 'No');
      console.log('Decoded token:', decoded);

      if (!decoded._id) {
        console.error('Error: No user ID in token');
        throw new ApiError('Invalid token format', 401);
      }

      const user = await User.findById(decoded._id).select('-password');
      console.log('User found:', user ? 'Yes' : 'No');
      console.log('User details:', user ? {
        id: user._id,
        email: user.email,
        role: user.role
      } : 'Not found');

      if (!user) {
        console.log('Error: User not found for ID:', decoded._id);
        throw new ApiError('User not found', 404);
      }

      req.user = user;
      console.log('Token verification successful');
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', {
        name: jwtError.name,
        message: jwtError.message
      });

      if (jwtError.name === 'TokenExpiredError') {
        throw new ApiError('Token expired', 401);
      } else if (jwtError.name === 'JsonWebTokenError') {
        throw new ApiError('Invalid token', 401);
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Token verification error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError('Authentication failed', 401));
    }
  }
};

exports.verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError('No refresh token provided', 401);
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findOne({ 
      _id: decoded._id,
      refreshToken: refreshToken
    });

    if (!user) {
      throw new ApiError('Invalid refresh token', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError('Invalid refresh token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError('Refresh token expired', 401));
    } else {
      next(error);
    }
  }
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user.roles.includes(role)) {
      next(new ApiError('Unauthorized access', 403));
      return;
    }
    next();
  };
}; 