<!-- src/components/MapView.vue -->
<template>
  <div class="map-container" ref="mapContainer">
    <!-- Loading state for map -->
    <div v-if="isLoadingLocation" class="map-loading-overlay">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Getting your location...</p>
      </div>
    </div>

    <!-- No chargers message -->
    <div v-if="!isLoadingLocation && chargers.length === 0" class="map-empty-state">
      <div class="text-center p-4">
        <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No charging stations to display</h5>
        <p class="text-muted">Add some charging stations or adjust your filters</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
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
  emits: ['marker-click'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const isLoadingLocation = ref(false)
    let map = null
    let markersGroup = null
    let userLocationMarker = null

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

    const createCustomIcon = (status) => {
      const color = getMarkerColor(status)
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
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

    const getValidChargerCoordinates = () => {
      return props.chargers.filter(charger => {
        const coords = charger.coordinates || charger.location_coordinates
        return coords &&
          typeof coords.latitude === 'number' &&
          typeof coords.longitude === 'number' &&
          !isNaN(coords.latitude) &&
          !isNaN(coords.longitude)
      })
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
            maximumAge: 300000 // 5 minutes
          }
        )
      })
    }

    const calculateMapBounds = (validChargers, userLocation = null) => {
      const points = []

      // Add charger locations
      validChargers.forEach(charger => {
        const coords = charger.coordinates || charger.location_coordinates
        points.push([coords.latitude, coords.longitude])
      })

      // Add user location if available
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

      // Calculate bounds for multiple points
      const bounds = L.latLngBounds(points)
      return { bounds }
    }

    const initMap = async () => {
      if (map) {
        map.remove()
      }

      const validChargers = getValidChargerCoordinates()
      let userLocation = null

      // Try to get user location if enabled and no chargers available
      if (props.centerOnUserLocation && validChargers.length === 0) {
        try {
          userLocation = await getUserLocation()
          console.log('📍 Got user location:', userLocation)
        } catch (error) {
          console.warn('⚠️ Could not get user location:', error.message)
        }
      }

      // Determine map center and zoom
      const mapBounds = calculateMapBounds(validChargers, userLocation)

      if (mapBounds) {
        if (mapBounds.bounds) {
          // Multiple points - fit to bounds
          map = L.map(mapContainer.value)
          map.fitBounds(mapBounds.bounds, { padding: [20, 20] })
        } else {
          // Single point - center on it
          map = L.map(mapContainer.value).setView(mapBounds.center, mapBounds.zoom)
        }
      } else if (userLocation) {
        // Only user location available
        map = L.map(mapContainer.value).setView([userLocation.lat, userLocation.lng], 13)
      } else {
        // No chargers, no user location - use Madhya Pradesh center (Bhopal)
        map = L.map(mapContainer.value).setView([props.fallbackCenter.lat, props.fallbackCenter.lng], props.defaultZoom)
      }

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Initialize marker group
      markersGroup = L.layerGroup().addTo(map)

      // Add user location marker if available
      if (userLocation) {
        userLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: createUserLocationIcon()
        }).bindPopup('<div class="text-center"><strong>Your Location</strong></div>')
        markersGroup.addLayer(userLocationMarker)
      }
    }

    const updateMarkers = () => {
      if (!markersGroup) return

      // Clear only charger markers, keep user location marker
      markersGroup.eachLayer((layer) => {
        if (layer !== userLocationMarker) {
          markersGroup.removeLayer(layer)
        }
      })

      const validChargers = getValidChargerCoordinates()

      validChargers.forEach((charger) => {
        const coords = charger.coordinates || charger.location_coordinates
        const lat = coords.latitude
        const lng = coords.longitude

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(charger.status)
        })

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
          emit('marker-click', charger)
        })

        markersGroup.addLayer(marker)
      })

      // Adjust map view if we have chargers
      if (validChargers.length > 0 && map) {
        const mapBounds = calculateMapBounds(validChargers)
        if (mapBounds) {
          if (mapBounds.bounds) {
            map.fitBounds(mapBounds.bounds, { padding: [20, 20] })
          } else {
            map.setView(mapBounds.center, mapBounds.zoom)
          }
        }
      }
    }

    onMounted(() => {
      initMap()
      updateMarkers()
    })

    watch(() => props.chargers, () => {
      updateMarkers()
    }, { deep: true })

    return {
      mapContainer,
      isLoadingLocation
    }
  }
}
</script>

<style scoped>
.map-container {
  height: 600px;
  width: 100%;
  position: relative;
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
</style>