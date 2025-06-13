// src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔍 MongoDB URI:', process.env.MONGODB_URI);
    
    // More permissive connection options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options that might cause issues
      // useNewUrlParser and useUnifiedTopology are default in newer versions
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.log('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // More specific error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MongoDB is not running. Please start MongoDB service.');
      console.log('💡 Or check if MONGODB_URI in .env is correct.');
    }
    
    if (error.message.includes('authentication')) {
      console.log('💡 MongoDB authentication failed. Check username/password.');
    }
    
    throw error; // Re-throw to be caught by server startup
  }
};

module.exports = connectDB;