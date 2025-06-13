<!-- src/views/MapPage.vue -->
<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <!-- Sidebar with filters and selected charger info -->
      <div class="col-md-3">
        <div class="sidebar bg-light p-3 rounded mb-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Map Filters</h5>
            <button 
              class="btn btn-sm btn-outline-secondary" 
              @click="clearAllFilters"
              :disabled="!hasActiveFilters"
            >
              <i class="fas fa-times me-1"></i>Clear
            </button>
          </div>
          
          <!-- Search Filter -->
          <div class="mb-3">
            <label class="form-label small">Search</label>
            <input 
              v-model="localFilters.search" 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Search by name or location..."
              @input="updateFilters"
            >
          </div>

          <!-- Status Filter -->
          <div class="mb-3">
            <label class="form-label small">Status</label>
            <select 
              v-model="localFilters.status" 
              class="form-select form-select-sm" 
              @change="updateFilters"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div class="mb-3">
            <label class="form-label small">Charger Type</label>
            <select 
              v-model="localFilters.type" 
              class="form-select form-select-sm" 
              @change="updateFilters"
            >
              <option value="">All Types</option>
              <option value="Standard">Standard</option>
              <option value="Fast">Fast</option>
              <option value="Rapid">Rapid</option>
              <option value="Ultra Fast">Ultra Fast</option>
            </select>
          </div>

          <!-- Location Filter -->
          <div class="mb-3">
            <label class="form-label small">Location</label>
            <input 
              v-model="localFilters.location" 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Filter by city..."
              @input="updateFilters"
            >
          </div>

          <!-- Power Filter -->
          <div class="mb-3">
            <label class="form-label small">Minimum Power (kW)</label>
            <input 
              v-model.number="localFilters.power" 
              type="number" 
              class="form-control form-control-sm" 
              placeholder="e.g. 50"
              min="0"
              @input="updateFilters"
            >
          </div>

          <!-- Statistics -->
          <div class="mt-4">
            <h6 class="small text-muted">Statistics</h6>
            <div class="row text-center">
              <div class="col-6">
                <div class="border rounded p-2">
                  <div class="h5 mb-0">{{ filteredChargers.length }}</div>
                  <small class="text-muted">Visible</small>
                </div>
              </div>
              <div class="col-6">
                <div class="border rounded p-2">
                  <div class="h5 mb-0">{{ totalChargers }}</div>
                  <small class="text-muted">Total</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Distribution -->
          <div class="mt-3" v-if="Object.keys(statusStats).length > 0">
            <h6 class="small text-muted">Status Distribution</h6>
            <div class="status-stats">
              <div 
                v-for="(count, status) in statusStats" 
                :key="status" 
                class="d-flex justify-content-between align-items-center mb-1"
              >
                <span class="small">
                  <span 
                    class="status-dot me-2" 
                    :style="{ backgroundColor: getStatusColor(status) }"
                  ></span>
                  {{ capitalizeFirst(status) }}
                </span>
                <span class="badge bg-secondary">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Charger Details -->
        <div class="selected-charger bg-light p-3 rounded">
          <h6 class="small text-muted mb-2">Selected Charger</h6>
          <div v-if="selectedCharger" class="card">
            <div class="card-body p-3">
              <h6 class="card-title mb-2">{{ selectedCharger.name || 'Unnamed Charger' }}</h6>
              <p class="card-text small mb-2">
                <i class="fas fa-map-marker-alt me-1"></i>
                {{ selectedCharger.location || 'Location not specified' }}
              </p>
              
              <div class="mb-2">
                <span 
                  class="badge me-1" 
                  :style="{ backgroundColor: getStatusColor(selectedCharger.status) }"
                >
                  {{ selectedCharger.status || 'Unknown' }}
                </span>
                <span class="badge bg-secondary me-1">
                  {{ selectedCharger.type || 'Standard' }}
                </span>
                <span class="badge bg-primary">
                  {{ selectedCharger.power || 0 }}kW
                </span>
              </div>

              <!-- Coordinates (if available) -->
              <div v-if="getChargerCoordinates(selectedCharger)" class="small text-muted">
                <i class="fas fa-crosshairs me-1"></i>
                {{ formatCoordinates(getChargerCoordinates(selectedCharger)) }}
              </div>

              <!-- Action buttons (if user has permissions) -->
              <div class="mt-2" v-if="canModifyChargers">
                <button 
                  class="btn btn-sm btn-outline-primary me-1"
                  @click="editCharger(selectedCharger)"
                >
                  <i class="fas fa-edit me-1"></i>Edit
                </button>
                <button 
                  v-if="canDeleteChargers"
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteCharger(selectedCharger._id)"
                >
                  <i class="fas fa-trash me-1"></i>Delete
                </button>
              </div>

              <button 
                class="btn btn-sm btn-outline-secondary mt-2 w-100"
                @click="clearSelection"
              >
                Clear Selection
              </button>
            </div>
          </div>
          <div v-else class="text-center text-muted py-4">
            <i class="fas fa-mouse-pointer fa-2x mb-2"></i>
            <p class="small mb-0">Click a marker on the map to see charger details</p>
          </div>
        </div>
      </div>

      <!-- Map View -->
      <div class="col-md-9">
        <div class="map-header d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">Charging Stations Map</h4>
          <div class="map-controls">
            <button 
              class="btn btn-sm btn-outline-primary me-2"
              @click="refreshChargers"
              :disabled="chargersStore.loading"
            >
              <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': chargersStore.loading }"></i>
              Refresh
            </button>
            <button 
              class="btn btn-sm btn-outline-secondary"
              @click="centerOnUser"
              :disabled="isGettingLocation"
            >
              <i class="fas fa-location-arrow me-1"></i>
              {{ isGettingLocation ? 'Locating...' : 'My Location' }}
            </button>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body p-0 position-relative">
            <!-- Loading Overlay -->
            <div v-if="chargersStore.loading && chargersStore.chargers.length === 0" 
                 class="loading-overlay">
              <div class="text-center">
                <div class="spinner-border text-primary mb-2" role="status"></div>
                <p class="mb-0">Loading charging stations...</p>
              </div>
            </div>

            <!-- Error Overlay -->
            <div v-else-if="chargersStore.error" class="error-overlay">
              <div class="text-center">
                <i class="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                <h5>Unable to Load Map</h5>
                <p class="text-muted">{{ chargersStore.error }}</p>
                <button class="btn btn-primary" @click="refreshChargers">
                  Try Again
                </button>
              </div>
            </div>

            <!-- Map Component -->
            <MapView
              v-else
              :chargers="filteredChargers"
              :centerOnUserLocation="centerOnUserLocation"
              :fallbackCenter="fallbackCenter"
              :defaultZoom="defaultZoom"
              @marker-click="handleMarkerClick"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div ref="toastElement" class="toast" role="alert">
        <div class="toast-header">
          <i class="fas fa-info-circle text-primary me-2"></i>
          <strong class="me-auto">Map</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useChargersStore } from '../store/charger' // Updated import path
