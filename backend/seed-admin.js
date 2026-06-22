/**
 * Admin User Seeding Script
 * 
 * Creates the initial admin user for the platform.
 * Run this script once to set up the first admin account.
 * 
 * Usage: node seed-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Admin user credentials
const ADMIN_USER = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@rentalmarketplace.com',
  phoneNumber: '03001234567', // Change this to your number
  password: 'Admin@123', // CHANGE THIS AFTER FIRST LOGIN!
  admin: true,
  roles: ['borrower', 'lister'],
  emailVerified: true,
  phoneVerified: true,
  accountStatus: 'active'
};

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', ADMIN_USER.email);
      
      // Update existing user to be admin if not already
      if (!existingAdmin.admin) {
        existingAdmin.admin = true;
        existingAdmin.accountStatus = 'active';
        await existingAdmin.save();
        console.log('✓ Updated existing user to admin');
      }
      
      process.exit(0);
    }

    // Create admin user (password will be hashed automatically by pre-save hook)
    console.log('Creating admin user...');
    const adminUser = await User.create(ADMIN_USER);

    console.log('\n✓ Admin user created successfully!');
    console.log('\n=================================');
    console.log('Admin Login Credentials:');
    console.log('=================================');
    console.log('Email:', ADMIN_USER.email);
    console.log('Password:', ADMIN_USER.password);
    console.log('=================================');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
};

// Run the seeding function
seedAdmin();
