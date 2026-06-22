/**
 * Validation Utilities
 * 
 * Helper functions for validating:
 * - Email format
 * - Phone numbers (Pakistan)
 * - Prices
 * - Dates
 * - Text length
 */

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Pakistan phone number
 * Format: 03001234567, +923001234567, etc.
 */
const validatePhoneNumber = (phone) => {
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\+()]/g, '');
  
  // Pakistan phone: 10-12 digits starting with 3, or 92 then 3
  const phoneRegex = /^(03\d{9}|923\d{9})$/;
  return phoneRegex.test(cleaned);
};

/**
 * Validate positive number (for prices, ratings, etc.)
 */
const validatePositiveNumber = (num) => {
  return !isNaN(num) && num > 0;
};

/**
 * Validate date range
 */
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Start date must be in future
  if (start < now) {
    throw new Error('Start date must be in the future');
  }

  // End date must be after start date
  if (end <= start) {
    throw new Error('End date must be after start date');
  }

  return true;
};

/**
 * Validate text length
 */
const validateTextLength = (text, minLength, maxLength) => {
  const length = text.trim().length;
  
  if (length < minLength) {
    throw new Error(`Text must be at least ${minLength} characters`);
  }
  
  if (length > maxLength) {
    throw new Error(`Text cannot exceed ${maxLength} characters`);
  }

  return true;
};

/**
 * Validate rating (1-5)
 */
const validateRating = (rating) => {
  const num = Number(rating);
  return num >= 1 && num <= 5 && Number.isInteger(num);
};

/**
 * Sanitize text input (remove potentially harmful content)
 */
const sanitizeText = (text) => {
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized.trim();
};

/**
 * Validate object has required fields
 */
const validateRequiredFields = (obj, fields) => {
  const missing = fields.filter(field => !obj[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  return true;
};

module.exports = {
  validateEmail,
  validatePhoneNumber,
  validatePositiveNumber,
  validateDateRange,
  validateTextLength,
  validateRating,
  sanitizeText,
  validateRequiredFields
};
