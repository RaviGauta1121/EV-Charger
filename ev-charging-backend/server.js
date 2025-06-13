// server.js
console.log('🚀 Starting EV Charging Backend...');

// Load environment variables first
require('dotenv').config();
console.log('✅ Environment variables loaded');
console.log('📍 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 PORT:', process.env.PORT);
console.log('📍 MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');
console.log('📍 JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✅' : 'Missing ❌');

const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

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
    });

    // Handle server errors
    server.on('error', (err) => {
      console.log('❌ Server error:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is already in use. Try a different port.`);
        process.exit(1);
      }
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