const { ApiError } = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Error details:', {
    path: req.path,
    method: req.method,
    error: err.statusCode || err.status,
    stack: err.stack
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Handle invalid status code errors
  if (err instanceof RangeError && err.message.includes('Invalid status code')) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: messages
    });
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'error',
      message: `${field} already exists`
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // Default error
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

module.exports = { errorHandler }; 