<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="dashboard-title">
              <i class="fas fa-tachometer-alt me-3"></i>
              Dashboard
            </h1>
            <p class="dashboard-subtitle">
              Monitor and manage your EV charging network
            </p>
          </div>
          <div class="col-md-4 text-end">
            <div class="dashboard-actions">
              <button @click="toggleDebug" class="btn btn-outline-light me-2">
                <i class="fas fa-bug me-1"></i>
                {{ debugMode ? 'Hide' : 'Show' }} Debug
              </button>
              <button @click="refreshData" class="btn btn-light" :disabled="loading">
                <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid px-4">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading dashboard data...</p>
        </div>
      </div>

      <!-- Debug Info -->
      <div v-if="!loading && debugMode" class="debug-panel mb-4">
        <div class="card border-info">
          <div class="card-header bg-info text-white">
            <h6 class="mb-0">
              <i class="fas fa-info-circle me-2"></i>
              Debug Information
            </h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <p><strong>Total Chargers:</strong> {{ chargers.length }}</p>
                <p><strong>Available Status Count:</strong> {{ debugCounts.available }}</p>
                <p><strong>Occupied Status Count:</strong> {{ debugCounts.occupied }}</p>
                <p><strong>Maintenance Status Count:</strong> {{ debugCounts.maintenance }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>All Statuses:</strong> {{ allStatuses.join(', ') }}</p>
                <p><strong>Last Updated:</strong> {{ new Date().toLocaleString() }}</p>
              </div>
            </div>
            <details class="mt-3">
              <summary class="text-primary" style="cursor: pointer;">View Sample Charger Data</summary>
              <pre class="mt-2 p-3 bg-light rounded">{{ JSON.stringify(chargers.slice(0, 2), null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="!loading">
        <!-- Statistics Cards -->
        <div class="row mb-4">
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card stat-card-primary">
              <div class="stat-card-body">
                <div class="stat-icon">
                  <i class="fas fa-charging-station"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ chargers.length }}</h3>
                  <p class="stat-label">Total Chargers</p>
                  <div class="stat-trend">
                    <span class="trend-icon">
                      <i class="fas fa-arrow-up"></i>
                    </span>
                    <span class="trend-text">Active Network</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card stat-card-success">
              <div class="stat-card-body">
                <div class="stat-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ availableChargers }}</h3>
                  <p class="stat-label">Available</p>
                  <div class="stat-trend">
                    <span class="trend-percentage">
                      {{ availabilityPercentage }}%
                    </span>
                    <span class="trend-text">Availability Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card stat-card-danger">
              <div class="stat-card-body">
                <div class="stat-icon">
                  <i class="fas fa-bolt"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ occupiedChargers }}</h3>
                  <p class="stat-label">Occupied</p>
                  <div class="stat-trend">
                    <span class="trend-percentage">
                      {{ occupancyPercentage }}%
                    </span>
                    <span class="trend-text">Utilization Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card stat-card-warning">
              <div class="stat-card-body">
                <div class="stat-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ maintenanceChargers }}</h3>
                  <p class="stat-label">Maintenance</p>
                  <div class="stat-trend">
                    <span class="trend-percentage">
                      {{ maintenancePercentage }}%
                    </span>
                    <span class="trend-text">Maintenance Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts and Analytics -->
        <div class="row mb-4">
          <div class="col-lg-8 mb-4">
            <div class="card analytics-card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-pie me-2"></i>
                  Charger Status Distribution
                </h5>
              </div>
              <div class="card-body">
                <div class="chart-container">
                  <canvas id="statusChart" width="400" height="200"></canvas>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4 mb-4">
            <div class="card analytics-card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-line me-2"></i>
                  Performance Metrics
                </h5>
              </div>
              <div class="card-body">
                <div class="metric-item">
                  <div class="metric-label">Network Uptime</div>
                  <div class="metric-value text-success">{{ networkUptime }}%</div>
                  <div class="progress mt-2">
                    <div class="progress-bar bg-success" :style="{ width: networkUptime + '%' }"></div>
                  </div>
                </div>
                
                <div class="metric-item mt-4">
                  <div class="metric-label">Average Response Time</div>
                  <div class="metric-value text-info">{{ avgResponseTime }}ms</div>
                  <div class="progress mt-2">
                    <div class="progress-bar bg-info" style="width: 75%"></div>
                  </div>
                </div>

                <div class="metric-item mt-4">
                  <div class="metric-label">Energy Efficiency</div>
                  <div class="metric-value text-warning">{{ energyEfficiency }}%</div>
                  <div class="progress mt-2">
                    <div class="progress-bar bg-warning" :style="{ width: energyEfficiency + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Cards and Recent Activity -->
        <div class="row">
          <div class="col-lg-6 mb-4">
            <div class="card action-card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-bolt me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div class="card-body">
                <div class="action-grid">
                  <router-link to="/chargers" class="action-item">
                    <div class="action-icon bg-primary">
                      <i class="fas fa-charging-station"></i>
                    </div>
                    <div class="action-content">
                      <h6>Manage Chargers</h6>
                      <p>View and configure charging stations</p>
                    </div>
                    <div class="action-arrow">
                      <i class="fas fa-chevron-right"></i>
                    </div>
                  </router-link>

                  <router-link to="/map" class="action-item">
                    <div class="action-icon bg-success">
                      <i class="fas fa-map-marked-alt"></i>
                    </div>
                    <div class="action-content">
                      <h6>View Map</h6>
                      <p>Geographic overview of stations</p>
                    </div>
                    <div class="action-arrow">
                      <i class="fas fa-chevron-right"></i>
                    </div>
                  </router-link>

                  <a href="#" @click.prevent="generateReport" class="action-item">
                    <div class="action-icon bg-info">
                      <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="action-content">
                      <h6>Generate Report</h6>
                      <p>Create detailed analytics report</p>
                    </div>
                    <div class="action-arrow">
                      <i class="fas fa-chevron-right"></i>
                    </div>
                  </a>

                  <a href="#" @click.prevent="scheduleMaintenace" class="action-item">
                    <div class="action-icon bg-warning">
                      <i class="fas fa-tools"></i>
                    </div>
                    <div class="action-content">
                      <h6>Schedule Maintenance</h6>
                      <p>Plan maintenance activities</p>
                    </div>
                    <div class="action-arrow">
                      <i class="fas fa-chevron-right"></i>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6 mb-4">
            <div class="card activity-card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="fas fa-history me-2"></i>
                  Recent Activity
                </h5>
                <small class="text-muted">Last 24 hours</small>
              </div>
              <div class="card-body">
                <div v-if="recentActivity.length > 0" class="activity-list">
                  <div v-for="activity in recentActivity.slice(0, 5)" :key="activity.id" class="activity-item">
                    <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                      <i :class="getActivityIcon(activity.type)"></i>
                    </div>
                    <div class="activity-content">
                      <p class="activity-message">{{ activity.message }}</p>
                      <small class="activity-time">{{ formatTime(activity.timestamp) }}</small>
                    </div>
                  </div>
                </div>
                <div v-else class="no-activity">
                  <i class="fas fa-clock text-muted mb-3"></i>
                  <p class="text-muted">No recent activity</p>
                  <small class="text-muted">Activity will appear here as it occurs</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Network Status -->
        <div class="row">
          <div class="col-12">
            <div class="card network-status-card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-network-wired me-2"></i>
                  Network Status Overview
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    <div class="status-indicator">
                      <div class="status-dot status-online"></div>
                      <div class="status-info">
                        <h6>System Status</h6>
                        <p class="text-success">All Systems Operational</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="status-indicator">
                      <div class="status-dot status-warning"></div>
                      <div class="status-info">
                        <h6>Alerts</h6>
                        <p class="text-warning">{{ alertCount }} Active Alerts</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="status-indicator">
                      <div class="status-dot status-info"></div>
                      <div class="status-info">
                        <h6>Data Sync</h6>
                        <p class="text-info">Last sync: {{ lastSyncTime }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="status-indicator">
                      <div class="status-dot status-success"></div>
                      <div class="status-info">
                        <h6>API Health</h6>
                        <p class="text-success">Healthy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
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

    // Percentage calculations
    const availabilityPercentage = computed(() => {
      const total = chargers.value.length
      return total > 0 ? Math.round((availableChargers.value / total) * 100) : 0
    })

    const occupancyPercentage = computed(() => {
      const total = chargers.value.length
      return total > 0 ? Math.round((occupiedChargers.value / total) * 100) : 0
    })

    const maintenancePercentage = computed(() => {
      const total = chargers.value.length
      return total > 0 ? Math.round((maintenanceChargers.value / total) * 100) : 0
    })

    // Mock data for enhanced features
    const networkUptime = computed(() => 98.5)
    const avgResponseTime = computed(() => 245)
    const energyEfficiency = computed(() => 87)
    const alertCount = computed(() => 3)
    const lastSyncTime = computed(() => '2 minutes ago')

    // Recent activity (mock data - replace with real data)
    const recentActivity = computed(() => {
      return [
        {
          id: 1,
          type: 'charging',
          message: 'Charger #012 started charging session',
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: 2,
          type: 'maintenance',
          message: 'Scheduled maintenance completed for Station A',
          timestamp: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: 3,
          type: 'alert',
          message: 'Network connectivity restored',
          timestamp: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: 4,
          type: 'charging',
          message: 'Charger #008 session completed',
          timestamp: new Date(Date.now() - 45 * 60 * 1000)
        },
        {
          id: 5,
          type: 'system',
          message: 'System backup completed successfully',
          timestamp: new Date(Date.now() - 60 * 60 * 1000)
        }
      ]
    })

    // Watch for changes in chargers data
    watch(chargers, (newChargers) => {
      console.log('Chargers data changed:', newChargers)
      console.log('Available:', availableChargers.value)
      console.log('Occupied:', occupiedChargers.value)
      console.log('Maintenance:', maintenanceChargers.value)
      
      // Update chart when data changes
      nextTick(() => {
        updateChart()
      })
    }, { deep: true })

    // Methods
    const toggleDebug = () => {
      debugMode.value = !debugMode.value
    }

    const refreshData = async () => {
      try {
        await chargerStore.fetchChargers()
        toast.success('Data refreshed successfully')
      } catch (error) {
        console.error('Failed to refresh data:', error)
        toast.error('Failed to refresh data')
      }
    }

    const generateReport = () => {
      toast.info('Report generation feature coming soon!')
    }

    const scheduleMaintenace = () => {
      toast.info('Maintenance scheduling feature coming soon!')
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - timestamp
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    }

    const getActivityIcon = (type) => {
      const icons = {
        charging: 'fas fa-bolt',
        maintenance: 'fas fa-tools',
        alert: 'fas fa-exclamation-triangle',
        system: 'fas fa-cog'
      }
      return icons[type] || 'fas fa-info-circle'
    }

    const getActivityIconClass = (type) => {
      const classes = {
        charging: 'activity-icon-success',
        maintenance: 'activity-icon-warning',
        alert: 'activity-icon-danger',
        system: 'activity-icon-info'
      }
      return classes[type] || 'activity-icon-info'
    }

    const updateChart = () => {
      const canvas = document.getElementById('statusChart')
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      
      // Simple pie chart implementation
      const data = [
        { label: 'Available', value: availableChargers.value, color: '#28a745' },
        { label: 'Occupied', value: occupiedChargers.value, color: '#dc3545' },
        { label: 'Maintenance', value: maintenanceChargers.value, color: '#ffc107' }
      ]

      const total = data.reduce((sum, item) => sum + item.value, 0)
      if (total === 0) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) - 20

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let currentAngle = 0
      data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
        ctx.lineTo(centerX, centerY)
        ctx.fillStyle = item.color
        ctx.fill()
        
        currentAngle += sliceAngle
      })
    }

    // Fetch data on component mount
    onMounted(async () => {
      try {
        await chargerStore.fetchChargers()
        console.log('Chargers fetched successfully')
        console.log('Initial chargers:', chargers.value)
        
        // Initialize chart
        nextTick(() => {
          updateChart()
        })
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
      availabilityPercentage,
      occupancyPercentage,
      maintenancePercentage,
      networkUptime,
      avgResponseTime,
      energyEfficiency,
      alertCount,
      lastSyncTime,
      recentActivity,
      debugMode,
      debugCounts,
      allStatuses,
      toggleDebug,
      refreshData,
      generateReport,
      scheduleMaintenace,
      formatTime,
      getActivityIcon,
      getActivityIconClass
    }
  }
}
</script>

