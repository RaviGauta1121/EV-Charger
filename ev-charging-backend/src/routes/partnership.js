const express = require('express');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const Partnership = require('../models/Partnerships');

const router = express.Router();

// Form submission rate limiting (more restrictive)
const formLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 form submissions per 5 minutes
  message: {
    success: false,
    message: 'Too many form submissions, please try again in 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General rate limiter for read operations
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Validation middleware
const validatePartnershipData = (req, res, next) => {
  const { name, email, phone, propertyType, address, agreeTerms } = req.body;
  const errors = {};
  
  // Required fields validation
  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required';
  }
  
  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }
  
  if (!phone || phone.trim().length === 0) {
    errors.phone = 'Phone number is required';
  }
  
  if (!propertyType) {
    errors.propertyType = 'Property type is required';
  }
  
  if (!address || address.trim().length === 0) {
    errors.address = 'Address is required';
  }
  
  if (!agreeTerms) {
    errors.agreeTerms = 'You must agree to terms and conditions';
  }
  
  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

// Helper function to get client IP and user agent
const getClientInfo = (req) => {
  const ipAddress = req.ip || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress || 
                   (req.connection.socket ? req.connection.socket.remoteAddress : null) || 
                   req.headers['x-forwarded-for'] || 
                   'unknown';
  
  const userAgent = req.get('User-Agent') || 'unknown';
  
  return { ipAddress, userAgent };
};

// @route   POST /api/partnerships
// @desc    Submit partnership form
// @access  Public
router.post('/', formLimiter, validatePartnershipData, async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      propertyType,
      address,
      parkingSpaces,
      timeline,
      message,
      agreeTerms
    } = req.body;
    
    // Check for duplicate email within last 24 hours
    const recentSubmission = await Partnership.findOne({
      email: email.toLowerCase().trim(),
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    if (recentSubmission) {
      return res.status(409).json({
        success: false,
        message: 'A partnership request with this email was already submitted within the last 24 hours',
        submissionId: recentSubmission._id
      });
    }
    
    // Get client info
    const { ipAddress, userAgent } = getClientInfo(req);
    
    // Create new partnership request
    const partnershipData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      propertyType,
      address: address.trim(),
      agreeTerms,
      ipAddress,
      userAgent
    };
    
    // Add optional fields if provided
    if (company) partnershipData.company = company.trim();
    if (parkingSpaces) partnershipData.parkingSpaces = parseInt(parkingSpaces);
    if (timeline) partnershipData.timeline = timeline;
    if (message) partnershipData.message = message.trim();
    
    const partnership = new Partnership(partnershipData);
    await partnership.save();
    
    console.log(`✅ New partnership request received from ${email} (ID: ${partnership._id})`);
    
    // Send success response (don't include sensitive data)
    res.status(201).json({
      success: true,
      message: 'Partnership request submitted successfully! We will contact you within 24 hours.',
      data: {
        id: partnership._id,
        name: partnership.name,
        email: partnership.email,
        propertyType: partnership.propertyType,
        status: partnership.status,
        priority: partnership.priority,
        submittedAt: partnership.createdAt
      }
    });
    
    // Here you could add email notification logic
    // await sendNotificationEmail(partnership);
    
  } catch (error) {
    console.error('❌ Error saving partnership request:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// @route   GET /api/partnerships
// @desc    Get all partnerships with pagination and filtering
// @access  Private (add auth middleware as needed)
router.get('/', readLimiter, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
    const status = req.query.status;
    const propertyType = req.query.propertyType;
    const priority = req.query.priority;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const search = req.query.search;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (propertyType) {
      filter.propertyType = propertyType;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const partnerships = await Partnership.find(filter)
      .select('-ipAddress -userAgent') // Hide sensitive info
      .populate('assignedTo', 'name email') // Populate assigned user if exists
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Partnership.countDocuments(filter);
    
    res.json({
      success: true,
      data: partnerships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filter: {
        status,
        propertyType,
        priority,
        search
      }
    });
  } catch (error) {
    console.error('❌ Error fetching partnerships:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/partnerships/stats
// @desc    Get partnership statistics
// @access  Private
router.get('/stats', readLimiter, async (req, res) => {
  try {
    const stats = await Partnership.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching partnership stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/partnerships/:id
// @desc    Get partnership by ID
// @access  Private
router.get('/:id', readLimiter, async (req, res) => {
  try {
    const partnership = await Partnership.findById(req.params.id)
      .select('-ipAddress -userAgent')
      .populate('assignedTo', 'name email');
    
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found'
      });
    }
    
    res.json({
      success: true,
      data: partnership
    });
  } catch (error) {
    console.error('❌ Error fetching partnership:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid partnership ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PATCH /api/partnerships/:id/status
// @desc    Update partnership status
// @access  Private
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'contacted', 'in-progress', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: pending, contacted, in-progress, completed, rejected'
      });
    }
    
    const partnership = await Partnership.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(req.body.notes && { notes: req.body.notes }),
        ...(req.body.followUpDate && { followUpDate: new Date(req.body.followUpDate) }),
        ...(req.body.assignedTo && { assignedTo: req.body.assignedTo })
      },
      { new: true, runValidators: true }
    ).select('-ipAddress -userAgent')
     .populate('assignedTo', 'name email');
    
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Partnership updated successfully',
      data: partnership
    });
  } catch (error) {
    console.error('❌ Error updating partnership:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid partnership ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PATCH /api/partnerships/:id
// @desc    Update partnership details
// @access  Private
router.patch('/:id', async (req, res) => {
  try {
    const allowedUpdates = ['notes', 'followUpDate', 'assignedTo', 'priority', 'status'];
    const updates = {};
    
    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    const partnership = await Partnership.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-ipAddress -userAgent')
     .populate('assignedTo', 'name email');
    
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Partnership updated successfully',
      data: partnership
    });
  } catch (error) {
    console.error('❌ Error updating partnership:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid partnership ID'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/partnerships/:id
// @desc    Delete partnership (soft delete by changing status)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const partnership = await Partnership.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', notes: 'Deleted by admin' },
      { new: true }
    );
    
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Partnership request deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting partnership:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid partnership ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/partnerships/export/csv
// @desc    Export partnerships to CSV
// @access  Private
router.get('/export/csv', async (req, res) => {
  try {
    const partnerships = await Partnership.find({})
      .select('-ipAddress -userAgent -__v')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    // Convert to CSV format
    const csvHeader = 'ID,Name,Company,Email,Phone,Property Type,Address,Parking Spaces,Timeline,Message,Status,Priority,Assigned To,Created At,Updated At\n';
    
    const csvData = partnerships.map(p => {
      return [
        p._id,
        `"${p.name}"`,
        `"${p.company || ''}"`,
        p.email,
        p.phone,
        p.propertyType,
        `"${p.address}"`,
        p.parkingSpaces || '',
        p.timeline || '',
        `"${(p.message || '').replace(/"/g, '""')}"`,
        p.status,
        p.priority,
        p.assignedTo ? p.assignedTo.name : '',
        p.createdAt.toISOString(),
        p.updatedAt.toISOString()
      ].join(',');
    }).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=partnerships.csv');
    res.send(csvHeader + csvData);
    
  } catch (error) {
    console.error('❌ Error exporting partnerships:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
});

module.exports = router;