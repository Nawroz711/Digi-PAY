# Digi-PAY

A modern digital wallet application built with the MERN stack (MongoDB, Express, React, Node.js). Digi-PAY allows users to send and receive money, manage their wallet, and perform various financial transactions.

## Features

### Authentication
- **User Registration** - Sign up with name, email, phone number, and password
- **User Login** - Secure authentication with JWT tokens
- **Profile Management** - View and edit user profile information
- **Phone Verification** - Phone number verification via Twilio SMS

### Wallet Management
- **Wallet Balance** - View current wallet balance
- **Account Number** - Each user gets a unique account number
- **Transaction History** - Complete history of all transactions

### Send Money
- **Send to Account Number** - Send money using recipient's account number
- **Send to Phone Number** - Send money using recipient's phone number
- **QR Code Scanning** - Scan recipient's QR code for quick transfers
- **Transaction Description** - Add notes to transactions

### Receive Money
- **QR Code Display** - Show your QR code for others to scan
- **Transaction List** - View all received transactions with filtering
- **Search & Filter** - Search transactions by name or account number

### Notifications
- **SMS Notifications** - Receive SMS alerts for transactions via Twilio
- **In-App Notifications** - View notifications within the app
- **Notification Badge** - Unread notification counter

### User Interface
- **Modern Dark Theme** - Sleek dark UI design
- **Responsive Design** - Works on mobile and desktop
- **Real-time Updates** - React Query for data synchronization
- **Loading States** - Smooth loading indicators

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **Lucide React** - Icons
- **react-qr-code** - QR code generation
- **@yudiel/react-qr-scanner** - QR code scanning

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Twilio** - SMS notifications
- **Bcrypt** - Password hashing

## Project Structure

```
Digi-PAY/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── index.js           # Server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── hooks/         # Custom React hooks
    │   ├── lib/           # Library configurations
    │   ├── pages/         # Page components
    │   ├── store/         # State management
    │   └── router/        # Route definitions
    ├── index.html
    └── package.json
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

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

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Environment Variables

### Backend (.env)

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/digi-pay

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Server
PORT=5000
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Transactions
- `GET /api/transaction` - Get user transactions
- `POST /api/transaction/send` - Send money
- `GET /api/transaction/:reference` - Get transaction by reference

### Wallet
- `GET /api/wallet` - Get user wallet

### Notifications
- `GET /api/notification` - Get user notifications
- `PUT /api/notification/:id/read` - Mark notification as read

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
