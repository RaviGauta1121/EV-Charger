// // server.js
// // ================================
// console.log('🚀 Starting EV Charging Backend...');

// // Load environment variables first
// require('dotenv').config();
// console.log('✅ Environment variables loaded');
// console.log('📍 NODE_ENV:', process.env.NODE_ENV);
// console.log('📍 PORT:', process.env.PORT);
// console.log('📍 MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');
// console.log('📍 JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✅' : 'Missing ❌');
// console.log('📍 STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set ✅' : 'Missing ❌');
// console.log('📍 CLIENT_URL:', process.env.CLIENT_URL ? 'Set ✅' : 'Missing ❌');

// const app = require('./src/app');
// const connectDB = require('./src/config/database');

// const PORT = process.env.PORT || 5000;

// // Validate required environment variables
// const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
// const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

// if (missingEnvVars.length > 0) {
//   console.error('❌ Missing required environment variables:', missingEnvVars);
//   process.exit(1);
// }

// // Add error handling for uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
//   console.log(err.name, err.message);
//   console.log(err.stack);
//   process.exit(1);
// });

// // Connect to MongoDB with error handling
// const startServer = async () => {
//   try {
//     console.log('🔌 Connecting to MongoDB...');
//     await connectDB();
    
//     console.log('🎯 Starting Express server...');
//     const server = app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`📱 Environment: ${process.env.NODE_ENV}`);
//       console.log(`🌐 Health check: http://localhost:${PORT}/health`);
//       console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
//     });

//     // Handle server errors
//     server.on('error', (err) => {
//       console.log('❌ Server error:', err.message);
//       if (err.code === 'EADDRINUSE') {
//         console.log(`❌ Port ${PORT} is already in use. Try a different port.`);
//         process.exit(1);
//       }
//     });

//     // Graceful shutdown
//     process.on('SIGTERM', () => {
//       console.log('👋 SIGTERM received. Shutting down gracefully...');
//       server.close(() => {
//         console.log('💤 Process terminated');
//         process.exit(0);
//       });
//     });

//   } catch (error) {
//     console.log('💥 Failed to start server:', error.message);
//     console.log(error.stack);
//     process.exit(1);
//   }
// };

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.log('💥 UNHANDLED REJECTION! Shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

// // Start the server
// startServer();



// server.js
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const bookingRoutes = require("./src/routes/booking");

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// app.use("/api/bookings", bookingRoutes);

// mongoose.connect("mongodb://localhost:27017/booking-system", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("MongoDB connected"))
// .catch(err => console.error("MongoDB error:", err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// // server.js
// // ================================
// console.log('🚀 Starting EV Charging Backend...');

// // Load environment variables first
// require('dotenv').config();
// console.log('✅ Environment variables loaded');
// console.log('📍 NODE_ENV:', process.env.NODE_ENV);
// console.log('📍 PORT:', process.env.PORT);
// console.log('📍 MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');
// console.log('📍 JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✅' : 'Missing ❌');
// console.log('📍 STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set ✅' : 'Missing ❌');
// console.log('📍 CLIENT_URL:', process.env.CLIENT_URL ? 'Set ✅' : 'Missing ❌');

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// // Express App
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// const bookingRoutes = require('./src/routes/booking');
// app.use('/api/bookings', bookingRoutes);

// // Health check route
// app.get('/health', (req, res) => {
//   res.status(200).send('✅ Server is healthy');
// });

// // Validate required environment variables
// const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
// const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

// if (missingEnvVars.length > 0) {
//   console.error('❌ Missing required environment variables:', missingEnvVars);
//   process.exit(1);
// }

// // MongoDB Connection
// const connectDB = async () => {
//   try {
//     console.log('🔌 Connecting to MongoDB...');
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('✅ MongoDB connected successfully');
//   } catch (err) {
//     console.error('❌ MongoDB connection failed:', err.message);
//     process.exit(1);
//   }
// };

// // Uncaught Exceptions
// process.on('uncaughtException', (err) => {
//   console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
//   console.log(err.name, err.message);
//   console.log(err.stack);
//   process.exit(1);
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// const startServer = async () => {
//   try {
//     await connectDB();

//     const server = app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🌐 Health check: http://localhost:${PORT}/health`);
//       console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
//     });

//     // Server error
//     server.on('error', (err) => {
//       console.log('❌ Server error:', err.message);
//       if (err.code === 'EADDRINUSE') {
//         console.log(`❌ Port ${PORT} is already in use. Try a different port.`);
//         process.exit(1);
//       }
//     });

//     // Graceful shutdown
//     process.on('SIGTERM', () => {
//       console.log('👋 SIGTERM received. Shutting down gracefully...');
//       server.close(() => {
//         console.log('💤 Process terminated');
//         process.exit(0);
//       });
//     });

//   } catch (err) {
//     console.log('💥 Failed to start server:', err.message);
//     console.log(err.stack);
//     process.exit(1);
//   }
// };

// // Unhandled Promise Rejections
// process.on('unhandledRejection', (err) => {
//   console.log('💥 UNHANDLED REJECTION! Shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

// startServer();



// server.js
// ================================
console.log('🚀 Starting EV Charging Backend...');

// Load environment variables first
require('dotenv').config();
console.log('✅ Environment variables loaded');
console.log('📍 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 PORT:', process.env.PORT);
console.log('📍 MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');
console.log('📍 JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✅' : 'Missing ❌');
console.log('📍 STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set ✅' : 'Missing ❌');
console.log('📍 CLIENT_URL:', process.env.CLIENT_URL ? 'Set ✅' : 'Missing ❌');

const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Add error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

// Connect to MongoDB with error handling
const startServer = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    
    console.log('🎯 Starting Express server...');
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📚 Available routes:`);
      console.log(`   - POST /api/auth/register`);
      console.log(`   - POST /api/auth/login`);
      console.log(`   - GET /api/chargers`);
      console.log(`   - POST /api/bookings`);
      console.log(`   - GET /api/bookings`);
    });

    // Handle server errors
    server.on('error', (err) => {
      console.log('❌ Server error:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is already in use. Try a different port.`);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.log('💥 Failed to start server:', error.message);
    console.log(error.stack);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('💥 UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Start the server
startServer();