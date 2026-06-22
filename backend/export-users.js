/**
 * Export Test Users
 * 
 * Exports all user credentials to a JSON file for easy testing
 * 
 * Usage: node export-users.js
 * Output: test-users.json
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/User');

async function exportUsers() {
  try {
    console.log('\n📤 Exporting test users...\n');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-platform';
    await mongoose.connect(mongoURI);
    
    // Get all users
    const users = await User.find()
      .select('firstName lastName email phoneNumber roles accountType emailVerified phoneVerified')
      .sort({ createdAt: -1 });
    
    // Format for export
    const testUsers = users.map(user => ({
      email: user.email,
      password: 'Test@123',
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phoneNumber,
      roles: user.roles,
      accountType: user.accountType,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified
    }));
    
    // Write to file
    fs.writeFileSync(
      'test-users.json',
      JSON.stringify(testUsers, null, 2)
    );
    
    console.log(`✅ Exported ${testUsers.length} users to test-users.json`);
    console.log('\n📋 Sample users:');
    testUsers.slice(0, 5).forEach((user, idx) => {
      console.log(`\n${idx + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Roles: ${user.roles.join(', ')}`);
    });
    
    // Create a summary
    const summary = {
      total: testUsers.length,
      byRole: {
        borrowers: testUsers.filter(u => u.roles.includes('borrower')).length,
        owners: testUsers.filter(u => u.roles.includes('owner')).length,
        both: testUsers.filter(u => u.roles.includes('borrower') && u.roles.includes('owner')).length
      },
      byAccountType: {
        free: testUsers.filter(u => u.accountType === 'free').length,
        paid: testUsers.filter(u => u.accountType === 'paid').length
      },
      verified: {
        email: testUsers.filter(u => u.emailVerified).length,
        phone: testUsers.filter(u => u.phoneVerified).length
      }
    };
    
    console.log('\n📊 Summary:');
    console.log(`Total users: ${summary.total}`);
    console.log(`Borrowers: ${summary.byRole.borrowers}`);
    console.log(`Owners: ${summary.byRole.owners}`);
    console.log(`Dual-role: ${summary.byRole.both}`);
    console.log(`Free accounts: ${summary.byAccountType.free}`);
    console.log(`Paid accounts: ${summary.byAccountType.paid}`);
    
    console.log('\n✅ Export complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error exporting users:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

exportUsers();
