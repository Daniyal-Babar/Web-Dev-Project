/**
 * Reset Admin Password Script
 * 
 * Deletes existing admin user and recreates it with correct password
 * 
 * Usage: node reset-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
// admin created 
const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    // Delete existing admin user
    console.log('Deleting existing admin user...');
    const result = await User.deleteOne({ email: 'admin@rentalmarketplace.com' });
    console.log(`✓ Deleted ${result.deletedCount} admin user(s)`);

    // Create new admin user (password will be hashed by pre-save hook)
    console.log('Creating new admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@rentalmarketplace.com',
      phoneNumber: '03001234567',
      password: 'Admin@123', // Will be hashed automatically
      admin: true,
      roles: ['borrower', 'lister'],
      emailVerified: true,
      phoneVerified: true,
      accountStatus: 'active'
    });

    console.log('\n✓ Admin user reset successfully!');
    console.log('\n=================================');
    console.log('Admin Login Credentials:');
    console.log('=================================');
    console.log('Email: admin@rentalmarketplace.com');
    console.log('Password: Admin@123');
    console.log('=================================');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin user:', error.message);
    process.exit(1);
  }
};

// Run the reset function
resetAdmin();
