const mongoose = require('mongoose');
const validator = require('validator');

const partnershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please provide a valid phone number'
    }
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: {
      values: ['commercial', 'residential', 'retail', 'hotel', 'hospital', 'office', 'parking', 'other'],
      message: 'Invalid property type'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  parkingSpaces: {
    type: Number,
    min: [1, 'Parking spaces must be at least 1'],
    max: [10000, 'Parking spaces cannot exceed 10,000']
  },
  timeline: {
    type: String,
    enum: {
      values: ['immediate', 'short', 'medium', 'long', ''],
      message: 'Invalid timeline'
    }
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  agreeTerms: {
    type: Boolean,
    required: [true, 'You must agree to terms and conditions'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'You must agree to terms and conditions'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: 'website-footer'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming you have a User model
  },
  followUpDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
partnershipSchema.index({ email: 1 });
partnershipSchema.index({ createdAt: -1 });
partnershipSchema.index({ status: 1 });
partnershipSchema.index({ propertyType: 1 });
partnershipSchema.index({ assignedTo: 1 });

// Virtual for getting timeline in readable format
partnershipSchema.virtual('timelineText').get(function() {
  const timelineMap = {
    'immediate': 'Immediate (1-2 months)',
    'short': 'Short term (3-6 months)',
    'medium': 'Medium term (6-12 months)',
    'long': 'Long term (1+ years)'
  };
  return timelineMap[this.timeline] || 'Not specified';
});

// Virtual for getting property type in readable format
partnershipSchema.virtual('propertyTypeText').get(function() {
  const propertyMap = {
    'commercial': 'Commercial Building',
    'residential': 'Residential Complex',
    'retail': 'Shopping Center/Mall',
    'hotel': 'Hotel/Resort',
    'hospital': 'Hospital/Healthcare',
    'office': 'Office Complex',
    'parking': 'Parking Facility',
    'other': 'Other'
  };
  return propertyMap[this.propertyType] || this.propertyType;
});

// Static method to get partnership statistics
partnershipSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const propertyTypeStats = await this.aggregate([
    {
      $group: {
        _id: '$propertyType',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const recentCount = await this.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  
  const totalCount = await this.countDocuments();
  
  return {
    statusStats: stats,
    propertyTypeStats,
    recentSubmissions: recentCount,
    totalSubmissions: totalCount
  };
};

// Instance method to check if submission is recent
partnershipSchema.methods.isRecent = function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt >= oneDayAgo;
};

// Pre-save middleware to set priority based on property type and parking spaces
partnershipSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set priority based on business logic
    if (this.propertyType === 'hotel' || this.propertyType === 'hospital') {
      this.priority = 'high';
    } else if (this.parkingSpaces && this.parkingSpaces > 100) {
      this.priority = 'high';
    } else if (this.propertyType === 'commercial' || this.propertyType === 'office') {
      this.priority = 'medium';
    } else {
      this.priority = 'low';
    }
  }
  next();
});

// Ensure virtual fields are serialized
partnershipSchema.set('toJSON', { virtuals: true });
partnershipSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Partnership', partnershipSchema);