<style scoped>
/* Dashboard Header */
.dashboard-header {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  color: #2c3e50;
  padding: 2rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #e9ecef;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 0;
}

.dashboard-actions .btn {
  border-radius: 25px;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background-color: #ffffff;
  border-color: #dee2e6;
  color: #495057;
}

.dashboard-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa;
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
}

.loading-spinner .spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Debug Panel */
.debug-panel {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Statistics Cards */
.stat-card {
  border: 1px solid #e9ecef;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  background: #ffffff;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card-primary { 
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #90caf9;
}
.stat-card-success { 
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: #a5d6a7;
}
.stat-card-danger { 
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-color: #ef9a9a;
}
.stat-card-warning { 
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  border-color: #ffe082;
}

.stat-card-body {
  padding: 2rem;
  color: #495057;
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.6;
  margin-right: 1.5rem;
  color: #6c757d;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-label {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.trend-icon {
  margin-right: 0.5rem;
}

.trend-percentage {
  font-weight: 600;
  margin-right: 0.5rem;
}

/* Analytics Cards */
.analytics-card {
  border: 1px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background: #ffffff;
}

.analytics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.analytics-card .card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  padding: 1.25rem 1.5rem;
}

.chart-container {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#statusChart {
  max-width: 100%;
  max-height: 100%;
}

