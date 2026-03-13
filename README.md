# Digi-PAY

A modern digital wallet application built with the MERN stack. Digi-PAY allows users to send and receive money, manage their wallet, and perform various financial transactions.

## Features

### Authentication
- User Registration with name, email, phone number, and password
- Secure Login with JWT tokens
- Profile Management - view and edit user information
- Phone Verification via Twilio SMS

### Wallet Management
- View current wallet balance
- Unique account number for each user
- Complete transaction history

### Send Money
- Send money using recipient's account number or phone number
- QR Code Scanning for quick transfers
- Add notes to transactions

### Receive Money
- QR Code Display for receiving money
- Transaction list with filtering and search

### Top Up
- Add money from bank card using Stripe
- Multiple payment options

### Notifications
- SMS alerts for transactions via Twilio
- In-app notifications with unread counter

### User Interface
- Modern dark theme design
- Responsive for mobile and desktop
- Real-time updates with React Query

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/digi-pay.git

# Navigate to the project directory
cd Digi-PAY
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your credentials:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# TWILIO_ACCOUNT_SID=your_twilio_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_PHONE_NUMBER=your_twilio_phone_number
# STRIPE_SECRET_KEY=your_stripe_secret_key
# PORT=5000

# Start the backend server
npm run dev
```

### Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/digi-pay

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key

# Server
PORT=5000
NODE_ENV=development
```

## Available Scripts

### Backend
```bash
npm run dev      # Start development server
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with ❤️ using MERN Stack
