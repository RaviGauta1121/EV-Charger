// src/services/chargerService.js - Fixed Vue.js version
import api, { tokenManager } from "./api";

export const chargerService = {
  // Helper function to format charger data
  formatChargerData(chargerData) {
    const formatted = { ...chargerData };
    
    // Ensure price is a number with 2 decimal places
    if (formatted.price) {
      formatted.price = parseFloat(formatted.price).toFixed(2);
    }
    
    // Ensure power is an integer
    if (formatted.power) {
      formatted.power = parseInt(formatted.power, 10);
    }
    
    // Ensure amenities is an array
    if (!Array.isArray(formatted.amenities)) {
      formatted.amenities = [];
    }
    
    // Format connector type properly
    if (formatted.connectorType) {
      formatted.connectorType = formatted.connectorType.trim();
    }
    
    // Clean up empty string values
    Object.keys(formatted).forEach(key => {
      if (formatted[key] === '') {
        delete formatted[key];
      }
    });
    
    return formatted;
  },

  // Helper function to validate charger data
  validateChargerData(chargerData) {
    const errors = [];
    const requiredFields = ["name", "location", "type", "connectorType", "power", "price", "status"];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!chargerData[field] || chargerData[field] === '') {
        errors.push(`${field} is required`);
      }
    });
    
    // Validate power based on charger type
    if (chargerData.type && chargerData.power) {
      const powerLimits = {
        'Standard': { min: 1, max: 50 },
        'Fast': { min: 50, max: 150 },
        'Rapid': { min: 150, max: 350 },
        'Ultra Fast': { min: 350, max: 1000 }
      };
      
      const limits = powerLimits[chargerData.type];
      if (limits && (chargerData.power < limits.min || chargerData.power > limits.max)) {
        errors.push(`${chargerData.type} chargers should be between ${limits.min}kW and ${limits.max}kW`);
      }
    }
    
    // Validate connector type
    const validConnectors = ["Type 1", "Type 2", "CCS", "CHAdeMO", "Tesla"];
    if (chargerData.connectorType && !validConnectors.includes(chargerData.connectorType)) {
      errors.push(`Invalid connector type. Must be one of: ${validConnectors.join(", ")}`);
    }
    
    // Validate status
    const validStatuses = ["Available", "Occupied", "Out of Service", "Maintenance"];
    if (chargerData.status && !validStatuses.includes(chargerData.status)) {
      errors.push(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }
    
    // Validate price range
    if (chargerData.price && (chargerData.price < 0 || chargerData.price > 10)) {
      errors.push("Price must be between $0.00 and $10.00 per kWh");
    }
    
    return errors;
  },

  // Get all chargers with filtering
  async getChargers(params = {}) {
    try {
      console.log("📊 Vue ChargerService: Fetching chargers with params:", params);

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

      console.log("📊 Vue ChargerService: Clean params:", cleanParams);

      const response = await api.get("/chargers", {
        params: cleanParams,
      });

      console.log("✅ Vue ChargerService: Successfully fetched chargers:", {
        count: response.data?.length || 0,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error("❌ Vue ChargerService: Error in getChargers:", error);
      
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
      console.log("📊 Vue ChargerService: Fetching charger with ID:", id);

      if (!id) {
        throw new Error('Charger ID is required');
      }

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await api.get(`/chargers/${id}`);

      console.log("✅ Vue ChargerService: Successfully fetched charger:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Vue ChargerService: Error getting charger:", error);
      
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
      console.log("📊 Vue ChargerService: Creating charger:", chargerData);

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      // Format and validate data
      const formattedData = this.formatChargerData(chargerData);
      const validationErrors = this.validateChargerData(formattedData);

      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      const response = await api.post("/chargers", formattedData);

      console.log("✅ Vue ChargerService: Charger created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Vue ChargerService: Error creating charger:", error);

      // Handle validation errors specifically
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw new Error(errorData.errors.join(", "));
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      }

      const errorMessage = error.message || "Failed to create charger";
      throw new Error(errorMessage);
    }
  },

  // Update existing charger
  async updateCharger(id, chargerData) {
    try {
      console.log("📊 Vue ChargerService: Updating charger:", id, chargerData);

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

      const response = await api.put(`/chargers/${id}`, formattedData);

      console.log("✅ Vue ChargerService: Charger updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Vue ChargerService: Error updating charger:", error);

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

      const errorMessage = error.message || "Failed to update charger";
      throw new Error(errorMessage);
    }
  },

  // Delete charger
  async deleteCharger(id) {
    try {
      console.log("📊 Vue ChargerService: Deleting charger with ID:", id);

      if (!id) {
        throw new Error("Charger ID is required for deletion");
      }

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await api.delete(`/chargers/${id}`);

      console.log("✅ Vue ChargerService: Charger deleted successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Vue ChargerService: Error deleting charger:", error);

      if (error.response?.status === 404) {
        throw new Error("Charger not found");
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
      console.log("📊 Vue ChargerService: Updating charger status:", id, status);

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

      console.log("✅ Vue ChargerService: Charger status updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Vue ChargerService: Error updating charger status:", error);

      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to update charger status";
      throw new Error(errorMessage);
    }
  },

  // Bulk operations
  async bulkUpdateChargers(chargerIds, updateData) {
    try {
      console.log("📊 Vue ChargerService: Bulk updating chargers:", chargerIds, updateData);

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

      console.log("✅ Vue ChargerService: Bulk update successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Vue ChargerService: Error in bulk update:", error);
      throw new Error(error.message || "Failed to bulk update chargers");
    }
  },

  // Get charger statistics
  async getChargerStats() {
    try {
      console.log("📊 Vue ChargerService: Fetching charger statistics");

      if (!tokenManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await api.get("/chargers/stats");

      console.log("✅ Vue ChargerService: Stats fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Vue ChargerService: Error fetching stats:", error);
      throw new Error(error.message || "Failed to fetch charger statistics");
    }
  }
};

export default chargerService;