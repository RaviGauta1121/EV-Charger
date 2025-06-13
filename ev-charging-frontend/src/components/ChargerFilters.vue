<!-- src/components/ChargerFilters.vue -->
<template>
  <div class="charger-filters">
    <!-- Search Filter -->
    <div class="mb-3">
      <label class="form-label small">Search</label>
      <input 
        v-model="filters.search" 
        type="text" 
        class="form-control form-control-sm" 
        placeholder="Search by name or location..."
        @input="emitFilters"
      >
    </div>

    <!-- Status Filter -->
    <div class="mb-3">
      <label class="form-label small">Status</label>
      <select 
        v-model="filters.status" 
        class="form-select form-select-sm" 
        @change="emitFilters"
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
        v-model="filters.type" 
        class="form-select form-select-sm" 
        @change="emitFilters"
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
        v-model="filters.location" 
        type="text" 
        class="form-control form-control-sm" 
        placeholder="Filter by city..."
        @input="emitFilters"
      >
    </div>

    <!-- Power Filter -->
    <div class="mb-3">
      <label class="form-label small">Minimum Power (kW)</label>
      <input 
        v-model.number="filters.power" 
        type="number" 
        class="form-control form-control-sm" 
        placeholder="e.g. 50"
        min="0"
        @input="emitFilters"
      >
    </div>

    <!-- Clear Filters Button -->
    <div class="d-grid">
      <button 
        class="btn btn-outline-secondary btn-sm" 
        @click="clearFilters"
        :disabled="!hasActiveFilters"
      >
        <i class="fas fa-times me-1"></i>Clear Filters
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ChargerFilters',
  props: {
    initialFilters: {
      type: Object,
      default: () => ({
        search: '',
        status: '',
        type: '',
        location: '',
        power: ''
      })
    }
  },
  emits: ['filters-changed', 'filters-cleared'],
  setup(props, { emit }) {
    const filters = ref({ ...props.initialFilters })

    const hasActiveFilters = computed(() => {
      return Object.values(filters.value).some(filter => filter !== '' && filter !== null)
    })

    const emitFilters = () => {
      emit('filters-changed', { ...filters.value })
    }

    const clearFilters = () => {
      filters.value = {
        search: '',
        status: '',
        type: '',
        location: '',
        power: ''
      }
      emit('filters-cleared')
      emitFilters()
    }

    // Watch for prop changes
    watch(() => props.initialFilters, (newFilters) => {
      filters.value = { ...newFilters }
    }, { deep: true })

    return {
      filters,
      hasActiveFilters,
      emitFilters,
      clearFilters
    }
  }
}
</script>

<style scoped>
.charger-filters {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>