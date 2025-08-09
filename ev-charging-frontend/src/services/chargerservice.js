// src/services/chargerService.js - Fixed version with proper field mapping
import api, { tokenManager } from "./api";

export const chargerService = {
  // Helper function to format charger data for backend
  formatChargerData(chargerData) {
    const formatted = { ...chargerData };
    
    console.log('🔧 Formatting charger data:', formatted);
    
    // Ensure pricePerKwh is a number with proper precision
    if (formatted.pricePerKwh !== undefined && formatted.pricePerKwh !== null) {
      formatted.pricePerKwh = Number(parseFloat(formatted.pricePerKwh).toFixed(2));
    }
    
    // Ensure power is an integer
    if (formatted.power !== undefined && formatted.power !== null) {
      formatted.power = Number(formatted.power);
    }
    
    // Ensure amenities is an array
    if (!Array.isArray(formatted.amenities)) {
      formatted.amenities = [];
    }
    
    // Clean and validate connector type
    if (formatted.connectorType) {
      formatted.connectorType = formatted.connectorType.trim();
    }
    
    // Clean up empty string values but preserve null/undefined for optional fields
    Object.keys(formatted).forEach(key => {
      if (formatted[key] === '') {
        // For required fields, don't delete, for optional fields, delete empty strings
        const requiredFields = ['name', 'location', 'type', 'connectorType'];
        if (!requiredFields.includes(key)) {
          delete formatted[key];
        }
      }
    });
    
    console.log('✅ Formatted data:', formatted);
    return formatted;
  },

  // Enhanced validation that matches backend exactly
  validateChargerData(chargerData) {
    const errors = [];
    
    // Backend enum values - must match exactly
    const VALID_CHARGER_TYPES = ['Slow', 'Fast', 'Rapid', 'Ultra-Fast'];
    const VALID_CONNECTOR_TYPES = [
      'Type 1 (J1772)',
      'Type 2 (Mennekes)',
      'CCS1',
      'CCS2',
      'CHAdeMO',
      'Tesla Supercharger',
      'GB/T'
    ];
    const VALID_STATUSES = ['Available', 'Occupied', 'Out of Service', 'Maintenance'];
    
    // Required fields validation
    const requiredFields = [
      { field: 'name', message: 'Station name is required' },
      { field: 'location', message: 'Location is required' },
      { field: 'type', message: 'Charger type is required' },
      { field: 'connectorType', message: 'Connector type is required' },
      { field: 'power', message: 'Power output is required' }
    ];
    
    requiredFields.forEach(({ field, message }) => {
      if (!chargerData[field] || chargerData[field] === '') {
        errors.push(message);
      }
    });
    
    // String length validations
    if (chargerData.name && chargerData.name.length > 100) {
      errors.push('Station name cannot exceed 100 characters');
    }
    
    if (chargerData.description && chargerData.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
    
    // Enum validations - exact match required
    if (chargerData.type && !VALID_CHARGER_TYPES.includes(chargerData.type)) {
      errors.push(`Invalid charger type: "${chargerData.type}". Must be one of: ${VALID_CHARGER_TYPES.join(', ')}`);
    }
    
    if (chargerData.connectorType && !VALID_CONNECTOR_TYPES.includes(chargerData.connectorType)) {
      errors.push(`Invalid connector type: "${chargerData.connectorType}". Must be one of: ${VALID_CONNECTOR_TYPES.join(', ')}`);
    }
    
    if (chargerData.status && !VALID_STATUSES.includes(chargerData.status)) {
      errors.push(`Invalid status: "${chargerData.status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    
    // Numeric validations
    if (chargerData.power !== undefined && chargerData.power !== null) {
      const power = Number(chargerData.power);
      if (isNaN(power) || power < 1 || power > 350) {
        errors.push('Power must be a number between 1 and 350 kW');
      }
    }
    
    if (chargerData.pricePerKwh !== undefined && chargerData.pricePerKwh !== null) {
      const price = Number(chargerData.pricePerKwh);
      if (isNaN(price) || price < 0) {
        errors.push('Price per kWh must be a non-negative number');
      }
    }
    
    // Coordinates validation
    if (chargerData.coordinates) {
      if (chargerData.coordinates.latitude !== null && chargerData.coordinates.latitude !== undefined) {
        const lat = Number(chargerData.coordinates.latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          errors.push('Latitude must be a number between -90 and 90');
        }
      }
      
      if (chargerData.coordinates.longitude !== null && chargerData.coordinates.longitude !== undefined) {
        const lng = Number(chargerData.coordinates.longitude);
        if (isNaN(lng) || lng < -180 || lng > 180) {
          errors.push('Longitude must be a number between -180 and 180');
        }
      }
    }
    
    // Operating hours validation
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (chargerData.operatingHours) {
      if (chargerData.operatingHours.open && !timeRegex.test(chargerData.operatingHours.open)) {
        errors.push('Opening time must be in HH:MM format (24-hour)');
      }
      if (chargerData.operatingHours.close && !timeRegex.test(chargerData.operatingHours.close)) {
        errors.push('Closing time must be in HH:MM format (24-hour)');
      }
    }
    
    console.log('🔍 Validation result:', { errors, data: chargerData });
    return errors;
  },

  // Get all chargers with filtering
  async getChargers(params = {}) {
    try {
      console.log("📊 ChargerService: Fetching chargers with params:", params);

      // Check authentication first
      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      // Clean up params to remove empty values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_, value]) => value !== "" && value != null && value !== undefined
        )
      );

      console.log("📊 ChargerService: Clean params:", cleanParams);

      const response = await api.get("/chargers", {
        params: cleanParams,
      });

      console.log("✅ ChargerService: Successfully fetched chargers:", {
        count: response.data?.data?.length || response.data?.length || 0,
        response: response.data
      });
      
      // Handle both paginated and direct array responses
      return response.data.data || response.data;
      
    } catch (error) {
      console.error("❌ ChargerService: Error in getChargers:", error);
      
      // Enhanced error handling
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view chargers.');
      } else if (error.response?.status === 404) {
        throw new Error('Chargers endpoint not found. Please check the API.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch chargers';
      throw new Error(errorMessage);
    }
  },

  // Get single charger by ID
  async getCharger(id) {
    try {
      console.log("📊 ChargerService: Fetching charger with ID:", id);

      if (!id) {
        throw new Error('Charger ID is required');
      }

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await api.get(`/chargers/${id}`);

      console.log("✅ ChargerService: Successfully fetched charger:", response.data);
      return response.data.data || response.data;
      
    } catch (error) {
      console.error("❌ ChargerService: Error getting charger:", error);
      
      if (error.response?.status === 404) {
        throw new Error(`Charger with ID ${id} not found`);
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          `Failed to fetch charger with ID: ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Create new charger
  async createCharger(chargerData) {
    try {
      console.log("📊 ChargerService: Creating charger:", chargerData);

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      // Format and validate data
      const formattedData = this.formatChargerData(chargerData);
      const validationErrors = this.validateChargerData(formattedData);

      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      console.log("📤 Sending formatted data to backend:", formattedData);

      const response = await api.post("/chargers", formattedData);

      console.log("✅ ChargerService: Charger created successfully:", response.data);
      return response.data.data || response.data;
      
    } catch (error) {
      console.error("❌ ChargerService: Error creating charger:", error);
      console.error("❌ Error response:", error.response?.data);

      // Handle validation errors specifically
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw new Error(errorData.errors.join(", "));
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        if (errorData.missingFields) {
          throw new Error(`Missing required fields: ${errorData.missingFields.join(", ")}`);
        }
      }

      // Handle authentication errors
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }

      if (error.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to create chargers.');
      }

      const errorMessage = error.message || "Failed to create charger";
      throw new Error(errorMessage);
    }
  },

  // Update existing charger
  async updateCharger(id, chargerData) {
    try {
      console.log("📊 ChargerService: Updating charger:", id, chargerData);

      if (!id) {
        throw new Error("Charger ID is required for update");
      }

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      // Format and validate data
      const formattedData = this.formatChargerData(chargerData);
      const validationErrors = this.validateChargerData(formattedData);

      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      console.log("📤 Sending update data to backend:", formattedData);

      const response = await api.put(`/chargers/${id}`, formattedData);

      console.log("✅ ChargerService: Charger updated successfully:", response.data);
      return response.data.data || response.data;
      
    } catch (error) {
      console.error("❌ ChargerService: Error updating charger:", error);

      if (error.response?.status === 404) {
        throw new Error("Charger not found");
      }

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw new Error(errorData.errors.join(", "));
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      }

      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }

      if (error.response?.status === 403) {
        throw new Error("Access denied. You don't have permission to update this charger.");
      }

      const errorMessage = error.message || "Failed to update charger";
      throw new Error(errorMessage);
    }
  },

  // Delete charger
  async deleteCharger(id) {
    try {
      console.log("📊 ChargerService: Deleting charger with ID:", id);

      if (!id) {
        throw new Error("Charger ID is required for deletion");
      }

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await api.delete(`/chargers/${id}`);

      console.log("✅ ChargerService: Charger deleted successfully");
      return response.data;
      
    } catch (error) {
      console.error("❌ ChargerService: Error deleting charger:", error);

      if (error.response?.status === 404) {
        throw new Error("Charger not found");
      }

      if (error.response?.status === 403) {
        throw new Error("Access denied. You don't have permission to delete this charger.");
      }

      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to delete charger";
      throw new Error(errorMessage);
    }
  },

  // Update charger status
  async updateChargerStatus(id, status) {
    try {
      console.log("📊 ChargerService: Updating charger status:", id, status);

      if (!id) {
        throw new Error("Charger ID is required");
      }

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      const validStatuses = ["Available", "Occupied", "Out of Service", "Maintenance"];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      }

      const response = await api.patch(`/chargers/${id}/status`, { status });

      console.log("✅ ChargerService: Charger status updated successfully:", response.data);
      return response.data.data || response.data;
      
    } catch (error) {
      console.error("❌ ChargerService: Error updating charger status:", error);

      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to update charger status";
      throw new Error(errorMessage);
    }
  },

  // Bulk operations
  async bulkUpdateChargers(chargerIds, updateData) {
    try {
      console.log("📊 ChargerService: Bulk updating chargers:", chargerIds, updateData);

      if (!Array.isArray(chargerIds) || chargerIds.length === 0) {
        throw new Error("Charger IDs array is required");
      }

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await api.patch("/chargers/bulk", {
        chargerIds,
        updateData: this.formatChargerData(updateData)
      });

      console.log("✅ ChargerService: Bulk update successful:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ ChargerService: Error in bulk update:", error);
      throw new Error(error.message || "Failed to bulk update chargers");
    }
  },

  // Get charger statistics
  async getChargerStats() {
    try {
      console.log("📊 ChargerService: Fetching charger statistics");

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await api.get("/chargers/stats");

      console.log("✅ ChargerService: Stats fetched successfully:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ ChargerService: Error fetching stats:", error);
      throw new Error(error.message || "Failed to fetch charger statistics");
    }
  }
};

export default chargerService;