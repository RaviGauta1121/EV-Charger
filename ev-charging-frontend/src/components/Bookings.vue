<template>
  <div class="bookings-container">
    <div class="container-fluid py-4">
      <!-- Header Section -->
      <div class="bookings-header mb-4">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="bookings-title">
              <i class="fas fa-calendar-alt me-3"></i>
              My Bookings
            </h1>
            <p class="bookings-subtitle">Track and manage your charging sessions</p>
          </div>
          <div class="col-md-4 text-md-end">
            <button class="btn btn-primary btn-lg" @click="bookNewSession">
              <i class="fas fa-plus me-2"></i>
              New Booking
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stats-card">
            <div class="stats-icon bg-primary">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ bookingStats.total }}</h3>
              <p class="stats-label">Total Bookings</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stats-card">
            <div class="stats-icon bg-success">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ bookingStats.completed }}</h3>
              <p class="stats-label">Completed</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stats-card">
            <div class="stats-icon bg-warning">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ bookingStats.upcoming }}</h3>
              <p class="stats-label">Upcoming</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stats-card">
            <div class="stats-icon bg-info">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ bookingStats.totalEnergy }}kWh</h3>
              <p class="stats-label">Total Energy</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter and Search -->
      <div class="filters-section mb-4">
        <div class="filters-card">
          <div class="row align-items-center">
            <div class="col-md-4 mb-3 mb-md-0">
              <div class="search-box">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search bookings..."
                  v-model="searchQuery"
                >
              </div>
            </div>
            <div class="col-md-3 mb-3 mb-md-0">
              <select class="form-select" v-model="statusFilter">
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="col-md-3 mb-3 mb-md-0">
              <select class="form-select" v-model="sortBy">
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="station">By Station</option>
                <option value="duration">By Duration</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-outline-secondary w-100" @click="clearFilters">
                <i class="fas fa-filter-circle-xmark me-1"></i>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bookings List -->
      <div class="bookings-list">
        <div class="row">
          <div class="col-12" v-for="booking in filteredBookings" :key="booking.id">
            <div class="booking-card" :class="getBookingCardClass(booking.status)">
              <div class="booking-header">
                <div class="row align-items-center">
                  <div class="col-md-8">
                    <div class="booking-station">
                      <h4 class="station-name">
                        <i class="fas fa-charging-station me-2"></i>
                        {{ booking.stationName }}
                      </h4>
                      <p class="station-location">
                        <i class="fas fa-map-marker-alt me-1"></i>
                        {{ booking.location }}
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4 text-md-end">
                    <span class="booking-status" :class="getStatusClass(booking.status)">
                      <i :class="getStatusIcon(booking.status)" class="me-1"></i>
                      {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="booking-details">
                <div class="row">
                  <div class="col-md-3 col-6 mb-3">
                    <div class="detail-item">
                      <i class="fas fa-calendar detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">{{ formatDate(booking.date) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <div class="detail-item">
                      <i class="fas fa-clock detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Time</span>
                        <span class="detail-value">{{ booking.startTime }} - {{ booking.endTime }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <div class="detail-item">
                      <i class="fas fa-bolt detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Energy</span>
                        <span class="detail-value">{{ booking.energyUsed || 'N/A' }}kWh</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <div class="detail-item">
                      <i class="fas fa-dollar-sign detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Cost</span>
                        <span class="detail-value">${{ booking.cost.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="booking-actions">
                  <template v-if="booking.status === 'upcoming'">
                    <button class="btn btn-sm btn-outline-primary me-2" @click="modifyBooking(booking)">
                      <i class="fas fa-edit me-1"></i>
                      Modify
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="cancelBooking(booking)">
                      <i class="fas fa-times me-1"></i>
                      Cancel
                    </button>
                  </template>
                  <template v-else-if="booking.status === 'active'">
                    <button class="btn btn-sm btn-success me-2" @click="viewLiveSession(booking)">
                      <i class="fas fa-eye me-1"></i>
                      View Live
                    </button>
                    <button class="btn btn-sm btn-outline-warning" @click="extendSession(booking)">
                      <i class="fas fa-plus-circle me-1"></i>
                      Extend
                    </button>
                  </template>
                  <template v-else-if="booking.status === 'completed'">
                    <button class="btn btn-sm btn-outline-info me-2" @click="viewReceipt(booking)">
                      <i class="fas fa-receipt me-1"></i>
                      Receipt
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" @click="rebookSession(booking)">
                      <i class="fas fa-redo me-1"></i>
                      Book Again
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredBookings.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <h3 class="empty-title">No bookings found</h3>
          <p class="empty-description">
            {{ searchQuery || statusFilter ? 'Try adjusting your filters or search terms.' : 'You haven\'t made any bookings yet. Start by booking your first charging session!' }}
          </p>
          <button v-if="!searchQuery && !statusFilter" class="btn btn-primary" @click="bookNewSession">
            <i class="fas fa-plus me-2"></i>
            Book Your First Session
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-section" v-if="totalPages > 1">
        <nav aria-label="Bookings pagination">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            <li class="page-item" v-for="page in visiblePages" :key="page" :class="{ active: page === currentPage }">
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'MyBookings',
  setup() {
    const router = useRouter()
    
    // Reactive state
    const searchQuery = ref('')
    const statusFilter = ref('')
    const sortBy = ref('date-desc')
    const currentPage = ref(1)
    const itemsPerPage = 10
    
    // Booking stats
    const bookingStats = reactive({
      total: 24,
      completed: 18,
      upcoming: 3,
      totalEnergy: 456
    })
    
    // Sample bookings data
    const bookings = reactive([
      {
        id: 1,
        stationName: 'Downtown Charging Hub',
        location: '123 Main St, City Center',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:30',
        status: 'upcoming',
        energyUsed: null,
        cost: 25.50,
        connectorType: 'CCS'
      },
      {
        id: 2,
        stationName: 'Mall Parking Lot',
        location: '456 Shopping Ave, Westside',
        date: '2025-06-14',
        startTime: '14:00',
        endTime: '15:45',
        status: 'active',
        energyUsed: 28.5,
        cost: 32.75,
        connectorType: 'Type 2'
      },
      {
        id: 3,
        stationName: 'Office Complex Station',
        location: '789 Business Blvd, Tech District',
        date: '2025-06-13',
        startTime: '09:00',
        endTime: '10:30',
        status: 'completed',
        energyUsed: 35.2,
        cost: 28.40,
        connectorType: 'CCS'
      },
      {
        id: 4,
        stationName: 'Highway Rest Stop',
        location: 'Mile 45, Interstate 95',
        date: '2025-06-12',
        startTime: '16:30',
        endTime: '17:15',
        status: 'completed',
        energyUsed: 22.8,
        cost: 31.20,
        connectorType: 'Tesla'
      },
      {
        id: 5,
        stationName: 'University Campus',
        location: '321 College Way, Education District',
        date: '2025-06-11',
        startTime: '11:00',
        endTime: '12:00',
        status: 'cancelled',
        energyUsed: null,
        cost: 0,
        connectorType: 'Type 2'
      },
      {
        id: 6,
        stationName: 'Airport Terminal 2',
        location: 'Terminal 2, City Airport',
        date: '2025-06-10',
        startTime: '08:00',
        endTime: '09:30',
        status: 'completed',
        energyUsed: 41.7,
        cost: 38.95,
        connectorType: 'CCS'
      }
    ])
    
    // Computed properties
    const filteredBookings = computed(() => {
      let filtered = [...bookings]
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(booking => 
          booking.stationName.toLowerCase().includes(query) ||
          booking.location.toLowerCase().includes(query)
        )
      }
      
      // Apply status filter
      if (statusFilter.value) {
        filtered = filtered.filter(booking => booking.status === statusFilter.value)
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'date-desc':
            return new Date(b.date) - new Date(a.date)
          case 'date-asc':
            return new Date(a.date) - new Date(b.date)
          case 'station':
            return a.stationName.localeCompare(b.stationName)
          case 'duration':
            const aDuration = calculateDuration(a.startTime, a.endTime)
            const bDuration = calculateDuration(b.startTime, b.endTime)
            return bDuration - aDuration
          default:
            return 0
        }
      })
      
      // Apply pagination
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filtered.slice(start, end)
    })
    
    const totalPages = computed(() => {
      let filtered = [...bookings]
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(booking => 
          booking.stationName.toLowerCase().includes(query) ||
          booking.location.toLowerCase().includes(query)
        )
      }
      
      if (statusFilter.value) {
        filtered = filtered.filter(booking => booking.status === statusFilter.value)
      }
      
      return Math.ceil(filtered.length / itemsPerPage)
    })
    
    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    })
    
    // Methods
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    const calculateDuration = (startTime, endTime) => {
      const start = new Date(`2000-01-01 ${startTime}`)
      const end = new Date(`2000-01-01 ${endTime}`)
      return (end - start) / (1000 * 60) // Duration in minutes
    }
    
    const getBookingCardClass = (status) => {
      return {
        'booking-upcoming': status === 'upcoming',
        'booking-active': status === 'active',
        'booking-completed': status === 'completed',
        'booking-cancelled': status === 'cancelled'
      }
    }
    
    const getStatusClass = (status) => {
      return {
        'status-upcoming': status === 'upcoming',
        'status-active': status === 'active',
        'status-completed': status === 'completed',
        'status-cancelled': status === 'cancelled'
      }
    }
    
    const getStatusIcon = (status) => {
      const icons = {
        upcoming: 'fas fa-clock',
        active: 'fas fa-charging-station',
        completed: 'fas fa-check-circle',
        cancelled: 'fas fa-times-circle'
      }
      return icons[status] || 'fas fa-question-circle'
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      sortBy.value = 'date-desc'
      currentPage.value = 1
    }
    
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }
    
    const bookNewSession = () => {
      router.push('/chargers')
    }
    
    const modifyBooking = (booking) => {
      console.log('Modifying booking:', booking.id)
      // Implement modify booking logic
    }
    
    const cancelBooking = async (booking) => {
      if (confirm('Are you sure you want to cancel this booking?')) {
        // Simulate API call
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))
          booking.status = 'cancelled'
          console.log('Booking cancelled:', booking.id)
        } catch (error) {
          console.error('Failed to cancel booking:', error)
        }
      }
    }
    
    const viewLiveSession = (booking) => {
      console.log('Viewing live session:', booking.id)
      // Implement live session view
    }
    
    const extendSession = (booking) => {
      console.log('Extending session:', booking.id)
      // Implement session extension logic
    }
    
    const viewReceipt = (booking) => {
      console.log('Viewing receipt:', booking.id)
      // Implement receipt view
    }
    
    const rebookSession = (booking) => {
      console.log('Rebooking session:', booking.id)
      // Implement rebooking logic
    }
    
    // Lifecycle
    onMounted(() => {
      // Initialize component
    })
    
    return {
      searchQuery,
      statusFilter,
      sortBy,
      currentPage,
      bookingStats,
      bookings,
      filteredBookings,
      totalPages,
      visiblePages,
      formatDate,
      getBookingCardClass,
      getStatusClass,
      getStatusIcon,
      clearFilters,
      changePage,
      bookNewSession,
      modifyBooking,
      cancelBooking,
      viewLiveSession,
      extendSession,
      viewReceipt,
      rebookSession
    }
  }
}
</script>

