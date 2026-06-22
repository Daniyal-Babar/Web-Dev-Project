/**
 * Verify Seeded Data
 * 
 * Runs checks on the database to verify seeding was successful
 * and data integrity is maintained
 * 
 * Usage: node verify-seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Listing = require('./models/Listing');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Message = require('./models/Message');

async function verifyData() {
  try {
    console.log('\n🔍 Verifying seeded data...\n');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-platform';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');
    
    // Count documents
    const counts = {
      users: await User.countDocuments(),
      listings: await Listing.countDocuments(),
      bookings: await Booking.countDocuments(),
      reviews: await Review.countDocuments(),
      messages: await Message.countDocuments()
    };
    
    console.log('📊 Document Counts:');
    console.log('─'.repeat(40));
    console.log(`Users:     ${counts.users}`);
    console.log(`Listings:  ${counts.listings}`);
    console.log(`Bookings:  ${counts.bookings}`);
    console.log(`Reviews:   ${counts.reviews}`);
    console.log(`Messages:  ${counts.messages}`);
    console.log('─'.repeat(40));
    
    // User Statistics
    console.log('\n👥 User Statistics:');
    console.log('─'.repeat(40));
    const freeUsers = await User.countDocuments({ accountType: 'free' });
    const paidUsers = await User.countDocuments({ accountType: 'paid' });
    const borrowers = await User.countDocuments({ roles: 'borrower' });
    const owners = await User.countDocuments({ roles: 'owner' });
    const verifiedEmails = await User.countDocuments({ emailVerified: true });
    
    console.log(`Free Accounts:     ${freeUsers} (${((freeUsers/counts.users)*100).toFixed(1)}%)`);
    console.log(`Paid Accounts:     ${paidUsers} (${((paidUsers/counts.users)*100).toFixed(1)}%)`);
    console.log(`Borrowers:         ${borrowers}`);
    console.log(`Owners:            ${owners}`);
    console.log(`Email Verified:    ${verifiedEmails}`);
    
    // Listing Statistics
    console.log('\n📦 Listing Statistics:');
    console.log('─'.repeat(40));
    const categories = await Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    categories.forEach(cat => {
      console.log(`${cat._id.padEnd(20)} ${cat.count}`);
    });
    
    const activeListings = await Listing.countDocuments({ isActive: true });
    console.log(`\nActive Listings:   ${activeListings}/${counts.listings}`);
    
    // Booking Statistics
    console.log('\n💰 Booking Statistics:');
    console.log('─'.repeat(40));
    const bookingStatuses = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    bookingStatuses.forEach(status => {
      console.log(`${status._id.padEnd(20)} ${status.count}`);
    });
    
    const totalRevenue = await Booking.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]);
    if (totalRevenue.length > 0) {
      console.log(`\nTotal Revenue:     PKR ${totalRevenue[0].total.toLocaleString()}`);
    }
    
    // Review Statistics
    console.log('\n⭐ Review Statistics:');
    console.log('─'.repeat(40));
    const avgRating = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$overallRating' } } }
    ]);
    if (avgRating.length > 0) {
      console.log(`Average Rating:    ${avgRating[0].avgRating.toFixed(2)}/5.0`);
    }
    
    const reviewTypes = await Review.aggregate([
      { $group: { _id: '$reviewType', count: { $sum: 1 } } }
    ]);
    reviewTypes.forEach(type => {
      console.log(`${type._id.padEnd(25)} ${type.count}`);
    });
    
    // Data Integrity Checks
    console.log('\n✓ Data Integrity Checks:');
    console.log('─'.repeat(40));
    
    // Check listings have valid owners
    const listingsWithoutOwner = await Listing.countDocuments({ 
      owner: { $exists: false } 
    });
    console.log(`Listings with valid owner:     ${listingsWithoutOwner === 0 ? '✅' : '❌'}`);
    
    // Check bookings have valid references
    const invalidBookings = await Booking.countDocuments({
      $or: [
        { listing: { $exists: false } },
        { owner: { $exists: false } },
        { borrower: { $exists: false } }
      ]
    });
    console.log(`Bookings with valid refs:      ${invalidBookings === 0 ? '✅' : '❌'}`);
    
    // Check reviews are for completed bookings
    const reviews = await Review.find().populate('booking');
    const validReviews = reviews.filter(r => r.booking && r.booking.status === 'completed').length;
    console.log(`Reviews for completed bookings: ${validReviews === reviews.length ? '✅' : '⚠️ ' + validReviews + '/' + reviews.length}`);
    
    // Sample Data Preview
    console.log('\n👤 Sample Users (for testing):');
    console.log('─'.repeat(40));
    const sampleUsers = await User.find()
      .select('firstName lastName email roles accountType')
      .limit(5);
    
    sampleUsers.forEach(user => {
      console.log(`${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Roles: ${user.roles.join(', ')}`);
      console.log(`  Type: ${user.accountType}`);
      console.log(`  Password: Test@123`);
      console.log('');
    });
    
    // Popular Listings
    console.log('🔥 Most Viewed Listings:');
    console.log('─'.repeat(40));
    const popularListings = await Listing.find()
      .select('title category views rating')
      .sort({ views: -1 })
      .limit(5);
    
    popularListings.forEach((listing, idx) => {
      console.log(`${idx + 1}. ${listing.title}`);
      console.log(`   Category: ${listing.category} | Views: ${listing.views} | Rating: ${listing.rating.average.toFixed(1)}/5.0`);
    });
    
    console.log('\n' + '='.repeat(40));
    console.log('✅ Verification Complete!');
    console.log('='.repeat(40) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error verifying data:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');
    process.exit(0);
  }
}

verifyData();
