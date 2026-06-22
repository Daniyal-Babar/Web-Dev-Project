/**
 * Error Handler Utility
 * 
 * Centralized error handling and HTTP response formatting
 */

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.timestamp = new Date();
  }
}

/**
 * Success response formatter
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date()
  });
};

/**
 * Error response formatter
 */
const sendError = (res, message, statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date()
  });
};

/**
 * Validation error formatter
 */
const sendValidationError = (res, errors) => {
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array().map(err => ({
      field: err.param,
      message: err.msg
    })),
    timestamp: new Date()
  });
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Error type detection
 */
const getErrorDetails = (error) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }
  // Mongoose cast error
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  // Duplicate key error
  else if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }
  // JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }
  // Custom API error
  else if (error instanceof APIError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  return { statusCode, message };
};

module.exports = {
  APIError,
  sendSuccess,
  sendError,
  sendValidationError,
  asyncHandler,
  getErrorDetails
};
