<!-- src/components/ChargerDetailsModal.vue -->
<template>
    <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <!-- Header -->
            <div class="modal-header">
                <div class="header-content">
                    <h2 class="modal-title">{{ charger.name || 'Unnamed Charger' }}</h2>
                    <span class="badge" :class="statusBadgeClass">
                        {{ charger.status || 'Unknown' }}
                    </span>
                </div>
                <button class="close-btn" @click="closeModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Content -->
            <div class="modal-body">
                <!-- Left Panel - Details -->
                <div class="details-panel">
                    <div class="details-section">
                        <h4><i class="fas fa-info-circle me-2"></i>Charger Information</h4>

                        <!-- Location -->
                        <div class="detail-item">
                            <label><i class="fas fa-map-marker-alt me-2"></i>Location</label>
                            <div class="detail-value">{{ charger.location || 'Location not specified' }}</div>
                            <div v-if="charger.coordinates" class="small text-muted">
                                Lat: {{ charger.coordinates.latitude }}, Lon: {{ charger.coordinates.longitude }}
                            </div>
                        </div>

                        <!-- Type & Power -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="detail-item">
                                    <label><i class="fas fa-bolt me-2"></i>Charger Type</label>
                                    <div class="detail-value">{{ charger.type || 'Standard' }}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="detail-item">
                                    <label><i class="fas fa-battery-full me-2"></i>Power Output</label>
                                    <div class="detail-value">{{ formatPower(charger.power) }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Connector Type -->
                        <div v-if="charger.connectorType" class="detail-item">
                            <label><i class="fas fa-plug me-2"></i>Connector Type</label>
                            <div class="detail-value">{{ charger.connectorType }}</div>
                        </div>

                        <!-- Price -->
                        <div v-if="charger.pricePerKwh" class="detail-item">
                            <label><i class="fas fa-dollar-sign me-2"></i>Price per kWh</label>
                            <div class="detail-value text-success">{{ formatPrice(charger.pricePerKwh) }}</div>
                        </div>

                        <!-- Operating Hours -->
                        <div v-if="charger.operatingHours" class="detail-item">
                            <label><i class="fas fa-clock me-2"></i>Operating Hours</label>
                            <div class="detail-value">
                                {{ charger.operatingHours.open }} - {{ charger.operatingHours.close }}
                            </div>
                        </div>

                        <!-- Amenities -->
                        <div v-if="charger.amenities?.length" class="detail-item">
                            <label><i class="fas fa-star me-2"></i>Amenities</label>
                            <div class="amenities-list">
                                <span class="badge bg-light text-dark me-2 mb-2"
                                    v-for="(amenity, i) in charger.amenities" :key="i">
                                    <i class="fas fa-check-circle text-success me-1"></i>{{ amenity }}
                                </span>
                            </div>
                        </div>

                        <!-- Description -->
                        <div v-if="charger.description" class="detail-item">
                            <label><i class="fas fa-file-text me-2"></i>Description</label>
                            <div class="detail-value">{{ charger.description }}</div>
                        </div>
                    </div>
                </div>

                <!-- Right Panel - Map -->
                <div class="map-panel">
                    <h4><i class="fas fa-map me-2"></i>Location Map</h4>
                    <div class="map-container" ref="mapContainer"></div>

                    <!-- Map Controls -->
                    <div class="map-controls">
                        <button class="btn btn-sm btn-outline-primary" @click="centerMap">
                            <i class="fas fa-crosshairs me-1"></i>Center on Charger
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" @click="getDirections">
                            <i class="fas fa-route me-1"></i>Get Directions
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeModal">
                    <i class="fas fa-times me-1"></i>Close
                </button>
                <button v-if="canEdit" class="btn btn-primary" @click="editCharger">
                    <i class="fas fa-edit me-1"></i>Edit Charger
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

export default {
    name: 'ChargerDetailsModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        charger: {
            type: Object,
            required: true
        },
        canEdit: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close', 'edit'],
    setup(props, { emit }) {
        const mapContainer = ref(null)
        let map = null
        let marker = null

        const statusBadgeClass = computed(() => {
            const status = (props.charger.status || '').toLowerCase()
            return {
                'available': 'bg-success',
                'occupied': 'bg-warning text-dark',
                'maintenance': 'bg-info text-dark',
                'out of service': 'bg-danger'
            }[status] || 'bg-secondary'
        })

        const formatPower = (power) => {
            if (!power) return 'Not specified'
            if (typeof power === 'number') return `${power} kW`
            const parsed = parseFloat(power)
            return isNaN(parsed) ? power : `${parsed} kW`
        }

        const formatPrice = (price) => {
            if (!price) return 'Not specified'
            return typeof price === 'number' ? `$${price.toFixed(2)}` : price
        }

        const getMarkerColor = (status) => {
            const colors = {
                'available': '#28a745',
                'occupied': '#ffc107',
                'maintenance': '#17a2b8',
                'out of service': '#dc3545'
            }
            return colors[(status || '').toLowerCase()] || '#007bff'
        }

        const createCustomIcon = (status) => {
            const color = getMarkerColor(status)
            return L.divIcon({
                className: 'custom-marker',
                html: `<div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        "></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }

        const initMap = async () => {
            if (!props.show || !mapContainer.value) return

            await nextTick()

            if (map) {
                map.remove()
            }

            // Get coordinates or use default
            const coords = props.charger.coordinates
            const lat = coords?.latitude || 21.2514 + (Math.random() - 0.5) * 0.1
            const lng = coords?.longitude || 81.6296 + (Math.random() - 0.5) * 0.1

            map = L.map(mapContainer.value).setView([lat, lng], 15)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map)

            // Add marker for the charger
            marker = L.marker([lat, lng], {
                icon: createCustomIcon(props.charger.status)
            }).addTo(map)

            const popupContent = `
        <div class="p-2">
          <h6 class="mb-1">${props.charger.name || 'Unnamed Charger'}</h6>
          <p class="mb-1 small">${props.charger.location || 'Location not specified'}</p>
          <p class="mb-1">
            <span class="badge bg-secondary">${props.charger.type || 'Standard'}</span>
            <span class="badge bg-primary ms-1">${formatPower(props.charger.power)}</span>
          </p>
          <span class="badge" style="background-color: ${getMarkerColor(props.charger.status)}">
            ${props.charger.status || 'Unknown'}
          </span>
        </div>
      `

            marker.bindPopup(popupContent)

            // Resize map after initialization
            setTimeout(() => {
                if (map) {
                    map.invalidateSize()
                }
            }, 100)
        }

        const centerMap = () => {
            if (map && marker) {
                map.setView(marker.getLatLng(), 15)
            }
        }

        const getDirections = () => {
            const coords = props.charger.coordinates
            const lat = coords?.latitude || 21.2514
            const lng = coords?.longitude || 81.6296
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
            window.open(url, '_blank')
        }

        const closeModal = () => {
            if (map) {
                map.remove()
                map = null
                marker = null
            }
            emit('close')
        }

        const editCharger = () => {
            emit('edit', props.charger)
        }

        // Watch for show prop changes
        watch(() => props.show, (newVal) => {
            if (newVal) {
                nextTick(() => {
                    initMap()
                })
            } else {
                if (map) {
                    map.remove()
                    map = null
                    marker = null
                }
            }
        })

        // Handle escape key
        const handleKeydown = (e) => {
            if (e.key === 'Escape' && props.show) {
                closeModal()
            }
        }

        onMounted(() => {
            document.addEventListener('keydown', handleKeydown)
        })

        return {
            mapContainer,
            statusBadgeClass,
            formatPower,
            formatPrice,
            centerMap,
            getDirections,
            closeModal,
            editCharger
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: 20px;
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 1200px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.modal-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s;
}

.close-btn:hover {
    background-color: #f8f9fa;
    color: #333;
}

.modal-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.details-panel {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    border-right: 1px solid #e9ecef;
}

.map-panel {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
}

.details-section h4 {
    color: #333;
    margin-bottom: 20px;
    font-size: 1.2rem;
    font-weight: 600;
}

.detail-item {
    margin-bottom: 20px;
}

.detail-item label {
    display: block;
    font-weight: 600;
    color: #555;
    margin-bottom: 6px;
    font-size: 0.95rem;
}

.detail-value {
    color: #333;
    font-size: 1rem;
    line-height: 1.5;
}

.amenities-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.map-container {
    flex: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e9ecef;
    min-height: 300px;
}

.map-controls {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* Responsive design */
@media (max-width: 768px) {
    .modal-content {
        max-width: 100%;
        margin: 10px;
        max-height: calc(100vh - 20px);
    }

    .modal-body {
        flex-direction: column;
    }

    .details-panel {
        border-right: none;
        border-bottom: 1px solid #e9ecef;
    }

    .map-container {
        min-height: 250px;
    }
}

/* Badge styles */
.badge {
    font-size: 0.85rem;
    padding: 6px 12px;
    border-radius: 6px;
}

/* Custom scrollbar */
.details-panel::-webkit-scrollbar {
    width: 6px;
}

.details-panel::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.details-panel::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.details-panel::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>