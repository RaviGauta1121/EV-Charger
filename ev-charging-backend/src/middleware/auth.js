// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Add debugging logs
  console.log('🔍 AUTH MIDDLEWARE - Request received');
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🔑 Authorization header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('🎫 Token extracted:', token ? 'YES' : 'NO');
    console.log('🎫 Token length:', token ? token.length : 0);
    console.log('🎫 Token preview:', token ? token.substring(0, 30) + '...' : 'NONE');
  } else {
    console.log('❌ No Bearer token found in Authorization header');
    console.log('Available headers:', Object.keys(req.headers));
  }

  if (!token) {
    console.log('❌ STOPPING: No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - no token'
    });
  }

  try {
    // Check if JWT_SECRET exists
    console.log('🔐 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔐 JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    if (!process.env.JWT_SECRET) {
      console.log('❌ CRITICAL: JWT_SECRET is missing from environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully');
    console.log('👤 User ID from token:', decoded.id);
    console.log('⏰ Token expires:', new Date(decoded.exp * 1000));
    console.log('⏰ Current time:', new Date());
    console.log('⏰ Is expired?', Date.now() >= decoded.exp * 1000);

    const user = await User.findById(decoded.id);
    console.log('🔍 Database query for user ID:', decoded.id);
    console.log('👤 User found in DB:', !!user);
    
    if (user) {
      console.log('✅ User details:', {
        id: user._id,
        email: user.email,
        role: user.role
      });
    }

    if (!user) {
      console.log('❌ STOPPING: User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    console.log('✅ Auth successful, proceeding to next middleware');
    next();

  } catch (error) {
    console.log('❌ JWT VERIFICATION FAILED');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Full error:', error);

    // Provide specific error messages
    let errorMessage = 'Not authorized to access this route';
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired, please login again';
      console.log('❌ REASON: Token expired at', new Date(error.expiredAt));
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token signature';
      console.log('❌ REASON: Invalid token - possibly wrong JWT_SECRET');
    } else if (error.name === 'NotBeforeError') {
      errorMessage = 'Token not active yet';
      console.log('❌ REASON: Token not yet valid');

    }

    return res.status(401).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin only access
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 AUTHORIZATION CHECK');
    console.log('👤 User role:', req.user?.role);
    console.log('🎯 Required roles:', roles);
    
    if (!roles.includes(req.user.role)) {
      console.log('❌ AUTHORIZATION FAILED');
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    console.log('✅ Authorization successful');
    next();
  };
};

module.exports = { protect, authorize };