<style scoped>
.bookings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding-top: 80px;
}

.bookings-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.bookings-title {
  color: #2c3e50;
  font-weight: 700;
  margin: 0;
  font-size: 2.5rem;
}

.bookings-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.stats-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  color: white;
}

.stats-icon.bg-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
}

.stats-icon.bg-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.stats-icon.bg-warning {
  background: linear-gradient(135deg, #ffc107, #e0a800);
}

.stats-icon.bg-info {
  background: linear-gradient(135deg, #17a2b8, #138496);
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1;
}

.stats-label {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.filters-section {
  margin-bottom: 2rem;
}

.filters-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

.search-box .form-control {
  padding-left: 2.5rem;
}

.form-control,
.form-select {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.booking-card {
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  overflow: hidden;
}

.booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.booking-card.booking-upcoming {
  border-left: 4px solid #ffc107;
}

.booking-card.booking-active {
  border-left: 4px solid #28a745;
  background: linear-gradient(135deg, #ffffff 0%, #f8fff8 100%);
}

.booking-card.booking-completed {
  border-left: 4px solid #007bff;
}

.booking-card.booking-cancelled {
  border-left: 4px solid #dc3545;
  opacity: 0.8;
}

.booking-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.station-name {
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
  font-size: 1.25rem;
}

.station-location {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
}

.booking-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.booking-status.status-upcoming {
  background: #fff3cd;
  color: #856404;
}

.booking-status.status-active {
  background: #d4edda;
  color: #155724;
}

.booking-status.status-completed {
  background: #cce5ff;
  color: #004085;
}

.booking-status.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.booking-details {
  padding: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.detail-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  margin-right: 1rem;
  font-size: 1rem;
}

.detail-content {
  flex: 1;
}

.detail-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.detail-value {
  display: block;
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.booking-actions {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
  margin-top: 1rem;
}

.btn {
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-color: #007bff;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-1px);
}

.btn-outline-primary {
  color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  border-color: #28a745;
}

.btn-outline-warning {
  color: #ffc107;
  border-color: #ffc107;
}

.btn-outline-warning:hover {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

.btn-outline-info {
  color: #17a2b8;
  border-color: #17a2b8;
}

.btn-outline-info:hover {
  background-color: #17a2b8;
  border-color: #17a2b8;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.empty-icon {
  font-size: 4rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.empty-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
}

.empty-description {
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.pagination-section {
  margin-top: 2rem;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.pagination {
  margin: 0;
}

.page-link {
  border: 1px solid #e9ecef;
  color: #6c757d;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin: 0 0.25rem;
  transition: all 0.3s ease;
}

.page-link:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #495057;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-color: #007bff;
  color: white;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  pointer-events: none;
}

/* Responsive design */
@media (max-width: 768px) {
  .bookings-title {
    font-size: 2rem;
  }
  
  .bookings-subtitle {
    font-size: 1rem;
  }
  
  .booking-header {
    padding: 1rem;
  }
  
  .booking-details {
    padding: 1rem;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .btn:last-child {
    margin-bottom: 0;
  }
  
  .stats-card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .bookings-header {
    padding: 1.5rem;
  }
  
  .filters-card {
    padding: 1rem;
  }
  
  .booking-header {
    padding: 1rem;
  }
  
  .booking-details {
    padding: 1rem;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .detail-icon {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
}
</style>