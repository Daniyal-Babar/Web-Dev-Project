/**
 * README - My Rental Marketplace
 * 
 * A comprehensive MERN stack web application for renting various items
 * across 8 categories in Pakistan.
 */

# My Rental Marketplace

## Overview

A full-stack rental marketplace platform serving 8 main categories:
- **Property**: Apartments, Houses, Commercial Spaces, Event Spaces, Farmhouses, Rooms
- **Vehicles**: Cars, Motorcycles, Bicycles, Trucks, Heavy Machinery
- **Clothes**: Wedding Wear, Designer Outfits, Seasonal Clothing, Accessories
- **Equipment**: Farming, Electronics, Medical, Kitchen, Sports, Gaming
- **Services**: Skilled Workers, Technical Staff, Event Staff, Drivers, Medical
- **Animals**: Pets, Working Animals, Veterinary Services
- **Boats**: Fishing, Passenger, Recreational, Cargo Vessels
- **Air Transport**: Charter Planes, Helicopters, Air Ambulance, Cargo Aircraft

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Validation**: Express Validator

### Frontend
- **Library**: React 18
- **Routing**: React Router v6
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Maps**: Leaflet + React Leaflet
- **Styling**: CSS/SCSS
- **Form Handling**: Formik + Yup
- **Icons**: Lucide React, React Icons
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Date Handling**: date-fns, React DatePicker

## Project Structure

```
Web-Dev-Project/
├── backend/
│   ├── controllers/            # Admin controller
│   ├── models/                 # Mongoose schemas (User, Listing, Booking, Review, Message, Payment, OTP, AdminLog)
│   ├── routes/                 # API routes (auth, user, listing, booking, review, payment, wallet, admin)
│   ├── middleware/             # Auth & admin middleware
│   ├── services/               # Email/SMS/PayRails services
│   ├── utils/                  # Validation, uploads, error handling
│   ├── server.js               # Express app entry
│   ├── package.json            # Backend dependencies/scripts
│   ├── seed.js                 # Database seeding script
│   └── .env.example            # Backend env template
│
└── frontend/
    ├── public/
    │   └── index.html          # React root HTML
    ├── src/
    │   ├── components/
    │   │   ├── layout/         # Footer
    │   │   ├── navigation/     # Navbar, BottomNav, ProfileMenu, etc.
    │   │   ├── filters/        # FilterPanel, CategorySelect, PriceRangeSlider, etc.
    │   │   ├── dashboard/      # Dashboard components (StatCard, EarningsChart, etc.)
    │   │   ├── theme/          # Theme switching
    │   │   ├── language/       # Language switching
    │   │   ├── BookingForm.js
    │   │   ├── CategoryGrid.js
    │   │   ├── HeroSection.js
    │   │   ├── ImageGallery.js
    │   │   ├── ListingCard.js
    │   │   ├── MapView.js
    │   │   ├── OwnerCard.js
    │   │   ├── ReviewSection.js
    │   │   └── ... (other components)
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── BrowseListings.js
    │   │   ├── ListingDetail.js
    │   │   ├── listing/
    │   │   │   ├── CreateListingPage.js
    │   │   │   └── components/  # Multi-step form components
    │   │   ├── MyBookings.js
    │   │   ├── MyListings.js
    │   │   ├── MyProfile.js
    │   │   ├── EarningsDashboard.js
    │   │   ├── CheckoutPageNew.js
    │   │   ├── PaymentSuccess.js
    │   │   ├── PaymentFailed.js
    │   │   ├── AdminDashboard.js
    │   │   ├── AdminUserListings.js
    │   │   ├── NotFoundPage.js
    │   │   └── auth/
    │   │       ├── LoginPage.js
    │   │       └── RegisterPage.js
    │   ├── services/           # api.js, payment.js
    │   ├── store/              # Redux slices (auth, listing, booking)
    │   ├── fonts/              # Poppins font family
    │   ├── App.js              # Route configuration
    │   ├── index.js            # React entry point
    │   └── index.css           # Global styles
    ├── package.json            # Frontend dependencies/scripts
    └── package-lock.json

```

## Key Features

### User Management
- Dual-role accounts (Owner/Borrower)
- Email & Phone verification via SMS
- Profile verification for top-ranked results
- Rating & review system per category
- Account types: Free (48hr display) vs Paid (monthly subscription)

### Listing System
- Dynamic fields based on category selection
- Image/video uploads to Cloudinary
- Multiple pricing models (hourly, daily, weekly, monthly)
- Availability calendar
- Location-based services with map integration
- Free account listings expire after 48 hours
- Paid account listings display for 1 month

### Booking & Payment
- Instant booking vs request-based booking
- Payment integration: JazzCash, Easypaisa, Cards
- Secure messaging between users
- Flexible cancellation policies
- Booking confirmation & reminders

### Trust & Safety
- ID, Email, Phone, Face, Fingerprint verification (for paid users)
- Category-specific safety guidelines
- Dispute resolution center
- Ad management (free: 48hr + random ads; paid: full month, no ads)

### Search & Discovery
- Category-specific filters
- Geographic search radius
- Price range filters
- Date availability matching
- Keyword search with context
- Sorting: newest, popular, price
- Grid and Map view modes
- Responsive filter panel (desktop sidebar / mobile sheet)

### Wallet & Earnings
- Owner wallet system with balance tracking
- Automatic earnings credit on booking completion
- Transaction history and analytics
- Withdrawal requests to Easypaisa
- Monthly earnings breakdown
- Earnings dashboard with charts

