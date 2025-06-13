<!-- src/views/Dashboard.vue -->
<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">Dashboard</h1>

        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Debug Info (remove in production) -->
        <div v-if="!loading && debugMode" class="alert alert-info mb-4">
          <h6>Debug Info:</h6>
          <p><strong>Total Chargers:</strong> {{ chargers.length }}</p>
          <p><strong>Chargers Data:</strong> {{ JSON.stringify(chargers.slice(0, 2), null, 2) }}</p>
          <p><strong>Available Status Count:</strong> {{ debugCounts.available }}</p>
          <p><strong>Occupied Status Count:</strong> {{ debugCounts.occupied }}</p>
          <p><strong>Maintenance Status Count:</strong> {{ debugCounts.maintenance }}</p>
          <p><strong>All Statuses:</strong> {{ allStatuses }}</p>
        </div>

        <!-- Statistics Cards -->
        <div v-else class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <h5 class="card-title">Total Chargers</h5>
                <h2>{{ chargers.length }}</h2>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <h5 class="card-title">Available</h5>
                <h2>{{ availableChargers }}</h2>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card bg-danger text-white">
              <div class="card-body">
                <h5 class="card-title">Occupied</h5>
                <h2>{{ occupiedChargers }}</h2>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card bg-warning text-white">
              <div class="card-body">
                <h5 class="card-title">Maintenance</h5>
                <h2>{{ maintenanceChargers }}</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Quick Actions</h5>
                <div class="d-grid gap-2">
                  <router-link to="/chargers" class="btn btn-primary">
                    Manage Chargers
                  </router-link>
                  <router-link to="/map" class="btn btn-outline-primary">
                    View Map
                  </router-link>
                  <button @click="toggleDebug" class="btn btn-outline-secondary">
                    {{ debugMode ? 'Hide' : 'Show' }} Debug Info
                  </button>
                  <button @click="refreshData" class="btn btn-outline-info" :disabled="loading">
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Recent Activity</h5>
                <div v-if="recentActivity.length > 0">
                  <div v-for="activity in recentActivity.slice(0, 5)" :key="activity.id" class="mb-2">
                    <small class="text-muted">{{ activity.message }}</small>
                  </div>
                </div>
                <p v-else class="text-muted">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useChargerStore } from '../store'
import { useToast } from 'vue-toastification'

export default {
  name: 'Dashboard',
  setup() {
    const chargerStore = useChargerStore()
    const toast = useToast()
    const debugMode = ref(false)

    // Computed properties from store
    const loading = computed(() => chargerStore.loading)

    // Ensure chargers is always an array with proper defensive checks
    const chargers = computed(() => {
      const storeChargers = chargerStore.chargers
      console.log('Raw store chargers:', storeChargers)

      // Handle different possible data structures
      if (Array.isArray(storeChargers)) {
        return storeChargers
      } else if (storeChargers && Array.isArray(storeChargers.data)) {
        return storeChargers.data
      } else if (storeChargers && typeof storeChargers === 'object') {
        // If it's an object, try to extract array from common properties
        return storeChargers.items || storeChargers.results || storeChargers.chargers || []
      }
      return []
    })

    // Get all unique statuses for debugging
    const allStatuses = computed(() => {
      const chargersArray = chargers.value
      if (!Array.isArray(chargersArray)) return []
      
      const statuses = chargersArray
        .map(charger => charger?.status)
        .filter(status => status !== undefined)
      
      return [...new Set(statuses)]
    })

    // Debug counts to help identify the issue
    const debugCounts = computed(() => {
      const chargersArray = chargers.value
      if (!Array.isArray(chargersArray)) return { available: 0, occupied: 0, maintenance: 0 }
      
      const counts = { available: 0, occupied: 0, maintenance: 0 }
      
      chargersArray.forEach(charger => {
        if (!charger || !charger.status) return
        
        const status = charger.status.toLowerCase().trim()
        
        if (status === 'available') counts.available++
        else if (status === 'occupied') counts.occupied++
        else if (status === 'maintenance') counts.maintenance++
      })
      
      return counts
    })

    // Statistics computed properties with improved matching
    const availableChargers = computed(() => {
      const chargersArray = chargers.value
      if (!Array.isArray(chargersArray)) {
        console.warn('Chargers is not an array:', chargersArray)
        return 0
      }
      
      return chargersArray.filter(charger => {
        if (!charger || !charger.status) return false
        const status = charger.status.toLowerCase().trim()
        // Check for multiple possible values
        return status === 'available' || status === 'free' || status === 'idle'
      }).length
    })

    const occupiedChargers = computed(() => {
      const chargersArray = chargers.value
      if (!Array.isArray(chargersArray)) {
        console.warn('Chargers is not an array:', chargersArray)
        return 0
      }
      
      return chargersArray.filter(charger => {
        if (!charger || !charger.status) return false
        const status = charger.status.toLowerCase().trim()
        // Check for multiple possible values
        return status === 'occupied' || status === 'busy' || status === 'in_use' || status === 'charging'
      }).length
    })

    const maintenanceChargers = computed(() => {
      const chargersArray = chargers.value
      if (!Array.isArray(chargersArray)) {
        console.warn('Chargers is not an array:', chargersArray)
        return 0
      }
      
      return chargersArray.filter(charger => {
        if (!charger || !charger.status) return false
        const status = charger.status.toLowerCase().trim()
        // Check for multiple possible values
        return status === 'maintenance' || status === 'offline' || status === 'out_of_order' || status === 'error'
      }).length
    })

    // Recent activity (you can expand this based on your needs)
    const recentActivity = computed(() => {
      // This is a placeholder - you can implement actual activity tracking
      return []
    })

    // Watch for changes in chargers data
    watch(chargers, (newChargers) => {
      console.log('Chargers data changed:', newChargers)
      console.log('Available:', availableChargers.value)
      console.log('Occupied:', occupiedChargers.value)
      console.log('Maintenance:', maintenanceChargers.value)
    }, { deep: true })

    // Toggle debug mode
    const toggleDebug = () => {
      debugMode.value = !debugMode.value
    }

    // Refresh data
    const refreshData = async () => {
      try {
        await chargerStore.fetchChargers()
        toast.success('Data refreshed successfully')
      } catch (error) {
        console.error('Failed to refresh data:', error)
        toast.error('Failed to refresh data')
      }
    }

    // Fetch data on component mount
    onMounted(async () => {
      try {
        await chargerStore.fetchChargers()
        console.log('Chargers fetched successfully')
        console.log('Initial chargers:', chargers.value)
      } catch (error) {
        console.error('Failed to fetch chargers:', error)
        toast.error('Failed to load dashboard data')
      }
    })

    return {
      loading,
      chargers,
      availableChargers,
      occupiedChargers,
      maintenanceChargers,
      recentActivity,
      debugMode,
      debugCounts,
      allStatuses,
      toggleDebug,
      refreshData
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.debug-info {
  font-family: monospace;
  font-size: 0.8rem;
}
</style>