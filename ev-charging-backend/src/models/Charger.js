// src/models/Charger.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const chargerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a charger name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Please add charger type"],
      enum: ["Slow", "Fast", "Rapid", "Ultra-Fast"],
    },
    connectorType: {
      type: String,
      required: [true, "Please add connector type"],
      enum: [
        "Type 1 (J1772)",
        "Type 2 (Mennekes)",
        "CCS1",
        "CCS2",
        "CHAdeMO",
        "Tesla Supercharger",
        "GB/T",
      ],
    },
    power: {
      type: Number,
      required: [true, "Please add power rating in kW"],
      min: [1, "Power must be at least 1 kW"],
      max: [350, "Power cannot exceed 350 kW"],
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Out of Service", "Maintenance"],
      default: "Available",
    },
    pricePerKwh: {
      type: Number,
      default: 0.25,
      min: [0, "Price cannot be negative"],
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, "Latitude must be between -90 and 90"],
        max: [90, "Latitude must be between -90 and 90"],
      },
      longitude: {
        type: Number,
        min: [-180, "Longitude must be between -180 and 180"],
        max: [180, "Longitude must be between -180 and 180"],
      },
    },
    amenities: [
      {
        type: String,
        enum: [
          "WiFi",
          "Restroom",
          "Restaurant",
          "Shopping",
          "Parking",
          "Covered",
        ],
      },
    ],
    operatingHours: {
      open: {
        type: String,
        default: "00:00",
        validate: {
          validator: function (v) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: "Opening time must be in HH:MM format (24-hour)",
        },
      },
      close: {
        type: String,
        default: "23:59",
        validate: {
          validator: function (v) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: "Closing time must be in HH:MM format (24-hour)",
        },
      },
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add pagination plugin
chargerSchema.plugin(mongoosePaginate);

// Index for location-based queries
chargerSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });
chargerSchema.index({ status: 1 });
chargerSchema.index({ type: 1 });
chargerSchema.index({ connectorType: 1 });

module.exports = mongoose.model("Charger", chargerSchema);