import MapView from '../components/MapView.vue'

export default {
  name: 'MapPage',
  components: {
    MapView
  },
  setup() {
    // Store
    const chargersStore = useChargersStore()

    // State
    const selectedCharger = ref(null)
    const isGettingLocation = ref(false)
    const toastMessage = ref('')
    const toastElement = ref(null)

    // Local filters for better UX
    const localFilters = ref({
      search: '',
      status: '',
      type: '',
      location: '',
      power: ''
    })

    // Map configuration
    const centerOnUserLocation = ref(true)
    const fallbackCenter = ref({
      lat: 23.2599, // Bhopal, Madhya Pradesh
      lng: 77.4126
    })
    const defaultZoom = ref(7)

    // Authorization (simplified - you may want to move this to a composable)
    const currentUserRole = ref(null)

    // Computed properties
    const filteredChargers = computed(() => {
      let result = [...chargersStore.chargers]

      // Apply local filters
      if (localFilters.value.search) {
        const searchTerm = localFilters.value.search.toLowerCase()
        result = result.filter(charger =>
          charger.name?.toLowerCase().includes(searchTerm) ||
          charger.location?.toLowerCase().includes(searchTerm)
        )
      }

      if (localFilters.value.status) {
        result = result.filter(charger =>
          charger.status?.toLowerCase() === localFilters.value.status.toLowerCase()
        )
      }

      if (localFilters.value.type) {
        result = result.filter(charger =>
          charger.type?.toLowerCase() === localFilters.value.type.toLowerCase()
        )
      }

      if (localFilters.value.location) {
        result = result.filter(charger =>
          charger.location?.toLowerCase().includes(localFilters.value.location.toLowerCase())
        )
      }

      if (localFilters.value.power) {
        result = result.filter(charger =>
          charger.power >= localFilters.value.power
        )
      }

      return result
    })

    const totalChargers = computed(() => chargersStore.chargers.length)

    const statusStats = computed(() => {
      return filteredChargers.value.reduce((acc, charger) => {
        const status = charger.status?.toLowerCase() || 'unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})
    })

    const hasActiveFilters = computed(() => {
      return Object.values(localFilters.value).some(filter => filter !== '' && filter !== null)
    })

    const canModifyChargers = computed(() => {
      const role = currentUserRole.value
      return role === 'admin' || role === 'manager'
    })

    const canDeleteChargers = computed(() => {
      const role = currentUserRole.value
      return role === 'admin'
    })

    // Methods
    const getUserRole = () => {
      try {
        const user = localStorage.getItem('user')
        if (user) {
          const parsedUser = JSON.parse(user)
          return parsedUser.role || parsedUser.userType || 'user'
        }
        return 'user'
      } catch (error) {
        console.warn('Error getting user role:', error)
        return 'user'
      }
    }

    const updateFilters = () => {
      // Update store filters to sync with other components
      chargersStore.setFilters({
        search: localFilters.value.search,
        status: localFilters.value.status,
        type: localFilters.value.type,
        location: localFilters.value.location,
        power: localFilters.value.power
      })
    }

    const clearAllFilters = () => {
      localFilters.value = {
        search: '',
        status: '',
        type: '',
        location: '',
        power: ''
      }
      chargersStore.clearFilters()
    }

    const handleMarkerClick = (charger) => {
      console.log('Marker clicked:', charger)
      selectedCharger.value = charger
      showToast(`Selected: ${charger.name || 'Unnamed Charger'}`)
    }

    const clearSelection = () => {
      selectedCharger.value = null
    }

    const refreshChargers = async () => {
      try {
        await chargersStore.fetchChargers()
        showToast('Charging stations refreshed')
      } catch (error) {
        console.error('Error refreshing chargers:', error)
        showToast('Failed to refresh charging stations')
      }
    }

    const centerOnUser = () => {
      isGettingLocation.value = true
      
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser')
        isGettingLocation.value = false
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          fallbackCenter.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          centerOnUserLocation.value = true
          defaultZoom.value = 13
          isGettingLocation.value = false
          showToast('Centered on your location')
        },
        (error) => {
          console.warn('Could not get location:', error)
          showToast('Could not get your location')
          isGettingLocation.value = false
        },
        {
          timeout: 10000,
          enableHighAccuracy: true
        }
      )
    }

    const editCharger = (charger) => {
      // Navigate to edit page or emit event to parent
      console.log('Edit charger:', charger)
      showToast('Edit functionality would open here')
      // You can emit an event or use router.push() here
    }

    const deleteCharger = (chargerId) => {
      // Handle delete with confirmation
      console.log('Delete charger:', chargerId)
      showToast('Delete functionality would confirm here')
      // You can emit an event or show a confirmation modal here
    }

    const getChargerCoordinates = (charger) => {
      return charger.coordinates || charger.location_coordinates
    }

    const formatCoordinates = (coords) => {
      if (!coords) return ''
      return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
    }

    const getStatusColor = (status) => {
      const colors = {
        'available': '#28a745',
        'occupied': '#dc3545',
        'maintenance': '#ffc107',
        'out of service': '#6c757d',
        'offline': '#6c757d'
      }
      return colors[(status || '').toLowerCase()] || '#007bff'
    }

    const capitalizeFirst = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const showToast = (message) => {
      toastMessage.value = message
      
      if (typeof window.bootstrap !== 'undefined' && toastElement.value) {
        const toast = new window.bootstrap.Toast(toastElement.value)
        toast.show()
      } else {
        // Fallback for when Bootstrap is not available
        console.log('Toast:', message)
      }
    }

    // Watch for filter changes to update store
    watch(localFilters, updateFilters, { deep: true })

    // Lifecycle
    onMounted(async () => {
      console.log('MapPage mounted')
      
      // Get user role
      currentUserRole.value = getUserRole()
      
      // Fetch chargers if not already loaded
      if (chargersStore.chargers.length === 0) {
        await refreshChargers()
      }
    })

    return {
      // Store
      chargersStore,
      
      // State
      selectedCharger,
      isGettingLocation,
      localFilters,
      centerOnUserLocation,
      fallbackCenter,
      defaultZoom,
      toastMessage,
      toastElement,
      
      // Computed
      filteredChargers,
      totalChargers,
      statusStats,
      hasActiveFilters,
      canModifyChargers,
      canDeleteChargers,
      
      // Methods
      updateFilters,
      clearAllFilters,
      handleMarkerClick,
      clearSelection,
      refreshChargers,
      centerOnUser,
      editCharger,
      deleteCharger,
      getChargerCoordinates,
      formatCoordinates,
      getStatusColor,
      capitalizeFirst,
      showToast
    }
  }
}
</script>

<style scoped>
.sidebar {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.selected-charger {
  position: sticky;
  top: 20px;
}

.map-header {
  padding: 0.5rem 0;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  min-height: 400px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-stats {
  font-size: 0.875rem;
}

/* Map container styles */
:deep(.map-container) {
  border-radius: 0.375rem;
  overflow: hidden;
}

/* Custom scrollbar for sidebar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    max-height: none;
    margin-bottom: 1rem;
  }
  
  .selected-charger {
    position: static;
  }
  
  .map-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .map-controls {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}
</style>