/* Performance Metrics */
.metric-item {
  padding: 1rem 0;
}

.metric-item:not(:last-child) {
  border-bottom: 1px solid #dee2e6;
}

.metric-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.progress {
  height: 8px;
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.6s ease;
}

/* Action Cards */
.action-card {
  border: 1px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  background: #ffffff;
}

.action-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.action-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  border-color: #007bff;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-right: 1rem;
}

.action-content {
  flex: 1;
}

.action-content h6 {
  margin-bottom: 0.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.action-content p {
  margin-bottom: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.action-arrow {
  color: #6c757d;
  transition: all 0.3s ease;
}

.action-item:hover .action-arrow {
  color: #007bff;
  transform: translateX(5px);
}

/* Activity Card */
.activity-card {
  border: 1px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  background: #ffffff;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
  margin-right: 1rem;
  flex-shrink: 0;
}

.activity-icon-success { background-color: #4caf50; }
.activity-icon-warning { background-color: #ff9800; }
.activity-icon-danger { background-color: #f44336; }
.activity-icon-info { background-color: #2196f3; }

.activity-content {
  flex: 1;
}

.activity-message {
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.activity-time {
  color: #6c757d;
  font-size: 0.8rem;
}

.no-activity {
  text-align: center;
  padding: 3rem 1rem;
}

.no-activity i {
  font-size: 3rem;
  display: block;
}

/* Network Status Card */
.network-status-card {
  border: 1px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  background: #ffffff;
}

.status-indicator {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.status-indicator:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.status-online { background-color: #4caf50; }
.status-warning { background-color: #ff9800; }
.status-info { background-color: #ffffff; }
.status-success { background-color: #4caf50; }

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-info h6 {
  margin-bottom: 0.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.status-info p {
  margin-bottom: 0;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 1.5rem 0;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
  
  .dashboard-subtitle {
    font-size: 1rem;
  }
  
  .dashboard-actions {
    margin-top: 1rem;
  }
  
  .stat-card-body {
    padding: 1.5rem;
  }
  
  .stat-icon {
    font-size: 2rem;
    margin-right: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .action-item {
    padding: 1rem;
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

@media (max-width: 576px) {
  .dashboard-container {
    padding: 0;
  }
  
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .stat-card-body {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .action-item {
    flex-direction: column;
    text-align: center;
  }
  
  .action-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .action-arrow {
    display: none;
  }
}

/* Animations */
.stat-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom Scrollbar */
.activity-list::-webkit-scrollbar {
  width: 4px;
}

.activity-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .dashboard-container {
    background-color: #fafafa;
    color: #212121;
  }
  
  .card {
    background-color: #ffffff;
    border-color: #e0e0e0;
  }
  
  .card-header {
    background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%) !important;
    border-bottom-color: #e0e0e0;
  }
  
  .action-item {
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
    border-color: #e0e0e0;
    color: #212121;
  }
  
  .status-indicator {
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
    border-color: #e0e0e0;
  }
}

/* Print Styles */
@media print {
  .dashboard-header,
  .dashboard-actions,
  .debug-panel {
    display: none;
  }
  
  .stat-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>