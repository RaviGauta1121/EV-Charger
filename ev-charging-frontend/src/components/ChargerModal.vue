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

          <!-- Auth Debug Info (remove in production) -->
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
                <h6 class="text-primary mb-3">
                  <i class="fas fa-info-circle me-2"></i>Basic Information
                </h6>
              </div>
              <div class="col-md-6">
                <label for="chargerName" class="form-label">Station Name <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.name }"
                  id="chargerName" 
                  v-model="formData.name"
                  placeholder="Enter station name"
                  required
                >
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
              </div>
              <div class="col-md-6">
                <label for="chargerLocation" class="form-label">Location <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.location }"
                  id="chargerLocation" 
                  v-model="formData.location"
                  placeholder="Street address, City, State"
                  required
                >
                <div v-if="errors.location" class="invalid-feedback">
                  {{ errors.location }}
                </div>
              </div>
            </div>

            <!-- Technical Specifications -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-cog me-2"></i>Technical Specifications
                </h6>
              </div>
              <div class="col-md-4">
                <label for="chargerType" class="form-label">Charger Type <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  :class="{ 'is-invalid': errors.type }"
                  id="chargerType"
                  v-model="formData.type"
                  @change="updateRecommendedPrice"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Standard">Standard (AC)</option>
                  <option value="Fast">Fast (DC)</option>
                  <option value="Rapid">Rapid (DC)</option>
                  <option value="Ultra Fast">Ultra Fast (DC)</option>
                </select>
                <div v-if="errors.type" class="invalid-feedback">
                  {{ errors.type }}
                </div>
              </div>
              <div class="col-md-4">
                <label for="chargerPower" class="form-label">Power Output (kW) <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.power }"
                  id="chargerPower" 
                  v-model.number="formData.power"
                  placeholder="e.g., 150"
                  min="1"
                  max="1000"
                  required
                >
                <div v-if="errors.power" class="invalid-feedback">
                  {{ errors.power }}
                </div>
              </div>
              <div class="col-md-4">
                <label for="connectorType" class="form-label">Connector Type <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  :class="{ 'is-invalid': errors.connectorType }"
                  id="connectorType"
                  v-model="formData.connectorType"
                  required
                >
                  <option value="">Select connector</option>
                  <option value="Type 1">Type 1 (J1772)</option>
                  <option value="Type 2">Type 2 (Mennekes)</option>
                  <option value="CCS1">CCS1 (CCS Type 1)</option>
                  <option value="CCS2">CCS2 (CCS Type 2)</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="Tesla Supercharger">Tesla Supercharger</option>
                  <option value="Tesla Destination">Tesla Destination</option>
                  <option value="GB/T">GB/T (Chinese Standard)</option>
                </select>
                <div v-if="errors.connectorType" class="invalid-feedback">
                  {{ errors.connectorType }}
                </div>
              </div>
            </div>

            <!-- Pricing and Status -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-dollar-sign me-2"></i>Pricing & Status
                </h6>
              </div>
              <div class="col-md-4">
                <label for="chargerPrice" class="form-label">
                  Price per kWh ($) <span class="text-danger">*</span>
                  <small class="text-muted" v-if="recommendedPrice">
                    (Recommended: ${{ recommendedPrice }})
                  </small>
                </label>
                <input 
                  type="number" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.price }"
                  id="chargerPrice" 
                  v-model.number="formData.price"
                  :placeholder="'e.g., ' + (recommendedPrice || '0.35')"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                >
                <div v-if="errors.price" class="invalid-feedback">
                  {{ errors.price }}
                </div>
              </div>
              <div class="col-md-4">
                <label for="chargerStatus" class="form-label">Status <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  :class="{ 'is-invalid': errors.status }"
                  id="chargerStatus"
                  v-model="formData.status"
                  required
                >
                  <option value="">Select status</option>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
                <div v-if="errors.status" class="invalid-feedback">
                  {{ errors.status }}
                </div>
              </div>
              <div class="col-md-4">
                <label for="networkProvider" class="form-label">Network Provider</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="networkProvider" 
                  v-model="formData.networkProvider"
                  placeholder="e.g., ChargePoint, EVgo"
                >
              </div>
            </div>

            <!-- Additional Information -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-plus-circle me-2"></i>Additional Information
                </h6>
              </div>
              <div class="col-md-6">
                <label class="form-label">Amenities</label>
                <div class="form-check-group">
                  <div class="form-check form-check-inline" v-for="amenity in availableAmenities" :key="amenity">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :id="amenity.toLowerCase().replace(/\s+/g, '-')" 
                      :value="amenity" 
                      v-model="formData.amenities"
                    >
                    <label class="form-check-label" :for="amenity.toLowerCase().replace(/\s+/g, '-')">
                      {{ amenity }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <label for="operatingHours" class="form-label">Operating Hours</label>
                <select class="form-select" id="operatingHours" v-model="formData.operatingHours">
                  <option value="24/7">24/7</option>
                  <option value="6:00 AM - 10:00 PM">6:00 AM - 10:00 PM</option>
                  <option value="7:00 AM - 9:00 PM">7:00 AM - 9:00 PM</option>
                  <option value="8:00 AM - 8:00 PM">8:00 AM - 8:00 PM</option>
                  <option value="Business Hours">Business Hours (9-5)</option>
                  <option value="Custom">Custom</option>
                </select>
                <input 
                  v-if="formData.operatingHours === 'Custom'"
                  type="text" 
                  class="form-control mt-2" 
                  v-model="formData.customHours"
                  placeholder="Enter custom hours"
                >
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <label for="description" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="description" 
                  rows="3"
                  v-model="formData.description"
                  placeholder="Additional details about the charging station..."
                ></textarea>
              </div>
            </div>

            <!-- Error Alert -->
            <div v-if="submitError" class="alert alert-danger mt-3" role="alert">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ submitError }}
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
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleSubmit"
            :disabled="loading"
          >
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
    charger: {
      type: Object,
      default: null
    },
    isEditMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['charger-saved', 'modal-closed'],
  setup(props, { emit }) {
    const loading = ref(false)
    const submitError = ref('')
    const chargerForm = ref(null)
    const showDebugInfo = ref(false)

    // Available amenities list
    const availableAmenities = [
      'WiFi',
      'Restroom',
      'Restaurant',
      'Shopping',
      'Free Parking',
      'Covered Parking',
      'Valet Service',
      '24/7 Access'
    ]

    // Pricing recommendations based on charger type
    const pricingRecommendations = {
      'Standard': 0.25,
      'Fast': 0.35,
      'Rapid': 0.45,
      'Ultra Fast': 0.55
    }

    const recommendedPrice = computed(() => {
      return pricingRecommendations[formData.type] || null
    })

    // Form data
    const formData = reactive({
      name: '',
      location: '',
      type: '',
      power: null,
      connectorType: '',
      price: null,
      status: 'Available',
      networkProvider: '',
      amenities: [],
      operatingHours: '24/7',
      customHours: '',
      description: ''
    })

    // Form validation errors
    const errors = reactive({
      name: '',
      location: '',
      type: '',
      power: '',
      connectorType: '',
      price: '',
      status: ''
    })

    // API Base URL
    const API_BASE_URL = 'http://localhost:5000/api/chargers'

    // Authentication helper methods
    const getAuthToken = () => {
      const possibleKeys = ['authToken', 'token', 'accessToken', 'jwt', 'Bearer']
      
      for (const key of possibleKeys) {
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
        
        console.log('🔍 Token validation:', {
          hasExpiry: !!payload.exp,
          expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry',
          isExpired,
          userId: payload.userId || payload.id || payload.sub
        })
        
        return !isExpired
      } catch (error) {
        console.error('❌ Token validation failed:', error)
        return false
      }
    }

    const getAuthHeaders = () => {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.')
      }
      
      if (!isTokenValid(token)) {
        throw new Error('Your session has expired. Please log in again.')
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }

    // Debug info computed property
    const debugInfo = computed(() => {
      const token = getAuthToken()
      const info = {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 30) + '...' : 'No token',
        isValid: token ? isTokenValid(token) : false,
        localStorageKeys: Object.keys(localStorage).filter(key => 
          key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')
        )
      }
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          info.tokenPayload = {
            userId: payload.userId || payload.id || payload.sub,
            email: payload.email,
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry'
          }
        } catch (error) {
          info.tokenError = error.message
        }
      }
      
      return info
    })

    // Methods
    const resetForm = () => {
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formData[key] = []
        } else if (typeof formData[key] === 'number') {
          formData[key] = null
        } else {
          formData[key] = ''
        }
      })
      formData.status = 'Available'
      formData.operatingHours = '24/7'
      clearErrors()
      submitError.value = ''
    }

    const clearErrors = () => {
      Object.keys(errors).forEach(key => {
        errors[key] = ''
      })
    }

    const updateRecommendedPrice = () => {
      if (formData.type && !formData.price) {
        formData.price = pricingRecommendations[formData.type]
      }
    }

    const validateForm = () => {
      clearErrors()
      let isValid = true

      // Required field validation
      if (!formData.name.trim()) {
        errors.name = 'Station name is required'
        isValid = false
      }

      if (!formData.location.trim()) {
        errors.location = 'Location is required'
        isValid = false
      }

      if (!formData.type) {
        errors.type = 'Charger type is required'
        isValid = false
      }

      if (!formData.power || formData.power <= 0) {
        errors.power = 'Valid power output is required'
        isValid = false
      }

      if (!formData.connectorType) {
        errors.connectorType = 'Connector type is required'
        isValid = false
      }

      if (formData.price === null || formData.price === undefined || formData.price < 0) {
        errors.price = 'Valid price is required'
        isValid = false
      }

      if (!formData.status) {
        errors.status = 'Status is required'
        isValid = false
      }

      // Power validation based on type
      if (formData.type && formData.power) {
        const powerLimits = {
          'Standard': { min: 3, max: 50 },
          'Fast': { min: 25, max: 150 },
          'Rapid': { min: 50, max: 350 },
          'Ultra Fast': { min: 150, max: 1000 }
        }

        const limits = powerLimits[formData.type]
        if (limits && (formData.power < limits.min || formData.power > limits.max)) {
          errors.power = `${formData.type} chargers should be between ${limits.min}kW and ${limits.max}kW`
          isValid = false
        }
      }

      // Connector type validation based on charger type
      const validConnectors = {
        'Standard': ['Type 1', 'Type 2', 'Tesla Destination'],
        'Fast': ['CCS1', 'CCS2', 'CHAdeMO', 'Tesla Supercharger', 'GB/T'],
        'Rapid': ['CCS1', 'CCS2', 'CHAdeMO', 'Tesla Supercharger', 'GB/T'],
        'Ultra Fast': ['CCS1', 'CCS2', 'Tesla Supercharger', 'GB/T']
      }

      if (formData.type && formData.connectorType) {
        const allowedConnectors = validConnectors[formData.type] || []
        if (!allowedConnectors.includes(formData.connectorType)) {
          errors.connectorType = `${formData.connectorType} is not compatible with ${formData.type} charging`
          isValid = false
        }
      }

      return isValid
    }

    const populateForm = (chargerData) => {
      if (chargerData) {
        Object.keys(formData).forEach(key => {
          if (chargerData.hasOwnProperty(key)) {
            formData[key] = chargerData[key]
          }
        })
        // Ensure amenities is an array
        if (!Array.isArray(formData.amenities)) {
          formData.amenities = []
        }
        // Handle custom operating hours
        if (chargerData.operatingHours && !['24/7', '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', '8:00 AM - 8:00 PM', 'Business Hours'].includes(chargerData.operatingHours)) {
          formData.operatingHours = 'Custom'
          formData.customHours = chargerData.operatingHours
        }
      }
    }

    const formatDataForSubmission = () => {
      const data = { ...formData }
      
      // Use custom hours if selected
      if (data.operatingHours === 'Custom' && data.customHours) {
        data.operatingHours = data.customHours
      }
      
      // Remove customHours from submission
      delete data.customHours
      
      // Ensure amenities is properly formatted
      data.amenities = Array.isArray(data.amenities) ? data.amenities : []
      
      return data
    }

    const handleSubmit = async () => {
      console.log('🔍 Starting handleSubmit...')
      
      if (!validateForm()) {
        console.log('❌ Form validation failed')
        return
      }

      loading.value = true
      submitError.value = ''

      try {
        const formattedData = formatDataForSubmission()
        
        let result
        if (props.isEditMode) {
          result = await chargerService.updateCharger(props.charger._id, formattedData)
        } else {
          result = await chargerService.createCharger(formattedData)
        }

        console.log('✅ Charger saved successfully:', result)
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('chargerModal'))
        if (modal) {
          modal.hide()
        }

        // Emit success event
        emit('charger-saved', {
          charger: result,
          isEditMode: props.isEditMode
        })

        // Reset form
        resetForm()

      } catch (error) {
        console.error('❌ Error saving charger:', error)
        
        let errorMessage = error.message || 'An unexpected error occurred. Please try again.'
        
        // Handle specific error types
        if (error.message.includes('Authentication required')) {
          errorMessage = 'Please log in to continue.'
        } else if (error.message.includes('session has expired')) {
          errorMessage = 'Your session has expired. Please log in again.'
        } else if (error.message.includes('Not authorized')) {
          errorMessage = 'You are not authorized to perform this action. Please log in again.'
        }
        
        submitError.value = errorMessage
      } finally {
        loading.value = false
      }
    }

    // Debug methods
    const toggleDebug = () => {
      showDebugInfo.value = !showDebugInfo.value
    }

    const setTestToken = () => {
      const payload = {
        userId: '12345',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 86400
      }
      
      const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }))
      const payloadEncoded = btoa(JSON.stringify(payload))
      const signature = 'test-signature'
      const testToken = `${header}.${payloadEncoded}.${signature}`
      
      localStorage.setItem('authToken', testToken)
      localStorage.setItem('token', testToken)
      
      console.log('✅ Test token set in localStorage')
      alert('Test token has been set. Try submitting the form now.')
    }

    const clearTokens = () => {
      const tokenKeys = ['authToken', 'token', 'accessToken', 'jwt', 'Bearer']
      tokenKeys.forEach(key => localStorage.removeItem(key))
      console.log('🗑️ All tokens cleared from localStorage')
      alert('All tokens have been cleared from localStorage.')
    }

    // Watch for charger prop changes
    watch(() => props.charger, (newCharger) => {
      if (newCharger && props.isEditMode) {
        populateForm(newCharger)
      } else if (!props.isEditMode) {
        resetForm()
      }
    }, { immediate: true, deep: true })

    // Watch for modal visibility changes
    watch(() => props.isEditMode, () => {
      nextTick(() => {
        clearErrors()
        submitError.value = ''
      })
    })

    return {
      loading,
      submitError,
      formData,
      errors,
      chargerForm,
      showDebugInfo,
      debugInfo,
      availableAmenities,
      recommendedPrice,
      resetForm,
      handleSubmit,
      validateForm,
      updateRecommendedPrice,
      toggleDebug,
      setTestToken,
      clearTokens
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

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border-radius: 6px;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  font-size: 0.875em;
  color: #dc3545;
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