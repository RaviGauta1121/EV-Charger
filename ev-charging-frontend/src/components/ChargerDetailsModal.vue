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
            <div class="modal-body" ref="modalBody" @scroll="handleScroll">
                <!-- Left Panel - Details (Desktop) / Top Section (Mobile) -->
                <div class="details-panel" ref="detailsSection">
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

                        <!-- Scroll indicator (Mobile only) -->
                        <div class="scroll-indicator mobile-only">
                            <div class="scroll-text">
                                <i class="fas fa-chevron-down"></i>
                                Scroll down to view map
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Panel - Map (Desktop) / Bottom Section (Mobile) -->
                <div class="map-panel" ref="mapSection">
                    <div class="map-header">
                        <h4><i class="fas fa-map me-2"></i>Location Map</h4>
                        <div class="map-controls">
                            <button class="btn btn-sm btn-outline-primary" @click="centerMap">
                                <i class="fas fa-crosshairs me-1"></i>Center
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" @click="getDirections">
                                <i class="fas fa-route me-1"></i>Directions
                            </button>
                        </div>
                    </div>
                    <div class="map-container" ref="mapContainer"></div>
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
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
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
        const modalBody = ref(null)
        const detailsSection = ref(null)
        const mapSection = ref(null)
        const mapContainer = ref(null)
        let map = null
        let marker = null
        let mapInitialized = false

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
            if (!props.show || !mapContainer.value || mapInitialized) return

            await nextTick()

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
            mapInitialized = true

            // Resize map after initialization
            setTimeout(() => {
                if (map) {
                    map.invalidateSize()
                }
            }, 100)
        }

        const handleScroll = () => {
            // Only handle scroll on mobile devices
            if (window.innerWidth >= 768) return
            
            if (!modalBody.value || !mapSection.value) return

            const scrollTop = modalBody.value.scrollTop
            const scrollHeight = modalBody.value.scrollHeight
            const clientHeight = modalBody.value.clientHeight
            const mapSectionTop = mapSection.value.offsetTop

            // Initialize map when user scrolls near the map section
            if (scrollTop + clientHeight >= mapSectionTop - 100 && !mapInitialized) {
                initMap()
            }

            // Resize map when it becomes visible
            if (map && scrollTop + clientHeight >= mapSectionTop) {
                setTimeout(() => {
                    if (map) {
                        map.invalidateSize()
                    }
                }, 100)
            }
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
                mapInitialized = false
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
                    // Reset scroll position when modal opens (mobile only)
                    if (modalBody.value && window.innerWidth < 768) {
                        modalBody.value.scrollTop = 0
                    }
                    // Initialize map immediately on desktop
                    if (window.innerWidth >= 768) {
                        initMap()
                    }
                })
            } else {
                if (map) {
                    map.remove()
                    map = null
                    marker = null
                    mapInitialized = false
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

        onUnmounted(() => {
            document.removeEventListener('keydown', handleKeydown)
            if (map) {
                map.remove()
            }
        })

        return {
            modalBody,
            detailsSection,
            mapSection,
            mapContainer,
            statusBadgeClass,
            formatPower,
            formatPrice,
            handleScroll,
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
    flex-shrink: 0;
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

.scroll-indicator {
    text-align: center;
    padding: 30px 0;
    color: #6c757d;
    font-size: 0.9rem;
    animation: bounce 2s infinite;
    display: none;
}

.scroll-text {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
}

.map-header h4 {
    color: #333;
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.map-controls {
    display: flex;
    gap: 8px;
}

.map-container {
    flex: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e9ecef;
    min-height: 300px;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-shrink: 0;
}

/* Animations */
@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-10px);
    }
    60% {
        transform: translateY(-5px);
    }
}

/* Badge styles */
.badge {
    font-size: 0.85rem;
    padding: 6px 12px;
    border-radius: 6px;
}

/* Custom scrollbar for desktop */
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

/* Mobile scrollbar */
.modal-body::-webkit-scrollbar {
    width: 8px;
}

.modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
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
        overflow-y: auto;
        scroll-behavior: smooth;
    }

    .details-panel {
        border-right: none;
        border-bottom: 1px solid #e9ecef;
        overflow-y: visible;
        padding: 16px;
    }

    .map-panel {
        background-color: #f8f9fa;
        min-height: 400px;
        padding: 16px;
    }

    .map-container {
        height: 300px;
        background-color: #e9ecef;
    }

    .scroll-indicator {
        display: block !important;
    }

    .mobile-only {
        display: block !important;
    }

    .map-controls {
        flex-wrap: wrap;
    }

    .modal-footer {
        flex-wrap: wrap;
    }
}

@media (max-width: 480px) {
    .modal-title {
        font-size: 1.25rem;
    }

    .map-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .map-controls {
        width: 100%;
        justify-content: center;
    }
}

/* Row and column classes for compatibility */
.row {
    display: flex;
    flex-wrap: wrap;
    margin: -8px;
}

.col-md-6 {
    flex: 0 0 50%;
    padding: 8px;
}

@media (max-width: 768px) {
    .col-md-6 {
        flex: 0 0 100%;
    }
}

/* Utility classes */
.me-1 { margin-right: 0.25rem; }
.me-2 { margin-right: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.ms-1 { margin-left: 0.25rem; }
.p-2 { padding: 0.5rem; }
.small { font-size: 0.875rem; }
.text-muted { color: #6c757d; }
.text-success { color: #28a745; }
.text-dark { color: #343a40; }

/* Button styles */
.btn {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 4px;
    text-decoration: none;
    transition: all 0.15s ease-in-out;
}

.btn-sm {
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 3px;
}

.btn-primary {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
}

.btn-primary:hover {
    background-color: #0056b3;
    border-color: #0056b3;
}

.btn-secondary {
    color: #fff;
    background-color: #6c757d;
    border-color: #6c757d;
}

.btn-secondary:hover {
    background-color: #545b62;
    border-color: #545b62;
}

.btn-outline-primary {
    color: #007bff;
    background-color: transparent;
    border-color: #007bff;
}

.btn-outline-primary:hover {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
}

.btn-outline-secondary {
    color: #6c757d;
    background-color: transparent;
    border-color: #6c757d;
}

.btn-outline-secondary:hover {
    color: #fff;
    background-color: #6c757d;
    border-color: #6c757d;
}

/* Badge background colors */
.bg-success { background-color: #28a745; }
.bg-warning { background-color: #ffc107; }
.bg-info { background-color: #17a2b8; }
.bg-danger { background-color: #dc3545; }
.bg-secondary { background-color: #6c757d; }
.bg-primary { background-color: #007bff; }
.bg-light { 
    background-color: #f8f9fa;
    color: #343a40;
}
</style>