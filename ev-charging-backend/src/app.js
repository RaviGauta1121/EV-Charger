// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// Route imports
const authRoutes = require('./routes/auth');
const chargerRoutes = require('./routes/chargers');
const app = express();
// Security middleware
app.use(helmet());
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// CORS configuration - Updated to include your Vercel domain
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://ev-charger-ybd8.vercel.app', // Your Vercel frontend
      'https://yourdomain.com' // Add other production domains here
    ] 
  : [
      'http://localhost:3000',    // Create React App default
      'http://localhost:5173',   // Vite default
      'http://localhost:8080',   // Vue CLI default
      'http://localhost:4200',   // Angular CLI default
      'https://ev-charger-ybd8.vercel.app' // Allow Vercel in dev too for testing
    ];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
// Handle preflight requests explicitly
app.options('', cors());
// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Add request logging for debugging
app.use((req, res, next) => {
  console.log(${req.method} ${req.path} - Origin: ${req.get('Origin') || 'none'});
  next();
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chargers', chargerRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EV Charging Station API is running!',
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      environment: process.env.NODE_ENV
    }
  });
});
// 404 handler
app.use('', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation - origin not allowed',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});
