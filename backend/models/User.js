const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, select: false },
  profileImage: { type: String, default: null },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: { type: String, default: 'Pakistan' }
  },
  accountType: { type: String, enum: ['free', 'paid'], default: 'free' },
  subscriptionExpiry: { type: Date, default: null },

  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  idVerified: { type: Boolean, default: false },
  faceVerified: { type: Boolean, default: false },
  fingerprintVerified: { type: Boolean, default: false },

  roles: [{ type: String, enum: ['borrower', 'lister'], default: 'borrower' }],

  admin: { type: Boolean, default: false, index: true },
  accountStatus: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  adminNotes: { type: String, default: '' },

  overallRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },

  totalListings: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },

  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'PKR' },
    transactions: { type: Array, default: [] }
  },

  language: { type: String, default: 'en' },
  notificationPreferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true }
  },

  lastLogin: { type: Date, default: null }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Public profile
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phoneNumber: this.phoneNumber,
    profileImage: this.profileImage,
    accountType: this.accountType,
    subscriptionExpiry: this.subscriptionExpiry,
    emailVerified: this.emailVerified,
    phoneVerified: this.phoneVerified,
    idVerified: this.idVerified,
    faceVerified: this.faceVerified,
    fingerprintVerified: this.fingerprintVerified,
    roles: this.roles,
    admin: this.admin,
    accountStatus: this.accountStatus,
    adminNotes: this.adminNotes,
    overallRating: this.overallRating,
    reviewCount: this.reviewCount,
    totalListings: this.totalListings,
    totalBookings: this.totalBookings,
    totalEarnings: this.totalEarnings,
    wallet: this.wallet,
    language: this.language,
    notificationPreferences: this.notificationPreferences,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    address: this.address
  };
};

module.exports = mongoose.model('User', userSchema);
