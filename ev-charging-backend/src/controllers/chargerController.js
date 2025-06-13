// src/controllers/chargerController.js
const Charger = require('../models/Charger');

// @desc    Get all chargers
// @route   GET /api/chargers
// @access  Public
const getChargers = async (req, res) => {
  try {
    const {
      status,
      type,
      location,
      minPower,
      maxPower,
      page = 1,
      limit = 10,
      latitude,
      longitude,
      radius = 10 // radius in km
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPower || maxPower) {
      filter.power = {};
      if (minPower) filter.power.$gte = Number(minPower);
      if (maxPower) filter.power.$lte = Number(maxPower);
    }

    // Location-based filtering
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusInMeters = radius * 1000;

      filter['coordinates.latitude'] = {
        $gte: lat - (radius / 111), // rough conversion
        $lte: lat + (radius / 111)
      };
      filter['coordinates.longitude'] = {
        $gte: lng - (radius / (111 * Math.cos(lat * Math.PI / 180))),
        $lte: lng + (radius / (111 * Math.cos(lat * Math.PI / 180)))
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: {
        path: 'createdBy',
        select: 'name email'
      },
      sort: { createdAt: -1 }
    };

    const result = await Charger.paginate(filter, options);

    res.status(200).json({
      success: true,
      count: result.docs.length,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      },
      data: result.docs
    });

  } catch (error) {
    console.error('Get chargers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chargers',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get single charger
// @route   GET /api/chargers/:id
// @access  Public
const getCharger = async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    res.status(200).json({
      success: true,
      data: charger
    });

  } catch (error) {
    console.error('Get charger error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching charger',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new charger
// @route   POST /api/chargers
// @access  Private (Admin only)
const createCharger = async (req, res) => {
  try {
    console.log('📝 Creating charger with data:', req.body);
    console.log('👤 User:', req.user);

    // Destructure and validate required fields
    const {
      name,
      location,
      type,
      connectorType,
      power,
      pricePerKwh,
      coordinates,
      amenities,
      operatingHours
    } = req.body;

    // Manual validation with detailed error messages
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!location) missingFields.push('location');
    if (!type) missingFields.push('type');
    if (!connectorType) missingFields.push('connectorType');
    if (!power) missingFields.push('power');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate type enum
    const validTypes = ['Slow', 'Fast', 'Rapid', 'Ultra-Fast'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid charger type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validate connectorType enum
    const validConnectorTypes = [
      'Type 1 (J1772)',
      'Type 2 (Mennekes)',
      'CCS1',
      'CCS2',
      'CHAdeMO',
      'Tesla Supercharger',
      'GB/T'
    ];
    if (!validConnectorTypes.includes(connectorType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid connector type. Must be one of: ${validConnectorTypes.join(', ')}`
      });
    }

    // Validate power range
    if (power < 1 || power > 350) {
      return res.status(400).json({
        success: false,
        message: 'Power must be between 1 and 350 kW'
      });
    }

    // Create charger object
    const chargerData = {
      name: name.trim(),
      location: location.trim(),
      type,
      connectorType,
      power: Number(power),
      createdBy: req.user._id // Fixed: use _id instead of userId
    };

    // Add optional fields if provided
    if (pricePerKwh !== undefined) {
      chargerData.pricePerKwh = Number(pricePerKwh);
    }

    if (coordinates && coordinates.latitude && coordinates.longitude) {
      chargerData.coordinates = {
        latitude: Number(coordinates.latitude),
        longitude: Number(coordinates.longitude)
      };
    }

    if (amenities && Array.isArray(amenities)) {
      chargerData.amenities = amenities;
    }

    if (operatingHours && operatingHours.open && operatingHours.close) {
      chargerData.operatingHours = operatingHours;
    }

    console.log('📝 Final charger data:', chargerData);

    // Create the charger
    const charger = await Charger.create(chargerData);

    // Populate the creator information
    await charger.populate('createdBy', 'name email');

    console.log('✅ Charger created successfully:', charger._id);

    res.status(201).json({
      success: true,
      message: 'Charger created successfully',
      data: charger
    });

  } catch (error) {
    console.error('Create charger error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Charger with similar details already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating charger',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update charger
// @route   PUT /api/chargers/:id
// @access  Private (Admin only)
const updateCharger = async (req, res) => {
  try {
    console.log('📝 Updating charger:', req.params.id);
    console.log('📝 Update data:', req.body);

    const charger = await Charger.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    // Validate connectorType if it's being updated
    if (req.body.connectorType) {
      const validConnectorTypes = [
        'Type 1 (J1772)',
        'Type 2 (Mennekes)',
        'CCS1',
        'CCS2',
        'CHAdeMO',
        'Tesla Supercharger',
        'GB/T'
      ];
      if (!validConnectorTypes.includes(req.body.connectorType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid connector type. Must be one of: ${validConnectorTypes.join(', ')}`
        });
      }
    }

    // Validate type if it's being updated
    if (req.body.type) {
      const validTypes = ['Slow', 'Fast', 'Rapid', 'Ultra-Fast'];
      if (!validTypes.includes(req.body.type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid charger type. Must be one of: ${validTypes.join(', ')}`
        });
      }
    }

    // Update charger
    const updatedCharger = await Charger.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email');

    console.log('✅ Charger updated successfully');

    res.status(200).json({
      success: true,
      message: 'Charger updated successfully',
      data: updatedCharger
    });

  } catch (error) {
    console.error('Update charger error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating charger',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete charger
// @route   DELETE /api/chargers/:id
// @access  Private (Admin only)
const deleteCharger = async (req, res) => {
  try {
    console.log('🗑️ Deleting charger:', req.params.id);

    const charger = await Charger.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    await Charger.findByIdAndDelete(req.params.id);

    console.log('✅ Charger deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Charger deleted successfully'
    });

  } catch (error) {
    console.error('Delete charger error:', error);

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error deleting charger',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update charger status
// @route   PATCH /api/chargers/:id/status
// @access  Private
const updateChargerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Available', 'Occupied', 'Out of Service', 'Maintenance'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const charger = await Charger.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Charger status updated successfully',
      data: charger
    });

  } catch (error) {
    console.error('Update charger status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating charger status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getChargers,
  getCharger,
  createCharger,
  updateCharger,
  deleteCharger,
  updateChargerStatus
};