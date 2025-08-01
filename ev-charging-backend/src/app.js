// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Route imports
const authRoutes = require('./routes/auth');
const chargerRoutes = require('./routes/chargers');
const bookingRoutes = require('./routes/booking'); // Added booking routes

const app = express();

// Custom logging middleware for development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
      );
    });
    next();
  });
}

// Enhanced Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Enhanced Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // More lenient in development
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Enhanced CORS configuration - keeping your working Vercel domain
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://ev-charger-ybd8.vercel.app', // Your working Vercel frontend
      ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : [])
    ] 
  : [
      'http://localhost:3000',    // Create React App default
      'http://localhost:5173',    // Vite default
      'http://localhost:8080',    // Vue CLI default
      'http://localhost:4200',    // Angular CLI default
      'http://127.0.0.1:3000',    // Alternative localhost
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:4200',
      'https://ev-charger-ybd8.vercel.app' // Allow Vercel in dev too for testing
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin'
  ],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Enhanced Body parser middleware with error handling
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf, encoding) => {
      try {
        JSON.parse(buf);
      } catch (err) {
        res.status(400).json({
          success: false,
          message: "Invalid JSON format",
        });
        throw new Error("Invalid JSON");
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Enhanced request logging for debugging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'none'} - ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chargers', chargerRoutes);
app.use('/api/bookings', bookingRoutes); // Added booking routes

// Enhanced Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EV Charging Station API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cors: {
      allowedOrigins: allowedOrigins,
      environment: process.env.NODE_ENV
    }
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EV Charging Station API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "User registration",
        "POST /api/auth/login": "User login",
        "GET /api/auth/profile": "Get user profile",
        "PUT /api/auth/profile": "Update user profile",
      },
      chargers: {
        "GET /api/chargers": "Get all charging stations",
        "GET /api/chargers/:id": "Get charging station by ID",
        "POST /api/chargers": "Create new charging station (Admin)",
        "PUT /api/chargers/:id": "Update charging station (Admin)",
        "DELETE /api/chargers/:id": "Delete charging station (Admin)",
      },
      bookings: {
        "GET /api/bookings": "Get user bookings",
        "POST /api/bookings": "Create new booking",
        "GET /api/bookings/:id": "Get booking by ID",
        "PUT /api/bookings/:id": "Update booking",
        "DELETE /api/bookings/:id": "Cancel booking",
      },
      health: {
        "GET /health": "Health check endpoint",
      },
    },
  });
});

// Enhanced 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      "GET /health",
      "GET /api",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/chargers",
      "POST /api/bookings",
    ],
  });
});

// Enhanced Global error handler
app.use((err, req, res, next) => {
  console.error(`❌ Error on ${req.method} ${req.path}:`, err.stack);
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation - origin not allowed',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
});

module.exports = app;