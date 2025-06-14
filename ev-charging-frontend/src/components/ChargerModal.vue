<template>
  <div class="modal fade" id="chargerModal" tabindex="-1" aria-labelledby="chargerModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="chargerModalLabel">
            <i class="fas fa-charging-station me-2"></i>
            {{ isEditMode ? 'Edit' : 'Add New' }} Charging Station
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">{{ isEditMode ? 'Loading charger data...' : 'Saving charger...' }}</p>
          </div>

          <!-- Auth Debug Info -->
          <div v-if="showDebugInfo" class="alert alert-info mb-3">
            <h6>🔍 Debug Info:</h6>
            <pre>{{ debugInfo }}</pre>
            <button @click="setTestToken" class="btn btn-sm btn-secondary me-2">Set Test Token</button>
            <button @click="clearTokens" class="btn btn-sm btn-warning">Clear Tokens</button>
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="handleSubmit" ref="chargerForm">
            <!-- Basic Information -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="text-primary mb-3"><i class="fas fa-info-circle me-2"></i>Basic Information</h6>
              </div>
              <div class="col-md-6">
                <label for="chargerName" class="form-label">Station Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="chargerName" v-model="formData.name" 
                  placeholder="Enter station name" maxlength="100" required>
                <div class="form-text">Maximum 100 characters</div>
              </div>
              <div class="col-md-6">
                <label for="chargerLocation" class="form-label">Location <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="chargerLocation" v-model="formData.location" 
                  placeholder="Street address, City, State" required>
              </div>
            </div>

            <!-- Location Coordinates -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="text-primary mb-3"><i class="fas fa-map-marker-alt me-2"></i>Coordinates (Optional)</h6>
              </div>
              <div class="col-md-6">
                <label for="latitude" class="form-label">Latitude</label>
                <input type="number" class="form-control" id="latitude" 
                  v-model.number="formData.coordinates.latitude" 
                  placeholder="e.g., 40.7128" step="any" min="-90" max="90">
                <div class="form-text">Between -90 and 90</div>
              </div>
              <div class="col-md-6">
                <label for="longitude" class="form-label">Longitude</label>
                <input type="number" class="form-control" id="longitude" 
                  v-model.number="formData.coordinates.longitude" 
                  placeholder="e.g., -74.0060" step="any" min="-180" max="180">
                <div class="form-text">Between -180 and 180</div>
              </div>
            </div>

            <!-- Technical Specifications -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="text-primary mb-3"><i class="fas fa-cog me-2"></i>Technical Specifications</h6>
              </div>
              <div class="col-md-4">
                <label for="chargerType" class="form-label">Charger Type <span class="text-danger">*</span></label>
                <select class="form-select" id="chargerType" v-model="formData.type" 
                  @change="updateRecommendedPrice" required>
                  <option value="">Select type</option>
                  <option v-for="type in chargerTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label for="chargerPower" class="form-label">Power Output (kW) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="chargerPower" v-model.number="formData.power"
                  placeholder="e.g., 150" min="1" max="350" required>
                <div class="form-text">Between 1 and 350 kW</div>
              </div>
              <div class="col-md-4">
                <label for="connectorType" class="form-label">Connector Type <span class="text-danger">*</span></label>
                <select class="form-select" id="connectorType" v-model="formData.connectorType" required>
                  <option value="">Select connector</option>
                  <option v-for="connector in connectorTypes" :key="connector" :value="connector">{{ connector }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Pricing and Status -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="text-primary mb-3"><i class="fas fa-dollar-sign me-2"></i>Pricing & Status</h6>
              </div>
              <div class="col-md-4">
                <label for="chargerPrice" class="form-label">
                  Price per kWh ($)
                  <small class="text-muted" v-if="recommendedPrice">(Recommended: ${{ recommendedPrice }})</small>
                </label>
                <input type="number" class="form-control" id="chargerPrice" v-model.number="formData.pricePerKwh"
                  :placeholder="'e.g., ' + (recommendedPrice || '0.25')" step="0.01" min="0">
                <div class="form-text">Cannot be negative</div>
              </div>
              <div class="col-md-4">
                <label for="chargerStatus" class="form-label">Status</label>
                <select class="form-select" id="chargerStatus" v-model="formData.status">
                  <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label for="networkProvider" class="form-label">Network Provider</label>
                <input type="text" class="form-control" id="networkProvider" v-model="formData.networkProvider"
                  placeholder="e.g., ChargePoint, EVgo">
              </div>
            </div>

            <!-- Operating Hours -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="text-primary mb-3"><i class="fas fa-clock me-2"></i>Operating Hours</h6>
              </div>
              <div class="col-md-6">
                <label for="openTime" class="form-label">Opening Time</label>
                <input type="time" class="form-control" id="openTime" v-model="formData.operatingHours.open">
                <div class="form-text">24-hour format (HH:MM)</div>
              </div>
              <div class="col-md-6">
                <label for="closeTime" class="form-label">Closing Time</label>
                <input type="time" class="form-control" id="closeTime" v-model="formData.operatingHours.close">
                <div class="form-text">24-hour format (HH:MM)</div>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="text-primary mb-3"><i class="fas fa-plus-circle me-2"></i>Additional Information</h6>
              </div>
              <div class="col-md-12">
                <label class="form-label">Amenities</label>
                <div class="form-check-group">
                  <div class="form-check form-check-inline" v-for="amenity in availableAmenities" :key="amenity">
                    <input class="form-check-input" type="checkbox" :id="amenity.toLowerCase().replace(/\s+/g, '-')"
                      :value="amenity" v-model="formData.amenities">
                    <label class="form-check-label" :for="amenity.toLowerCase().replace(/\s+/g, '-')">{{ amenity
                    }}</label>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" rows="3" v-model="formData.description"
                  placeholder="Additional details about the charging station..."></textarea>
              </div>
            </div>

            <!-- Validation Errors -->
            <div v-if="validationErrors.length > 0" class="alert alert-warning mt-3" role="alert">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Please fix the following errors:</strong>
              <ul class="mb-0 mt-2">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
              </ul>
            </div>

            <!-- Error Alert -->
            <div v-if="submitError" class="alert alert-danger mt-3" role="alert">
              <i class="fas fa-exclamation-triangle me-2"></i>{{ submitError }}
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary me-2" @click="toggleDebug">
            <i class="fas fa-bug me-2"></i>Debug
          </button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="resetForm">
            <i class="fas fa-times me-2"></i>Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="loading || !isFormValid">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else :class="isEditMode ? 'fas fa-save me-2' : 'fas fa-plus me-2'"></i>
            {{ isEditMode ? 'Update Station' : 'Add Station' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch, nextTick, computed } from 'vue'
import { chargerService } from '../services/chargerservice'

export default {
  name: 'ChargerModal',
  props: {
    charger: { type: Object, default: null },
    isEditMode: { type: Boolean, default: false }
  },
  emits: ['charger-saved', 'modal-closed'],
  setup(props, { emit }) {
    const loading = ref(false)
    const submitError = ref('')
    const chargerForm = ref(null)
    const showDebugInfo = ref(false)

    // Static data arrays - aligned with backend enum values
    const availableAmenities = ['WiFi', 'Restroom', 'Restaurant', 'Shopping', 'Parking', 'Covered']
    const chargerTypes = ['Slow', 'Fast', 'Rapid', 'Ultra-Fast'] // Fixed to match backend
   const connectorTypes = ['Type 1 (J1772)', 'Type 2 (Mennekes)', 'CCS1', 'CCS2', 'CHAdeMO', 'Tesla Supercharger', 'GB/T']
    const statusOptions = ['Available', 'Occupied', 'Out of Service', 'Maintenance']

    // Updated pricing recommendations to match backend types
    const pricingRecommendations = { 'Slow': 0.20, 'Fast': 0.30, 'Rapid': 0.40, 'Ultra-Fast': 0.50 }
    const recommendedPrice = computed(() => pricingRecommendations[formData.type] || null)

    // Form data - aligned with backend schema
    const formData = reactive({
      name: '',
      location: '',
      type: '',
      power: null,
      connectorType: '',
      pricePerKwh: 0.25, // Changed from 'price' to 'pricePerKwh'
      status: 'Available',
      networkProvider: '',
      coordinates: {
        latitude: null,
        longitude: null
      },
      amenities: [],
      operatingHours: {
        open: '00:00',
        close: '23:59'
      },
      description: ''
    })

    const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/chargers`

    // Validation
    const validationErrors = computed(() => {
      const errors = []
      
      // Required fields
      if (!formData.name?.trim()) errors.push('Station name is required')
      if (formData.name && formData.name.length > 100) errors.push('Station name cannot exceed 100 characters')
      if (!formData.location?.trim()) errors.push('Location is required')
      if (!formData.type) errors.push('Charger type is required')
      if (!formData.connectorType) errors.push('Connector type is required')
      if (!formData.power) errors.push('Power output is required')
      
      // Numeric validations
      if (formData.power && (formData.power < 1 || formData.power > 350)) {
        errors.push('Power must be between 1 and 350 kW')
      }
      if (formData.pricePerKwh !== null && formData.pricePerKwh !== undefined && formData.pricePerKwh < 0) {
        errors.push('Price cannot be negative')
      }
      
      // Coordinate validations
      if (formData.coordinates.latitude !== null) {
        if (formData.coordinates.latitude < -90 || formData.coordinates.latitude > 90) {
          errors.push('Latitude must be between -90 and 90')
        }
      }
      if (formData.coordinates.longitude !== null) {
        if (formData.coordinates.longitude < -180 || formData.coordinates.longitude > 180) {
          errors.push('Longitude must be between -180 and 180')
        }
      }
      
      // Operating hours validation
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (formData.operatingHours.open && !timeRegex.test(formData.operatingHours.open)) {
        errors.push('Opening time must be in HH:MM format (24-hour)')
      }
      if (formData.operatingHours.close && !timeRegex.test(formData.operatingHours.close)) {
        errors.push('Closing time must be in HH:MM format (24-hour)')
      }
      
      return errors
    })

    const isFormValid = computed(() => validationErrors.value.length === 0)

    // Auth helpers
    const getAuthToken = () => {
      const keys = ['authToken', 'token', 'accessToken', 'jwt', 'Bearer']
      for (const key of keys) {
        const token = localStorage.getItem(key)
        if (token) {
          console.log(`🔍 Found token in localStorage.${key}:`, token.substring(0, 20) + '...')
          return token
        }
      }
      console.log('❌ No token found in localStorage')
      return null
    }

    const isTokenValid = (token) => {
      if (!token) return false
      try {
        const parts = token.split('.')
        if (parts.length !== 3) return false
        const payload = JSON.parse(atob(parts[1]))
        const isExpired = payload.exp && payload.exp * 1000 < Date.now()
        console.log('🔍 Token validation:', { hasExpiry: !!payload.exp, expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry', isExpired, userId: payload.userId || payload.id || payload.sub })
        return !isExpired
      } catch (error) {
        console.error('❌ Token validation failed:', error)
        return false
      }
    }

    const getAuthHeaders = () => {
      const token = getAuthToken()
      if (!token) throw new Error('Authentication required. Please log in again.')
      if (!isTokenValid(token)) throw new Error('Your session has expired. Please log in again.')
      return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }

    const debugInfo = computed(() => {
      const token = getAuthToken()
      const info = {
        hasToken: !!token, tokenPreview: token ? token.substring(0, 30) + '...' : 'No token',
        isValid: token ? isTokenValid(token) : false,
        localStorageKeys: Object.keys(localStorage).filter(key => key.toLowerCase().includes('token') || key.toLowerCase().includes('auth'))
      }
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          info.tokenPayload = { userId: payload.userId || payload.id || payload.sub, email: payload.email, exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry' }
        } catch (error) {
          info.tokenError = error.message
        }
      }
      return info
    })

    // Methods
    const resetForm = () => {
      formData.name = ''
      formData.location = ''
      formData.type = ''
      formData.power = null
      formData.connectorType = ''
      formData.pricePerKwh = 0.25
      formData.status = 'Available'
      formData.networkProvider = ''
      formData.coordinates.latitude = null
      formData.coordinates.longitude = null
      formData.amenities = []
      formData.operatingHours.open = '00:00'
      formData.operatingHours.close = '23:59'
      formData.description = ''
      submitError.value = ''
    }

    const updateRecommendedPrice = () => {
      if (formData.type && !formData.pricePerKwh) {
        formData.pricePerKwh = pricingRecommendations[formData.type]
      }
    }

    const populateForm = (chargerData) => {
      if (chargerData) {
        formData.name = chargerData.name || ''
        formData.location = chargerData.location || ''
        formData.type = chargerData.type || ''
        formData.power = chargerData.power || null
        formData.connectorType = chargerData.connectorType || ''
        // Handle both price and pricePerKwh for backward compatibility
        formData.pricePerKwh = chargerData.pricePerKwh || chargerData.price || 0.25
        formData.status = chargerData.status || 'Available'
        formData.networkProvider = chargerData.networkProvider || ''
        formData.coordinates.latitude = chargerData.coordinates?.latitude || null
        formData.coordinates.longitude = chargerData.coordinates?.longitude || null
        formData.amenities = Array.isArray(chargerData.amenities) ? [...chargerData.amenities] : []
        formData.operatingHours.open = chargerData.operatingHours?.open || '00:00'
        formData.operatingHours.close = chargerData.operatingHours?.close || '23:59'
        formData.description = chargerData.description || ''
      }
    }

    const formatDataForSubmission = () => {
      const data = { ...formData }
      
      // Map pricePerKwh to price for backend compatibility
      if (data.pricePerKwh !== undefined) {
        data.price = data.pricePerKwh
        delete data.pricePerKwh
      }
      
      // Clean up coordinates - remove if empty
      if (data.coordinates.latitude === null && data.coordinates.longitude === null) {
        delete data.coordinates
      } else {
        // Ensure both coordinates are provided if one is provided
        if (data.coordinates.latitude !== null && data.coordinates.longitude !== null) {
          data.coordinates = {
            latitude: Number(data.coordinates.latitude),
            longitude: Number(data.coordinates.longitude)
          }
        } else {
          delete data.coordinates
        }
      }
      
      // Ensure amenities is array
      data.amenities = Array.isArray(data.amenities) ? data.amenities : []
      
      // Remove networkProvider if it's not part of backend schema
      delete data.networkProvider
      
      return data
    }

    const handleSubmit = async () => {
      console.log('🔍 Starting handleSubmit...')
      console.log('📋 Current form data:', formData)

      if (!isFormValid.value) {
        console.log('❌ Form validation failed:', validationErrors.value)
        return
      }

      loading.value = true
      submitError.value = ''

      try {
        const formattedData = formatDataForSubmission()
        console.log('📤 Formatted data being sent:', JSON.stringify(formattedData, null, 2))
        
        const result = props.isEditMode
          ? await chargerService.updateCharger(props.charger._id, formattedData)
          : await chargerService.createCharger(formattedData)

        console.log('✅ Charger saved successfully:', result)

        const modal = bootstrap.Modal.getInstance(document.getElementById('chargerModal'))
        if (modal) modal.hide()

        emit('charger-saved', { charger: result, isEditMode: props.isEditMode })
        resetForm()

      } catch (error) {
        console.error('❌ Error saving charger:', error)
        console.error('❌ Full error object:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        
        let errorMessage = error.message || 'An unexpected error occurred. Please try again.'
        if (error.message.includes('Authentication required')) errorMessage = 'Please log in to continue.'
        else if (error.message.includes('session has expired')) errorMessage = 'Your session has expired. Please log in again.'
        else if (error.message.includes('Not authorized')) errorMessage = 'You are not authorized to perform this action. Please log in again.'
        else if (error.response?.data?.message) errorMessage = error.response.data.message
        else if (error.response?.data?.error) errorMessage = error.response.data.error
        
        submitError.value = errorMessage
      } finally {
        loading.value = false
      }
    }

    // Debug methods
    const toggleDebug = () => showDebugInfo.value = !showDebugInfo.value

    const setTestToken = () => {
      const payload = { userId: '12345', email: 'test@example.com', exp: Math.floor(Date.now() / 1000) + 86400 }
      const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }))
      const payloadEncoded = btoa(JSON.stringify(payload))
      const testToken = `${header}.${payloadEncoded}.test-signature`
      localStorage.setItem('authToken', testToken)
      localStorage.setItem('token', testToken)
      console.log('✅ Test token set in localStorage')
      alert('Test token has been set. Try submitting the form now.')
    }

    const clearTokens = () => {
      ['authToken', 'token', 'accessToken', 'jwt', 'Bearer'].forEach(key => localStorage.removeItem(key))
      console.log('🗑️ All tokens cleared from localStorage')
      alert('All tokens have been cleared from localStorage.')
    }

    // Watchers
    watch(() => props.charger, (newCharger) => {
      if (newCharger && props.isEditMode) populateForm(newCharger)
      else if (!props.isEditMode) resetForm()
    }, { immediate: true, deep: true })

    watch(() => props.isEditMode, () => {
      nextTick(() => { submitError.value = '' })
    })

    return {
      loading, submitError, formData, chargerForm, showDebugInfo, debugInfo,
      availableAmenities, chargerTypes, connectorTypes, statusOptions,
      recommendedPrice, validationErrors, isFormValid,
      resetForm, handleSubmit, updateRecommendedPrice,
      toggleDebug, setTestToken, clearTokens
    }
  }
}
</script>

<style scoped>
.modal-xl {
  max-width: 1140px;
}

.form-check-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.form-check-inline {
  margin-right: 0;
}

.text-primary {
  color: #0d6efd !important;
}

.text-danger {
  color: #dc3545 !important;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: 6px;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.btn {
  border-radius: 6px;
  font-weight: 500;
  padding: 0.5rem 1rem;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-primary:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
}

.alert {
  border-radius: 8px;
  border: none;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.alert-warning {
  background-color: #fff3cd;
  color: #664d03;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

h6 {
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

pre {
  font-size: 0.8rem;
  max-height: 200px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .modal-xl {
    max-width: 95%;
    margin: 1rem auto;
  }

  .form-check-group {
    flex-direction: column;
  }

  .form-check-inline {
    margin-bottom: 0.5rem;
  }
}
</style>