<!-- Updated ChargerCard.vue with Modal Integration -->
<template>
  <div class="card h-100 charger-card" :class="cardClass">
    <div class="card-body d-flex flex-column">
      <!-- Title & Status -->
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="card-title mb-1">{{ charger.name || 'Unnamed Charger' }}</h5>
        <span class="badge" :class="statusBadgeClass">
          {{ charger.status || 'Unknown' }}
        </span>
      </div>

      <!-- Location -->
      <p class="text-muted mb-2" :title="getCoordinatesTooltip()">
        <i class="fas fa-map-marker-alt me-1"></i>
        {{ charger.location || 'Location not specified' }}
      </p>

      <!-- Charger Type & Power -->
      <div class="charger-details mb-3">
        <div class="row g-2">
          <div class="col-6">
            <small class="text-muted">Type</small>
            <div class="fw-semibold">{{ charger.type || 'Standard' }}</div>
          </div>
          <div class="col-6">
            <small class="text-muted">Power</small>
            <div class="fw-semibold">{{ formatPower(charger.power) }}</div>
          </div>
        </div>
      </div>

      <!-- Connector Type -->
      <div v-if="charger.connectorType" class="mb-3">
        <small class="text-muted">Connector</small>
        <div class="fw-semibold">
          <i class="fas fa-plug me-1"></i>
          {{ charger.connectorType }}
        </div>
      </div>

      <!-- Price -->
      <div v-if="charger.pricePerKwh" class="mb-3">
        <small class="text-muted">Price per kWh</small>
        <div class="fw-semibold text-success">
          <i class="fas fa-dollar-sign me-1"></i>
          {{ formatPrice(charger.pricePerKwh) }}
        </div>
      </div>

      <!-- Operating Hours -->
      <div v-if="charger.operatingHours" class="mb-3">
        <small class="text-muted">Operating Hours</small>
        <div class="fw-semibold">
          {{ charger.operatingHours.open }} - {{ charger.operatingHours.close }}
        </div>
      </div>

      <!-- Amenities -->
      <div v-if="charger.amenities?.length" class="mb-3">
        <small class="text-muted">Amenities</small>
        <div class="small">
          <span class="badge bg-light text-dark me-1 mb-1" v-for="(amenity, i) in charger.amenities" :key="i">
            <i class="fas fa-check-circle text-success me-1"></i>{{ amenity }}
          </span>
        </div>
      </div>

      <!-- Description -->
      <div v-if="charger.description" class="mb-3">
        <small class="text-muted">Description</small>
        <div class="small">{{ truncateText(charger.description, 100) }}</div>
      </div>

      <!-- Buttons -->
      <div class="mt-auto">
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm flex-fill" @click="viewDetails" :disabled="isLoading">
            <i class="fas fa-eye me-1"></i> View Details
          </button>

          <button v-if="canEdit" class="btn btn-outline-secondary btn-sm" @click="editCharger" :disabled="isLoading"
            title="Edit charger">
            <i class="fas fa-edit"></i>
          </button>
          <button v-else-if="showDisabledEdit" class="btn btn-outline-secondary btn-sm" disabled
            title="Admin privileges required to edit">
            <i class="fas fa-edit"></i>
          </button>

          <button v-if="canDelete" class="btn btn-outline-danger btn-sm" @click="deleteCharger" :disabled="isLoading"
            title="Delete charger">
            <i class="fas fa-trash"></i>
          </button>
          <button v-else-if="showDisabledDelete" class="btn btn-outline-danger btn-sm" disabled
            title="Admin privileges required to delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>

        <div v-if="showPermissionInfo" class="mt-2">
          <small class="text-muted">
            <i class="fas fa-info-circle me-1"></i>
            Limited access - contact admin for modifications
          </small>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="card-loading-overlay">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>

  <!-- Charger Details Modal -->
  <ChargerDetailsModal 
    :show="showDetailsModal"
    :charger="charger"
    :canEdit="canEdit"
    @close="closeDetailsModal"
    @edit="handleEdit"
  />
</template>

<script>
import { ref, computed } from 'vue'
import ChargerDetailsModal from '../components/ChargerDetailsModal.vue'

export default {
  name: 'ChargerCard',
  components: {
    ChargerDetailsModal
  },
  props: {
    charger: {
      type: Object,
      required: true
    },
    canEdit: Boolean,
    canDelete: Boolean,
    showDisabledButtons: {
      type: Boolean,
      default: true
    }
  },
  emits: ['edit', 'delete', 'update', 'remove', 'view-details'],
  setup(props, { emit }) {
    const isLoading = ref(false)
    const showDetailsModal = ref(false)

    const cardClass = computed(() => {
      const status = (props.charger.status || '').toLowerCase()
      return [
        status === 'available' ? 'border-success' :
          status === 'occupied' ? 'border-warning' :
            status === 'maintenance' ? 'border-info' :
              status === 'out of service' ? 'border-danger' :
                'border-secondary',
        isLoading.value ? 'loading-pulse' : ''
      ]
    })

    const statusBadgeClass = computed(() => {
      const status = (props.charger.status || '').toLowerCase()
      return {
        'available': 'bg-success',
        'occupied': 'bg-warning text-dark',
        'maintenance': 'bg-info text-dark',
        'out of service': 'bg-danger'
      }[status] || 'bg-secondary'
    })

    const showDisabledEdit = computed(() => props.showDisabledButtons && !props.canEdit)
    const showDisabledDelete = computed(() => props.showDisabledButtons && !props.canDelete)
    const showPermissionInfo = computed(() => !props.canEdit && !props.canDelete && props.showDisabledButtons)

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

    const truncateText = (text, maxLength) => {
      return !text ? '' : text.length <= maxLength ? text : text.substring(0, maxLength) + '...'
    }

    const getCoordinatesTooltip = () => {
      const { latitude, longitude } = props.charger.coordinates || {}
      return latitude && longitude ? `Lat: ${latitude}, Lon: ${longitude}` : ''
    }

    const viewDetails = () => {
      showDetailsModal.value = true
      emit('view-details', props.charger)
    }

    const closeDetailsModal = () => {
      showDetailsModal.value = false
    }

    const handleEdit = (charger) => {
      showDetailsModal.value = false
      emit('edit', charger)
    }

    const editCharger = async () => {
      if (!props.canEdit) return
      isLoading.value = true
      emit('edit', props.charger)
      emit('update', props.charger)
      await new Promise(r => setTimeout(r, 200))
      isLoading.value = false
    }

    const deleteCharger = async () => {
      if (!props.canDelete) return
      isLoading.value = true
      emit('delete', props.charger._id)
      emit('remove', props.charger._id)
      await new Promise(r => setTimeout(r, 200))
      isLoading.value = false
    }

    return {
      isLoading,
      showDetailsModal,
      cardClass,
      statusBadgeClass,
      showDisabledEdit,
      showDisabledDelete,
      showPermissionInfo,
      formatPower,
      formatPrice,
      truncateText,
      getCoordinatesTooltip,
      viewDetails,
      closeDetailsModal,
      handleEdit,
      editCharger,
      deleteCharger
    }
  }
}
</script>

<style scoped>
.charger-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.charger-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

.charger-details {
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #0d6efd;
}

.fw-semibold {
  font-weight: 600;
}

.loading-pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
  }
}
</style>