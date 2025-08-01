// // src/app.js
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');

// // Route imports
// const authRoutes = require('./routes/auth');
// const chargerRoutes = require('./routes/chargers');

// const app = express();

// // Security middleware
// app.use(helmet());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// // CORS configuration - Fixed to include Vite's default port
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? ['https://yourdomain.com']
//     : [
//         'http://localhost:3000',    // Create React App default
//         'http://localhost:5173',   // Vite default
//         'http://localhost:8080',   // Vue CLI default
//         'http://localhost:4200'    // Angular CLI default
//       ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

// // Body parser middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/chargers', chargerRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'EV Charging Station API is running!',
//     timestamp: new Date().toISOString()
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : {}
//   });
// });

// module.exports = app;

// // src/app.js
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');

// // Route imports
// const authRoutes = require('./routes/auth');
// const chargerRoutes = require('./routes/chargers');

// const app = express();

// // Security middleware
// app.use(helmet());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// // CORS configuration - Temporary broad access for testing
// app.use(cors({
//   origin: true, // Allows any origin - ONLY for testing
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

// // Keep service awake on Render free tier
// if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
//   const keepAlive = () => {
//     fetch(process.env.RENDER_EXTERNAL_URL + '/health')
//       .then(res => console.log('Keep-alive ping successful'))
//       .catch(err => console.log('Keep-alive ping failed:', err.message));
//   };

//   // Ping every 14 minutes
//   setInterval(keepAlive, 14 * 60 * 1000);
// }

// // Body parser middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/chargers', chargerRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'EV Charging Station API is running!',
//     timestamp: new Date().toISOString()
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : {}
//   });
// });

// module.exports = app;

// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Route imports
const authRoutes = require("./routes/auth");
const chargerRoutes = require("./routes/chargers");
const bookingRoutes = require("./routes/booking");

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

// Security middleware
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

// Rate limiting
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

// CORS configuration - Updated to include more common development ports
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins =
        process.env.NODE_ENV === "production"
          ? (process.env.CLIENT_URL || "https://yourdomain.com").split(",")
          : [
              "http://localhost:3000", // Create React App default
              "http://localhost:5173", // Vite default
              "http://localhost:8080", // Vue CLI default
              "http://localhost:4200", // Angular CLI default
              "http://127.0.0.1:3000",
              "http://127.0.0.1:5173",
              "http://127.0.0.1:8080",
              "http://127.0.0.1:4200",
            ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

// Body parser middleware with enhanced error handling
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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chargers", chargerRoutes);
app.use("/api/bookings", bookingRoutes);

// Health check endpoint with more details
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EV Charging Station API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
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

// 404 handler for undefined routes
app.use("*", (req, res) => {
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

// Global error handler
app.use((err, req, res, next) => {
  console.error(`❌ Error on ${req.method} ${req.path}:`, err.stack);

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
