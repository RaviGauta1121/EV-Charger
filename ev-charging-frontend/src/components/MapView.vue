<!-- src/components/MapView.vue -->
<template>
  <div class="map-wrapper">
    <!-- Debug Information -->
    <div v-if="showDebug" class="debug-panel">
      <h6>🐛 Debug Information</h6>
      <p><strong>Total Chargers:</strong> {{ chargers.length }}</p>
      <p><strong>Valid Chargers:</strong> {{ validChargers.length }}</p>
      <p><strong>Sample Charger Structure:</strong></p>
      <pre v-if="chargers.length > 0">{{ JSON.stringify(chargers[0], null, 2) }}</pre>
      <div v-if="validChargers.length === 0 && chargers.length > 0" class="alert alert-warning">
        ⚠️ No chargers have valid coordinates! Expected format: <code>coordinates: { latitude: number, longitude: number }</code>
      </div>
      <button class="btn btn-sm btn-secondary" @click="loadSampleData">Load Sample Data</button>
      <button class="btn btn-sm btn-outline-secondary ms-2" @click="showDebug = false">Hide Debug</button>
    </div>

    <div class="map-container" ref="mapContainer">
      <!-- Loading state for map -->
      <div v-if="isLoadingLocation" class="map-loading-overlay">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Getting your location...</p>
        </div>
      </div>

      <!-- No chargers message -->
      <div v-if="!isLoadingLocation && validChargers.length === 0" class="map-empty-state">
        <div class="text-center p-4">
          <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No charging stations to display</h5>
          <p class="text-muted">{{ chargers.length === 0 ? 'Add some charging stations or adjust your filters' : 'Chargers found but missing valid coordinates' }}</p>
          <button v-if="!showDebug" class="btn btn-info btn-sm" @click="showDebug = true">
            🐛 Show Debug Info
          </button>
          <button class="btn btn-success btn-sm ms-2" @click="loadSampleData">
            📍 Load Sample Chargers
          </button>
        </div>
      </div>

      <!-- Markers count display -->
      <div v-if="validChargers.length > 0" class="markers-info">
        <span class="badge bg-primary">{{ validChargers.length }} charging stations</span>
      </div>
    </div>

    <!-- Selected Charger Details Panel -->
    <div v-if="selectedCharger" class="selected-charger-panel">
      <div class="panel-header">
        <h5 class="panel-title">
          <i class="fas fa-charging-station me-2"></i>
          Selected Charger
        </h5>
        <button 
          type="button" 
          class="btn-close" 
          @click="clearSelection"
          aria-label="Close"
        ></button>
      </div>
      
      <div class="panel-content">
        <div class="charger-info">
          <h6 class="charger-name">{{ selectedCharger.name || 'Unnamed Charger' }}</h6>
          
          <div class="info-row">
            <i class="fas fa-map-marker-alt text-muted me-2"></i>
            <span>{{ selectedCharger.location || 'Location not specified' }}</span>
          </div>
          
          <div class="info-row">
            <i class="fas fa-plug text-muted me-2"></i>
            <span class="badge bg-secondary me-2">{{ selectedCharger.type || 'Standard' }}</span>
            <span class="badge bg-primary">{{ selectedCharger.power || 0 }}kW</span>
          </div>
          
          <div class="info-row">
            <i class="fas fa-info-circle text-muted me-2"></i>
            <span 
              class="badge status-badge" 
              :style="{ backgroundColor: getMarkerColor(selectedCharger.status) }"
            >
              {{ selectedCharger.status || 'Unknown' }}
            </span>
          </div>
          
          <div class="info-row" v-if="selectedCharger.coordinates || selectedCharger.location_coordinates">
            <i class="fas fa-crosshairs text-muted me-2"></i>
            <small class="text-muted">
              {{ getCoordinatesText(selectedCharger) }}
            </small>
          </div>
          
          <!-- Additional charger details if available -->
          <div v-if="selectedCharger.description" class="info-row">
            <i class="fas fa-file-text text-muted me-2"></i>
            <small>{{ selectedCharger.description }}</small>
          </div>
          
          <div v-if="selectedCharger.price" class="info-row">
            <i class="fas fa-dollar-sign text-muted me-2"></i>
            <span class="text-success">₹{{ selectedCharger.price }}/kWh</span>
          </div>
          
          <div v-if="selectedCharger.connectors && selectedCharger.connectors.length > 0" class="info-row">
            <i class="fas fa-plug text-muted me-2"></i>
            <div class="connectors-list">
              <span 
                v-for="connector in selectedCharger.connectors" 
                :key="connector.id || connector.type"
                class="badge bg-outline-secondary me-1 mb-1"
              >
                {{ connector.type || connector.name }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="panel-actions mt-3">
          <button 
            class="btn btn-primary btn-sm me-2"
            @click="centerOnCharger"
          >
            <i class="fas fa-crosshairs me-1"></i>
            Center on Map
          </button>
          
          <button 
            class="btn btn-outline-secondary btn-sm"
            @click="getDirections"
          >
            <i class="fas fa-directions me-1"></i>
            Directions
          </button>
        </div>
      </div>
    </div>

    <!-- Instruction message when no charger is selected -->
    <div v-else-if="validChargers.length > 0" class="selection-hint">
      <div class="hint-content">
        <i class="fas fa-hand-pointer text-muted me-2"></i>
        <span class="text-muted">Click a marker on the map to see charger details</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import L from 'leaflet'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

export default {
  name: 'MapView',
  props: {
    chargers: {
      type: Array,
      default: () => []
    },
    centerOnUserLocation: {
      type: Boolean,
      default: true
    },
    fallbackCenter: {
      type: Object,
      default: () => ({ 
        lat: 23.2599, 
        lng: 77.4126 // Bhopal, Madhya Pradesh (Capital and central location)
      })
    },
    defaultZoom: {
      type: Number,
      default: 7 // Adjusted zoom for Madhya Pradesh state view
    }
  },
  emits: ['marker-click', 'charger-selected', 'update:chargers'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const isLoadingLocation = ref(false)
    const selectedCharger = ref(null)
    const showDebug = ref(false)
    let map = null
    let markersGroup = null
    let userLocationMarker = null
    let selectedMarker = null

    // Sample data for testing
    const sampleChargers = [
      {
        id: 1,
        name: "Central Mall Charging Station",
        location: "Central Mall, Bhopal",
        type: "Fast DC",
        power: 50,
        status: "available",
        coordinates: {
          latitude: 23.2599,
          longitude: 77.4126
        },
        description: "Located in the main parking area",
        price: 12,
        connectors: [
          { type: "CCS", id: 1 },
          { type: "CHAdeMO", id: 2 }
        ]
      },
      {
        id: 2,
        name: "BHEL Township Charger",
        location: "BHEL Township, Bhopal",
        type: "Standard AC",
        power: 22,
        status: "occupied",
        coordinates: {
          latitude: 23.2156,
          longitude: 77.4304
        },
        description: "Employee parking area",
        price: 8
      },
      {
        id: 3,
        name: "Railway Station Fast Charger",
        location: "Bhopal Junction Railway Station",
        type: "Ultra Fast DC",
        power: 120,
        status: "maintenance",
        coordinates: {
          latitude: 23.2685,
          longitude: 77.3972
        },
        description: "Near platform 1 parking",
        price: 15,
        connectors: [
          { type: "CCS", id: 1 },
          { type: "Type 2", id: 2 }
        ]
      },
      {
        id: 4,
        name: "Airport Charging Hub",
        location: "Raja Bhoj Airport, Bhopal",
        type: "Fast DC",
        power: 75,
        status: "available",
        coordinates: {
          latitude: 23.2875,
          longitude: 77.3374
        },
        description: "Airport parking level 2",
        price: 14
      },
      {
        id: 5,
        name: "City Center Charger",
        location: "New Market, Bhopal",
        type: "Standard AC",
        power: 11,
        status: "out of service",
        coordinates: {
          latitude: 23.2739,
          longitude: 77.4022
        },
        description: "Street-side charging point",
        price: 6
      }
    ]

    const validChargers = computed(() => {
      return props.chargers.filter(charger => {
        const coords = charger.coordinates || charger.location_coordinates
        if (!coords) {
          console.warn('Charger missing coordinates:', charger)
          return false
        }
        
        const isValid = typeof coords.latitude === 'number' &&
          typeof coords.longitude === 'number' &&
          !isNaN(coords.latitude) &&
          !isNaN(coords.longitude) &&
          coords.latitude >= -90 && coords.latitude <= 90 &&
          coords.longitude >= -180 && coords.longitude <= 180
          
        if (!isValid) {
          console.warn('Charger has invalid coordinates:', charger, coords)
        }
        
        return isValid
      })
    })

    const loadSampleData = () => {
      emit('update:chargers', sampleChargers)
      showDebug.value = false
      console.log('✅ Loaded sample chargers:', sampleChargers.length)
    }

    const getMarkerColor = (status) => {
      const colors = {
        'available': '#28a745',
        'occupied': '#dc3545',
        'maintenance': '#ffc107',
        'out of service': '#6c757d',
        'offline': '#6c757d'
      }
      return colors[(status || '').toLowerCase()] || '#007bff'
    }

    const createCustomIcon = (status, isSelected = false) => {
      const color = getMarkerColor(status)
      const size = isSelected ? 26 : 20
      const borderWidth = isSelected ? 4 : 3
      
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${borderWidth}px solid ${isSelected ? '#ffd700' : 'white'};
          box-shadow: 0 2px ${isSelected ? '8px' : '4px'} rgba(0,0,0,${isSelected ? '0.4' : '0.3'});
          ${isSelected ? 'animation: selectedPulse 2s infinite;' : ''}
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
      })
    }

    const createUserLocationIcon = () => {
      return L.divIcon({
        className: 'user-location-marker',
        html: `<div style="
          background-color: #007bff;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,123,255,0.5);
          animation: pulse 2s infinite;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }

    const getCoordinatesText = (charger) => {
      const coords = charger.coordinates || charger.location_coordinates
      if (!coords) return 'Coordinates not available'
      return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
    }

    const selectCharger = (charger) => {
      console.log('🎯 Selected charger:', charger)
      selectedCharger.value = charger
      updateMarkerSelection(charger)
      emit('marker-click', charger)
      emit('charger-selected', charger)
    }

    const clearSelection = () => {
      selectedCharger.value = null
      selectedMarker = null
      updateMarkers()
    }

    const updateMarkerSelection = (charger) => {
      if (!markersGroup) return
      
      markersGroup.eachLayer((layer) => {
        if (layer !== userLocationMarker && layer._charger) {
          layer.setIcon(createCustomIcon(layer._charger.status, false))
        }
      })
      
      markersGroup.eachLayer((layer) => {
        if (layer !== userLocationMarker && layer._charger === charger) {
          layer.setIcon(createCustomIcon(charger.status, true))
          selectedMarker = layer
        }
      })
    }

    const centerOnCharger = () => {
      if (!selectedCharger.value || !map) return
      
      const coords = selectedCharger.value.coordinates || selectedCharger.value.location_coordinates
      if (coords) {
        map.setView([coords.latitude, coords.longitude], 16, {
          animate: true,
          duration: 1
        })
        
        if (selectedMarker) {
          selectedMarker.openPopup()
        }
      }
    }

    const getDirections = () => {
      if (!selectedCharger.value) return
      
      const coords = selectedCharger.value.coordinates || selectedCharger.value.location_coordinates
      if (coords) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`
        window.open(url, '_blank')
      }
    }

    const getUserLocation = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'))
          return
        }

        isLoadingLocation.value = true

        navigator.geolocation.getCurrentPosition(
          (position) => {
            isLoadingLocation.value = false
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          },
          (error) => {
            isLoadingLocation.value = false
            console.warn('Could not get user location:', error.message)
            reject(error)
          },
          {
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 300000
          }
        )
      })
    }

    const calculateMapBounds = (validChargers, userLocation = null) => {
      const points = []

      validChargers.forEach(charger => {
        const coords = charger.coordinates || charger.location_coordinates
        points.push([coords.latitude, coords.longitude])
      })

      if (userLocation) {
        points.push([userLocation.lat, userLocation.lng])
      }

      if (points.length === 0) {
        return null
      }

      if (points.length === 1) {
        return {
          center: points[0],
          zoom: 15
        }
      }

      const bounds = L.latLngBounds(points)
      return { bounds }
    }

    const initMap = async () => {
      if (map) {
        map.remove()
      }

      console.log('🗺️ Initializing map...')
      console.log('📍 Valid chargers:', validChargers.value.length)

      let userLocation = null

      if (props.centerOnUserLocation && validChargers.value.length === 0) {
        try {
          userLocation = await getUserLocation()
          console.log('📍 Got user location:', userLocation)
        } catch (error) {
          console.warn('⚠️ Could not get user location:', error.message)
        }
      }

      const mapBounds = calculateMapBounds(validChargers.value, userLocation)

      if (mapBounds) {
        if (mapBounds.bounds) {
          map = L.map(mapContainer.value)
          map.fitBounds(mapBounds.bounds, { padding: [20, 20] })
        } else {
          map = L.map(mapContainer.value).setView(mapBounds.center, mapBounds.zoom)
        }
      } else if (userLocation) {
        map = L.map(mapContainer.value).setView([userLocation.lat, userLocation.lng], 13)
      } else {
        map = L.map(mapContainer.value).setView([props.fallbackCenter.lat, props.fallbackCenter.lng], props.defaultZoom)
      }

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      markersGroup = L.layerGroup().addTo(map)

      if (userLocation) {
        userLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: createUserLocationIcon()
        }).bindPopup('<div class="text-center"><strong>Your Location</strong></div>')
        markersGroup.addLayer(userLocationMarker)
      }

      console.log('✅ Map initialized successfully')
    }

    const updateMarkers = () => {
      if (!markersGroup) return

      console.log('🔄 Updating markers...')
      
      markersGroup.eachLayer((layer) => {
        if (layer !== userLocationMarker) {
          markersGroup.removeLayer(layer)
        }
      })

      console.log('📍 Adding', validChargers.value.length, 'markers')

      validChargers.value.forEach((charger, index) => {
        const coords = charger.coordinates || charger.location_coordinates
        const lat = coords.latitude
        const lng = coords.longitude

        console.log(`Adding marker ${index + 1}:`, charger.name, `(${lat}, ${lng})`)

        const isSelected = selectedCharger.value === charger
        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(charger.status, isSelected)
        })

        marker._charger = charger

        const popupContent = `
          <div class="p-2">
            <h6 class="mb-1">${charger.name || 'Unnamed Charger'}</h6>
            <p class="mb-1 small">${charger.location || 'Location not specified'}</p>
            <p class="mb-1">
              <span class="badge bg-secondary">${charger.type || 'Standard'}</span>
              <span class="badge bg-primary ms-1">${charger.power || 0}kW</span>
            </p>
            <span class="badge" style="background-color: ${getMarkerColor(charger.status)}">
              ${charger.status || 'Unknown'}
            </span>
            <div class="mt-1 small text-muted">
              Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}
            </div>
          </div>
        `

        marker.bindPopup(popupContent)
        marker.on('click', () => {
          selectCharger(charger)
        })

        if (isSelected) {
          selectedMarker = marker
        }

        markersGroup.addLayer(marker)
      })

      if (validChargers.value.length > 0 && map) {
        const mapBounds = calculateMapBounds(validChargers.value)
        if (mapBounds) {
          if (mapBounds.bounds) {
            map.fitBounds(mapBounds.bounds, { padding: [20, 20] })
          } else {
            map.setView(mapBounds.center, mapBounds.zoom)
          }
        }
      }

      console.log('✅ Markers updated successfully')
    }

    onMounted(() => {
      console.log('🚀 MapView mounted with', props.chargers.length, 'chargers')
      initMap()
      updateMarkers()
    })

    watch(() => props.chargers, (newChargers) => {
      console.log('🔄 Chargers updated:', newChargers.length)
      updateMarkers()
    }, { deep: true })

    watch(validChargers, (newValidChargers) => {
      console.log('🔄 Valid chargers changed:', newValidChargers.length)
      updateMarkers()
    })

    return {
      mapContainer,
      isLoadingLocation,
      selectedCharger,
      showDebug,
      validChargers,
      getMarkerColor,
      getCoordinatesText,
      clearSelection,
      centerOnCharger,
      getDirections,
      loadSampleData
    }
  }
}
</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.debug-panel {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.debug-panel pre {
  background: #e9ecef;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  max-height: 200px;
  overflow-y: auto;
}

.map-container {
  height: 600px;
  width: 100%;
  position: relative;
  flex-shrink: 0;
}

.markers-info {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.map-loading-overlay {
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
}

.map-empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  z-index: 1000;
}

.selected-charger-panel {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.panel-title {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
}

.panel-content {
  padding: 20px;
}

.charger-info {
  margin-bottom: 16px;
}

.charger-name {
  color: #212529;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  min-height: 24px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.connectors-list {
  display: flex;
  flex-wrap: wrap;
}

.status-badge {
  color: white !important;
}

.panel-actions {
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}

.selection-hint {
  padding: 20px;
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-top: 20px;
}

.hint-content {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
}

.alert {
  padding: 8px 12px;
  border-radius: 4px;
  margin: 8px 0;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

/* Animation for user location marker */
:global(.user-location-marker div) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.5);
  }

  50% {
    box-shadow: 0 2px 15px rgba(0, 123, 255, 0.8);
  }

  100% {
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.5);
  }
}

/* Animation for selected marker */
:global(.custom-marker div) {
  transition: all 0.3s ease;
}

@keyframes selectedPulse {
  0% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  50% {
    box-shadow: 0 2px 15px rgba(255, 215, 0, 0.8);
  }

  100% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .panel-header {
    padding: 12px 16px;
  }
  
  .panel-content {
    padding: 16px;
  }
  
  .panel-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .panel-actions .btn {
    width: 100%;
  }
  
  .info-row {
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>