### Admin Dashboard
- User management (view, suspend, ban)
- Listing management (approve, delete, status updates)
- Platform statistics and analytics
- User listing overview
- Admin activity logging

### Payment Processing
- PayRails integration for secure payments
- Multiple payment methods: JazzCash, Easypaisa, Cards
- OTP verification for transactions
- Payment status tracking
- Automatic wallet crediting on completion

### UI/UX Features
- Responsive design (mobile-first approach)
- Dark/Light theme switching
- Multi-language support (language switching component)
- Modern hero section with command-style search
- Interactive category cards
- Loading skeletons for better perceived performance
- Empty states with helpful messages
- Smooth animations with Framer Motion
- Accessible components with ARIA labels
- Mobile navigation with bottom nav bar

## Installation & Setup

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your configuration

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/rental_marketplace
JWT_SECRET=your_secret_key
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Integration
PAYRAILS_API_KEY=your_payrails_api_key
PAYRAILS_SECRET_KEY=your_payrails_secret
JAZZCASH_MERCHANT_ID=your_merchant_id
EASYPAISA_MERCHANT_ID=your_easypaisa_merchant_id

# SMS Services (Pakistani SMS or Twilio)
SMS_PROVIDER=pakistani  # or 'twilio'
SMS_API_KEY=your_sms_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Email Service
EMAIL_SERVICE=gmail  # or other provider
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/verify-phone` - Verify phone number

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/me/profile` - Get current user profile
- `PUT /api/users/:id` - Update profile
- `POST /api/users/:id/subscribe` - Subscribe to paid plan

### Listings
- `GET /api/listings` - Search listings with filters
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Bookings
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/user/my-bookings` - Get user's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/confirm` - Confirm booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Reviews
- `GET /api/reviews/listing/:listingId` - Get listing reviews
- `GET /api/reviews/user/:userId` - Get user reviews
- `POST /api/reviews` - Create review
- `POST /api/reviews/:id/response` - Add owner response

### Wallet & Earnings
- `GET /api/wallet/balance` - Get wallet balance and earnings summary
- `GET /api/wallet/transactions` - Get transaction history
- `GET /api/wallet/earnings-by-month` - Get monthly earnings breakdown
- `GET /api/wallet/statistics` - Get comprehensive wallet statistics
- `POST /api/wallet/withdraw` - Request withdrawal to Easypaisa
- `POST /api/wallet/add-easypaisa-account` - Add Easypaisa account
- `POST /api/wallet/send-easypaisa-otp` - Send OTP for withdrawal
- `POST /api/wallet/verify-easypaisa-otp` - Verify OTP and complete withdrawal
- `POST /api/wallet/credit-owner` - Credit owner wallet (internal)

### Payments
- `POST /api/payments/create` - Create payment session
- `POST /api/payments/verify` - Verify payment status
- `GET /api/payments/:id` - Get payment details

### Admin (Protected)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user details
- `GET /api/admin/users/:userId/listings` - Get user's listings
- `PATCH /api/admin/users/:userId/status` - Update user status
- `GET /api/admin/listings` - Get all listings
- `DELETE /api/admin/listings/:listingId` - Delete listing
- `PATCH /api/admin/listings/:listingId/status` - Update listing status
- `GET /api/admin/stats` - Get platform statistics

## Development Notes

### Code Comments
Every file includes comprehensive comments explaining:
- File purpose
- Function/Component responsibilities
- Important business logic
- API endpoints and parameters
- Protected routes and authentication

### Authentication Flow
1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Included in all protected requests via Authorization header
5. Token validated by middleware

### Database Models
- **User**: Handles both owner and borrower roles, includes wallet system
- **Listing**: Flexible schema supports 8 categories with dynamic fields
- **Booking**: Tracks rental transactions with payment details and status
- **Review**: Category-specific ratings visible only for paid accounts
- **Message**: Secure user communication
- **Payment**: Payment transaction records and status tracking
- **OTP**: One-time passwords for phone/email verification and withdrawals
- **AdminLog**: Admin activity logging for audit trails

### Pricing Calculation
- Base: `amount × units`
- Platform fee: 10% of subtotal
- Tax: 17% GST for Pakistan
- Total: subtotal + fee + tax

### Wallet & Earnings Flow
1. Borrower pays → Money held in platform's PayRails account
2. Booking completes → Owner's wallet credited (amount - platform fee)
3. Owner requests withdrawal → OTP sent to registered phone
4. OTP verified → Funds transferred to Easypaisa account

### Admin Features
- User management with status controls (active, suspended, banned)
- Listing moderation (approve, reject, delete)
- Platform analytics and statistics
- Activity logging for audit trails
- Access to user listings and booking history

## Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
npm run seed:small # Seed with 10 users, 20 listings, 10 bookings
npm run seed:large # Seed with 100 users, 200 listings, 150 bookings
npm run seed:verify # Verify seeded data
npm run export:users # Export users to CSV
```

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## Future Enhancements

- [x] Admin dashboard
- [x] Wallet system
- [x] Earnings dashboard
- [x] Payment integration (PayRails)
- [x] Theme switching
- [x] Language switching
- [ ] Urdu language support (UI)
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered recommendations
- [ ] Insurance options for rentals
- [ ] Buyer protection guarantee
- [ ] Video chat support

## License

ISC

## Contact

For inquiries, contact: support@rentalmarketplace.pk
