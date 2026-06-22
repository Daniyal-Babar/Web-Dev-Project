/**
 * Main Server File for Rental Marketplace Backend
 */

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

let lastDbError = null;
dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test';
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch((err) => {
    lastDbError = { message: err.message, when: new Date().toISOString() };
    console.error('❌ MongoDB Initial Connection Error:', err.message);
  });

const db = mongoose.connection;
db.on('connected', () => {
  console.log(`✅ Mongoose connected (db: ${db.name || 'unknown'})`);
});
db.on('error', (err) => {
  lastDbError = { message: err.message, when: new Date().toISOString() };
  console.error('❌ Mongoose connection error:', err.message);
});
db.on('disconnected', () => {
  console.error('❌ Mongoose disconnected');
});
db.on('reconnected', () => {
  console.log('🔄️ Mongoose reconnected');
});

// Health
app.get('/api/health', (req, res) => {
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.status(200).json({
    status: 'Server is running',
    timestamp: new Date(),
    db: {
      readyState: db.readyState,
      state: stateMap[db.readyState] || 'unknown',
      name: db.name || null,
      host: db.host || null,
      lastError: lastDbError,
    },
  });
});

// DB guard
const dbGuard = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database not connected', dbReadyState: mongoose.connection.readyState });
  }
  next();
};

// Routes
app.use('/api/auth', dbGuard, require('./routes/auth.routes'));
app.use('/api/listings', dbGuard, require('./routes/listing.routes'));
app.use('/api/bookings', dbGuard, require('./routes/booking.routes'));
app.use('/api/payments', dbGuard, require('./routes/payment.routes'));
app.use('/api/wallet', dbGuard, require('./routes/wallet.routes'));
app.use('/api/admin', dbGuard, require('./routes/admin.routes'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation Error', errors: Object.values(err.errors).map(e => e.message) });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
