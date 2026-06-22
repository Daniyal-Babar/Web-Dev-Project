/**
 * Database Seeding Script
 * 
 * Generates and inserts comprehensive dummy data for testing
 * 
 * Usage:
 *   node seed.js --clear    (Clear existing data and seed fresh)
 *   node seed.js --append   (Add to existing data)
 *   node seed.js --users=20 --listings=50 --bookings=30
 * 
 * Default password for all users: "Test@123"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Listing = require('./models/Listing');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Message = require('./models/Message');

// ==================== CONFIGURATION ====================

const CONFIG = {
  users: 30,
  listings: 80,
  bookings: 50,
  reviews: 40,
  messages: 60,
  clearData: true, // Change to false to append data
  defaultPassword: 'Test@123'
};

// Parse command line arguments
process.argv.forEach((arg) => {
  if (arg === '--append') CONFIG.clearData = false;
  if (arg === '--clear') CONFIG.clearData = true;
  if (arg.startsWith('--users=')) CONFIG.users = parseInt(arg.split('=')[1]);
  if (arg.startsWith('--listings=')) CONFIG.listings = parseInt(arg.split('=')[1]);
  if (arg.startsWith('--bookings=')) CONFIG.bookings = parseInt(arg.split('=')[1]);
  if (arg.startsWith('--reviews=')) CONFIG.reviews = parseInt(arg.split('=')[1]);
  if (arg.startsWith('--messages=')) CONFIG.messages = parseInt(arg.split('=')[1]);
});

// ==================== HELPER DATA ====================

const pakistaniCities = [
  { city: 'Karachi', province: 'Sindh' },
  { city: 'Lahore', province: 'Punjab' },
  { city: 'Islamabad', province: 'Islamabad Capital Territory' },
  { city: 'Rawalpindi', province: 'Punjab' },
  { city: 'Faisalabad', province: 'Punjab' },
  { city: 'Multan', province: 'Punjab' },
  { city: 'Peshawar', province: 'Khyber Pakhtunkhwa' },
  { city: 'Quetta', province: 'Balochistan' },
  { city: 'Sialkot', province: 'Punjab' },
  { city: 'Gujranwala', province: 'Punjab' },
  { city: 'Hyderabad', province: 'Sindh' },
  { city: 'Sukkur', province: 'Sindh' }
];

const firstNames = [
  'Ahmed', 'Ali', 'Hassan', 'Usman', 'Bilal', 'Hamza', 'Asad', 'Faisal', 'Kamran', 'Zain',
  'Ayesha', 'Fatima', 'Zainab', 'Maryam', 'Sana', 'Hira', 'Nida', 'Aisha', 'Sara', 'Alina'
];

const lastNames = [
  'Khan', 'Ahmed', 'Ali', 'Malik', 'Shah', 'Hussain', 'Iqbal', 'Raza', 'Javed', 'Aslam',
  'Butt', 'Chaudhry', 'Siddiqui', 'Mirza', 'Sheikh', 'Baig', 'Qureshi', 'Rizvi'
];

const categories = [
  { 
    name: 'property', 
    subCategories: ['House', 'Apartment', 'Room', 'Office Space', 'Warehouse', 'Shop'],
    specs: ['bedrooms', 'bathrooms', 'area', 'furnished', 'parking']
  },
  { 
    name: 'vehicles', 
    subCategories: ['Car', 'Motorcycle', 'Bicycle', 'Truck', 'Van', 'Bus'],
    specs: ['brand', 'model', 'year', 'mileage', 'transmission', 'fuel']
  },
  { 
    name: 'clothes', 
    subCategories: ['Wedding Dress', 'Formal Suit', 'Traditional Wear', 'Party Dress', 'Accessories'],
    specs: ['size', 'color', 'material', 'designer', 'condition']
  },
  { 
    name: 'equipment', 
    subCategories: ['Camera', 'Sound System', 'Power Tools', 'Camping Gear', 'Sports Equipment'],
    specs: ['brand', 'model', 'condition', 'weight', 'powerSource']
  },
  { 
    name: 'services', 
    subCategories: ['Photography', 'Catering', 'Event Planning', 'Cleaning', 'Tutoring'],
    specs: ['experience', 'availability', 'teamSize', 'languages']
  },
  { 
    name: 'animals', 
    subCategories: ['Horse', 'Camel', 'Buffalo', 'Cow', 'Sheep'],
    specs: ['breed', 'age', 'gender', 'trained', 'vaccinated']
  },
  { 
    name: 'boats', 
    subCategories: ['Sailboat', 'Motor Boat', 'Yacht', 'Fishing Boat', 'Jet Ski'],
    specs: ['length', 'capacity', 'engine', 'year', 'condition']
  },
  { 
    name: 'air_transport', 
    subCategories: ['Helicopter', 'Private Jet', 'Hot Air Balloon', 'Glider'],
    specs: ['capacity', 'range', 'year', 'certified', 'pilot']
  }
];

const paymentMethods = ['jazz_cash', 'easypaisa', 'card', 'bank_transfer'];
const deliveryMethods = ['self_pickup', 'owner_delivery', 'courier'];
const pricingModels = ['hourly', 'daily', 'weekly', 'monthly'];

// ==================== HELPER FUNCTIONS ====================

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

function generatePhoneNumber() {
  const prefixes = ['0300', '0301', '0302', '0321', '0333', '0345'];
  return `${randomItem(prefixes)}${randomNumber(1000000, 9999999)}`;
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber(1, 999)}@${randomItem(domains)}`;
}

function generateCoordinates(city) {
  // Approximate coordinates for major Pakistani cities
  const cityCoords = {
    'Karachi': [67.0099, 24.8607],
    'Lahore': [74.3436, 31.5497],
    'Islamabad': [73.0479, 33.6844],
    'Rawalpindi': [73.0551, 33.5651],
    'Faisalabad': [73.0840, 31.4180],
    'Multan': [71.5249, 30.1575],
    'Peshawar': [71.5836, 34.0151],
    'Quetta': [66.9750, 30.1798],
    'Sialkot': [74.5436, 32.4972],
    'Gujranwala': [74.1883, 32.1617],
    'Hyderabad': [68.3728, 25.3960],
    'Sukkur': [68.8574, 27.7060]
  };
  
  const baseCoords = cityCoords[city] || [73.0479, 33.6844];
  // Add small random offset (within ~5km)
  return [
    baseCoords[0] + randomFloat(-0.05, 0.05, 4),
    baseCoords[1] + randomFloat(-0.05, 0.05, 4)
  ];
}

function generateSpecifications(category) {
  const specs = {};
  const categoryData = categories.find(c => c.name === category);
  
  if (!categoryData) return specs;
  
  categoryData.specs.forEach(spec => {
    switch(spec) {
      case 'bedrooms':
        specs[spec] = randomNumber(1, 5);
        break;
      case 'bathrooms':
        specs[spec] = randomNumber(1, 4);
        break;
      case 'area':
        specs[spec] = `${randomNumber(500, 5000)} sq ft`;
        break;
      case 'furnished':
        specs[spec] = randomBool() ? 'Fully Furnished' : 'Unfurnished';
        break;
      case 'parking':
        specs[spec] = randomBool() ? 'Available' : 'Not Available';
        break;
      case 'brand':
        specs[spec] = randomItem(['Toyota', 'Honda', 'Suzuki', 'Canon', 'Nikon', 'Sony']);
        break;
      case 'model':
        specs[spec] = `Model-${randomNumber(100, 999)}`;
        break;
      case 'year':
        specs[spec] = randomNumber(2010, 2024);
        break;
      case 'mileage':
        specs[spec] = `${randomNumber(5000, 150000)} km`;
        break;
      case 'transmission':
        specs[spec] = randomItem(['Automatic', 'Manual']);
        break;
      case 'fuel':
        specs[spec] = randomItem(['Petrol', 'Diesel', 'Hybrid', 'Electric']);
        break;
      case 'size':
        specs[spec] = randomItem(['S', 'M', 'L', 'XL', 'XXL']);
        break;
      case 'color':
        specs[spec] = randomItem(['Red', 'Blue', 'Black', 'White', 'Green', 'Gold']);
        break;
      case 'material':
        specs[spec] = randomItem(['Cotton', 'Silk', 'Wool', 'Polyester', 'Leather']);
        break;
      case 'condition':
        specs[spec] = randomItem(['Excellent', 'Very Good', 'Good', 'Fair']);
        break;
      default:
        specs[spec] = `${spec}-value`;
    }
  });
  
  return specs;
}

// ==================== DATA GENERATORS ====================

async function generateUsers() {
  console.log(`\n📝 Generating ${CONFIG.users} users...`);
  const users = [];
  
  // Hash the default password once
  const hashedPassword = await bcrypt.hash(CONFIG.defaultPassword, 10);
  
  for (let i = 0; i < CONFIG.users; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const location = randomItem(pakistaniCities);
    const accountType = randomBool(0.3) ? 'paid' : 'free'; // 30% paid accounts
    const hasMultipleRoles = randomBool(0.4); // 40% have both roles
    
    const user = {
      firstName,
      lastName,
      email: generateEmail(firstName, lastName),
      phoneNumber: generatePhoneNumber(),
      password: hashedPassword, // Use pre-hashed password
      profileImage: randomBool(0.6) ? `https://i.pravatar.cc/150?img=${i + 1}` : null,
      bio: randomBool(0.5) ? `Experienced ${randomBool() ? 'lister' : 'borrower'} with ${randomNumber(1, 10)} years of experience.` : null,
      address: {
        street: `Street ${randomNumber(1, 100)}, Block ${randomItem(['A', 'B', 'C', 'D'])}`,
        city: location.city,
        province: location.province,
        postalCode: `${randomNumber(10000, 99999)}`,
        country: 'Pakistan'
      },
      accountType,
      subscriptionExpiry: accountType === 'paid' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      emailVerified: randomBool(0.8),
      phoneVerified: randomBool(0.7),
      idVerified: accountType === 'paid' ? randomBool(0.9) : randomBool(0.3),
      faceVerified: accountType === 'paid' ? randomBool(0.7) : false,
      fingerprintVerified: accountType === 'paid' ? randomBool(0.5) : false,
      roles: hasMultipleRoles ? ['borrower', 'lister'] : [randomBool(0.7) ? 'borrower' : 'lister'],
      overallRating: randomFloat(3.5, 5),
      reviewCount: randomNumber(0, 50),
      totalListings: randomNumber(0, 10),
      totalBookings: randomNumber(0, 20),
      totalEarnings: randomNumber(0, 100000),
      language: randomBool(0.8) ? 'en' : 'ur',
      lastLogin: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
    };
    
    users.push(user);
  }
  
  const savedUsers = await User.insertMany(users);
  console.log(`✅ Created ${savedUsers.length} users`);
  return savedUsers;
}

async function generateListings(users) {
  console.log(`\n📝 Generating ${CONFIG.listings} listings...`);
  const listings = [];
  
  // Get users who can be listers (have 'lister' role or will get it)
  const owners = users.filter(user => user.roles.includes('lister') || randomBool(0.3));
  
  for (let i = 0; i < CONFIG.listings; i++) {
    const owner = randomItem(owners);
    const category = randomItem(categories);
    const location = randomItem(pakistaniCities);
    const accountType = owner.accountType;
    const coordinates = generateCoordinates(location.city);
    const pricingModel = randomItem(pricingModels);
    
    const listing = {
      title: `${randomItem(category.subCategories)} for Rent in ${location.city}`,
      description: `Quality ${category.name} available for rent. Well-maintained and reliable. Perfect for your needs. Contact for more details and viewing arrangements. ${randomBool() ? 'Available immediately.' : 'Advance booking required.'}`,
      category: category.name,
      subCategory: randomItem(category.subCategories),
      owner: owner._id,
      pricing: {
        amount: (() => {
          switch(pricingModel) {
            case 'hourly': return randomNumber(500, 5000);
            case 'daily': return randomNumber(2000, 20000);
            case 'weekly': return randomNumber(10000, 100000);
            case 'monthly': return randomNumber(30000, 500000);
          }
        })(),
        currency: 'PKR',
        pricingModel
      },
      availability: {
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        bookedDates: []
      },
      location: {
        address: `${randomNumber(1, 500)}, ${randomItem(['Main Boulevard', 'Park Road', 'Mall Road', 'GT Road', 'Stadium Road'])}`,
        city: location.city,
        province: location.province,
        coordinates: {
          type: 'Point',
          coordinates: coordinates
        },
        serviceRadius: randomNumber(5, 50)
      },
      images: Array(randomNumber(3, 8)).fill(null).map((_, idx) => ({
        url: `https://picsum.photos/800/600?random=${i * 10 + idx}`,
        publicId: `listing_${i}_${idx}`,
        uploadedAt: new Date()
      })),
      specifications: generateSpecifications(category.name),
      isActive: randomBool(0.9),
      status: 'active',
      accountType,
      freeAccountExpiresAt: accountType === 'free' ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null,
      paidAccountExpiresAt: accountType === 'paid' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      isVerified: accountType === 'paid' ? randomBool(0.8) : randomBool(0.3),
      verifiedBadgeVisible: accountType === 'paid',
      rating: {
        average: randomFloat(3.5, 5),
        count: randomNumber(0, 50)
      },
      views: randomNumber(0, 1000),
      damagePolicy: 'Full responsibility of the borrower. Any damages must be compensated.',
      lostItemPolicy: 'Lost items must be replaced or compensated at market value.',
      disclaimers: [
        'All terms and conditions apply',
        'Advance payment required',
        'ID verification mandatory'
      ]
    };
    
    listings.push(listing);
  }
  
  const savedListings = await Listing.insertMany(listings);
  console.log(`✅ Created ${savedListings.length} listings`);
  return savedListings;
}

async function generateBookings(users, listings) {
  console.log(`\n📝 Generating ${CONFIG.bookings} bookings...`);
  const bookings = [];
  
  // Get borrowers
  const borrowers = users.filter(user => user.roles.includes('borrower'));
  
  for (let i = 0; i < CONFIG.bookings; i++) {
    const listing = randomItem(listings);
    const borrower = randomItem(borrowers.filter(u => u._id.toString() !== listing.owner.toString()));
    if (!borrower) continue;
    
    const startDate = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));
    const durationDays = randomNumber(1, 14);
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    const pricePerUnit = listing.pricing.amount;
    const units = durationDays;
    const subtotal = pricePerUnit * units;
    const platformFee = subtotal * 0.1;
    const tax = (subtotal + platformFee) * 0.17;
    const totalAmount = subtotal + platformFee + tax;
    
    const status = randomItem(['pending', 'confirmed', 'active', 'completed', 'cancelled']);
    const isCancelled = status === 'cancelled';
    
    const booking = {
      listing: listing._id,
      owner: listing.owner,
      borrower: borrower._id,
      bookingType: randomBool(0.7) ? 'instant' : 'request',
      status,
      startDate,
      endDate,
      rentalDuration: {
        value: durationDays,
        unit: 'days'
      },
      pricing: {
        pricePerUnit,
        units,
        subtotal,
        platformFee,
        tax,
        totalAmount,
        currency: 'PKR'
      },
      payment: {
        method: randomItem(paymentMethods),
        status: status === 'completed' ? 'completed' : status === 'cancelled' ? 'refunded' : 'pending',
        transactionId: `TXN${Date.now()}${randomNumber(1000, 9999)}`,
        paidAt: status !== 'pending' ? randomDate(startDate, new Date()) : null
      },
      cancellation: isCancelled ? {
        isCancelled: true,
        cancelledBy: randomItem(['owner', 'borrower']),
        cancelledAt: randomDate(startDate, new Date()),
        reason: randomItem(['Change of plans', 'Found alternative', 'Emergency', 'Owner unavailable']),
        refundPercentage: randomItem([0, 50, 100])
      } : {
        isCancelled: false
      },
      deliveryMethod: randomItem(deliveryMethods),
      pickupLocation: {
        address: listing.location.address,
        coordinates: {
          type: 'Point',
          coordinates: listing.location.coordinates.coordinates
        }
      },
      reminders: {
        confirmationSent: randomBool(0.8),
        reminderBeforeStartSent: randomBool(0.6),
        reminderBeforeEndSent: randomBool(0.4)
      },
      dispute: {
        isDisputed: randomBool(0.05), // 5% disputes
        description: randomBool(0.05) ? 'Item not as described' : undefined,
        status: randomBool(0.05) ? 'resolved' : undefined
      }
    };
    
    bookings.push(booking);
  }
  
  const savedBookings = await Booking.insertMany(bookings);
  console.log(`✅ Created ${savedBookings.length} bookings`);
  return savedBookings;
}

async function generateReviews(bookings) {
  console.log(`\n📝 Generating ${CONFIG.reviews} reviews...`);
  const reviews = [];
  
  // Only create reviews for completed bookings
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const reviewCount = Math.min(CONFIG.reviews, completedBookings.length);
  
  for (let i = 0; i < reviewCount; i++) {
    const booking = completedBookings[i];
    const reviewType = randomItem(['borrower_to_owner', 'owner_to_borrower']);
    
    const review = {
      booking: booking._id,
      listing: booking.listing,
      reviewerUser: reviewType === 'borrower_to_owner' ? booking.borrower : booking.owner,
      reviewedUser: reviewType === 'borrower_to_owner' ? booking.owner : booking.borrower,
      title: randomItem([
        'Great experience!',
        'Highly recommended',
        'Excellent service',
        'Very satisfied',
        'Good but could be better',
        'Amazing!',
        'Perfect rental'
      ]),
      description: randomItem([
        'Everything was smooth and professional. Highly recommended!',
        'Good experience overall. Would rent again.',
        'The item/service was exactly as described. Very satisfied.',
        'Prompt communication and excellent condition.',
        'Great value for money. Will definitely book again.',
        'Professional and reliable. No complaints.',
        'Exceeded my expectations. Fantastic!'
      ]),
      overallRating: randomFloat(3, 5, 1),
      categoryRating: booking.listing.category || 'general',
      detailedRatings: {
        cleanliness: randomNumber(3, 5),
        condition: randomNumber(3, 5),
        accuracy: randomNumber(3, 5),
        communication: randomNumber(4, 5),
        value: randomNumber(3, 5)
      },
      reviewType,
      isVisible: true,
      isVerified: randomBool(0.7),
      helpfulCount: randomNumber(0, 20),
      reportedCount: randomNumber(0, 2)
    };
    
    reviews.push(review);
  }
  
  const savedReviews = await Review.insertMany(reviews);
  console.log(`✅ Created ${savedReviews.length} reviews`);
  return savedReviews;
}

async function generateMessages(users, listings, bookings) {
  console.log(`\n📝 Generating ${CONFIG.messages} messages...`);
  const messages = [];
  
  for (let i = 0; i < CONFIG.messages; i++) {
    const user1 = randomItem(users);
    const user2 = randomItem(users.filter(u => u._id.toString() !== user1._id.toString()));
    const listing = randomItem(listings);
    const booking = randomBool(0.5) ? randomItem(bookings) : null;
    
    const conversationId = new mongoose.Types.ObjectId();
    
    const message = {
      conversationId,
      sender: user1._id,
      receiver: user2._id,
      listing: listing._id,
      booking: booking ? booking._id : null,
      content: randomItem([
        'Hi, is this still available?',
        'What are the pickup timings?',
        'Can we negotiate the price?',
        'I would like to book this for next week.',
        'Do you provide delivery?',
        'Is advance payment required?',
        'Can I see more pictures?',
        'What is the cancellation policy?',
        'Are you available for viewing?',
        'Thank you for the quick response!'
      ]),
      isRead: randomBool(0.6),
      readAt: randomBool(0.6) ? new Date() : null
    };
    
    messages.push(message);
  }
  
  const savedMessages = await Message.insertMany(messages);
  console.log(`✅ Created ${savedMessages.length} messages`);
  return savedMessages;
}

// ==================== MAIN SEEDING FUNCTION ====================

async function seedDatabase() {
  try {
    console.log('\n🌱 Starting database seeding...\n');
    console.log('Configuration:', CONFIG);
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-platform';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data if requested
    if (CONFIG.clearData) {
      console.log('\n🗑️  Clearing existing data...');
      await User.deleteMany({});
      await Listing.deleteMany({});
      await Booking.deleteMany({});
      await Review.deleteMany({});
      await Message.deleteMany({});
      console.log('✅ Database cleared');
    }
    
    // Generate data in sequence (to maintain relationships)
    const users = await generateUsers();
    const listings = await generateListings(users);
    const bookings = await generateBookings(users, listings);
    const reviews = await generateReviews(bookings);
    const messages = await generateMessages(users, listings, bookings);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`Users:     ${users.length}`);
    console.log(`Listings:  ${listings.length}`);
    console.log(`Bookings:  ${bookings.length}`);
    console.log(`Reviews:   ${reviews.length}`);
    console.log(`Messages:  ${messages.length}`);
    console.log('='.repeat(50));
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\n🔑 Test credentials:`);
    console.log(`   Email: Any user email from database`);
    console.log(`   Password: ${CONFIG.defaultPassword}`);
    console.log(`\n📝 Sample users:`);
    users.slice(0, 5).forEach(user => {
      console.log(`   - ${user.email} (${user.roles.join(', ')})`);
    });
    
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// ==================== RUN SEEDER ====================

seedDatabase();
