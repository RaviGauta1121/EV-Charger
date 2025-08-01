<template>
  <div class="booking-container">
    <!-- Header Section -->
    <div class="booking-header">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-12">
            <h1 class="booking-title">
              <i class="fas fa-calendar-alt me-3"></i>
              EV Charger Booking
            </h1>
            <p class="booking-subtitle">
              Reserve your charging slot effortlessly
            </p>
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
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <p class="mt-3">Loading bookings...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="row">
        <!-- Booking Form Card -->
        <div class="col-lg-5 mb-4">
          <div class="card booking-form-card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-plus-circle me-2"></i>
                New Booking
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="submitBooking" class="booking-form">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-user me-2"></i>
                    Full Name
                  </label>
                  <input 
                    v-model="form.name" 
                    type="text" 
                    placeholder="Enter your full name" 
                    required 
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-phone me-2"></i>
                    Phone Number
                  </label>
                  <input 
                    v-model="form.phone" 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    required 
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar me-2"></i>
                    Booking Date
                  </label>
                  <input 
                    v-model="form.date" 
                    type="date" 
                    :min="todayDate"
                    required 
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-clock me-2"></i>
                    Time Slot
                  </label>
                  <select v-model="form.slot" required class="form-input">
                    <option disabled value="">Select your preferred slot</option>
                    <option 
                      v-for="slot in availableSlots" 
                      :key="slot.value"
                      :value="slot.value"
                      :disabled="slot.disabled"
                      :class="{ 'slot-unavailable': slot.disabled }"
                    >
                      {{ slot.label }} {{ slot.disabled ? '(Booked)' : '' }}
                    </option>
                  </select>
                  <small v-if="form.date" class="text-muted">
                    {{ getAvailableSlotsCount(form.date) }} of 4 slots available for {{ formatSelectedDate(form.date) }}
                  </small>
                </div>

                <button 
                  type="submit" 
                  class="submit-btn"
                  :disabled="submitting"
                >
                  <i class="fas fa-bolt me-2"></i>
                  <span v-if="submitting">Booking...</span>
                  <span v-else>Book Slot</span>
                </button>
              </form>
            </div>
          </div>

          <!-- Quick Stats Card -->
          <div class="card stats-card mt-4">
            <div class="card-body">
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon bg-primary">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="stat-content">
                    <h4>{{ bookings.length }}</h4>
                    <p>Total Bookings</p>
                  </div>
                </div>
                <div class="stat-item" @click="showTodaySlots = !showTodaySlots">
                  <div class="stat-icon bg-success">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="stat-content">
                    <h4>{{ todayBookings }}</h4>
                    <p>Today's Slots</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Today's Slots Detail Card -->
          <div v-if="showTodaySlots" class="card today-slots-card mt-3">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="fas fa-calendar-day me-2"></i>
                Today's Booking Status
              </h6>
            </div>
            <div class="card-body">
              <div class="slots-status">
                <div 
                  v-for="slot in allTimeSlots" 
                  :key="slot"
                  class="slot-status-item"
                  :class="{ 'booked': isSlotBookedToday(slot), 'available': !isSlotBookedToday(slot) }"
                >
                  <div class="slot-time">{{ slot }}</div>
                  <div class="slot-status">
                    <span v-if="isSlotBookedToday(slot)" class="status-badge booked">
                      <i class="fas fa-check"></i> Booked
                    </span>
                    <span v-else class="status-badge available">
                      <i class="fas fa-plus"></i> Available
                    </span>
                  </div>
                  <div v-if="isSlotBookedToday(slot)" class="slot-user">
                    {{ getTodaySlotUser(slot) }}
                  </div>
                </div>
              </div>
              <div class="slot-summary mt-3">
                <div class="summary-item">
                  <span class="summary-label">Available:</span>
                  <span class="summary-value available">{{ 4 - todayBookings }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Booked:</span>
                  <span class="summary-value booked">{{ todayBookings }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bookings List -->
        <div class="col-lg-7 mb-4">
          <div class="card bookings-list-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="fas fa-list me-2"></i>
                All Bookings
              </h5>
              <div class="header-actions">
                <button 
                  @click="filterToday = !filterToday"
                  class="filter-btn"
                  :class="{ 'active': filterToday }"
                >
                  <i class="fas fa-filter me-1"></i>
                  {{ filterToday ? 'Show All' : 'Today Only' }}
                </button>
                <span class="badge bg-primary ms-2">{{ filteredBookings.length }} bookings</span>
              </div>
            </div>
            <div class="card-body">
              <div v-if="filteredBookings.length > 0" class="bookings-list">
                <div 
                  v-for="(booking, index) in filteredBookings" 
                  :key="booking._id"
                  class="booking-item"
                  :class="{ 'today-booking': isBookingToday(booking) }"
                  :style="{ animationDelay: index * 0.1 + 's' }"
                >
                  <div class="booking-content">
                    <div class="booking-header-info">
                      <div class="booking-avatar">
                        <i class="fas fa-user"></i>
                      </div>
                      <div class="booking-details">
                        <h6 class="booking-name">
                          {{ booking.name }}
                          <span v-if="isBookingToday(booking)" class="today-badge">Today</span>
                        </h6>
                        <div class="booking-meta">
                          <span class="meta-item">
                            <i class="fas fa-phone"></i>
                            {{ booking.phone }}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="booking-schedule">
                      <div class="schedule-item">
                        <i class="fas fa-calendar"></i>
                        <span>{{ formatDate(booking.date) }}</span>
                      </div>
                      <div class="schedule-item">
                        <i class="fas fa-clock"></i>
                        <span>{{ booking.slot }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="booking-actions">
                    <button 
                      @click="deleteBooking(booking._id)"
                      class="delete-btn"
                      title="Delete Booking"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-else class="no-bookings">
                <div class="no-bookings-icon">
                  <i class="fas fa-calendar-times"></i>
                </div>
                <h5>{{ filterToday ? 'No Bookings Today' : 'No Bookings Yet' }}</h5>
                <p>{{ filterToday ? 'No bookings scheduled for today.' : 'Start by creating your first booking using the form on the left.' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "BookingPage",
  data() {
    return {
      form: {
        name: "",
        phone: "",
        date: "",
        slot: "",
      },
      bookings: [],
      loading: true,
      submitting: false,
      showTodaySlots: false,
      filterToday: false,
      allTimeSlots: [
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM", 
        "12:00 PM - 01:00 PM",
        "01:00 PM - 02:00 PM"
      ]
    };
  },
  computed: {
    todayDate() {
      return new Date().toISOString().split('T')[0];
    },
    todayBookings() {
      return this.bookings.filter(booking => 
        booking.date.split('T')[0] === this.todayDate
      ).length;
    },
    filteredBookings() {
      if (this.filterToday) {
        return this.bookings.filter(booking => 
          booking.date.split('T')[0] === this.todayDate
        );
      }
      return this.bookings;
    },
    availableSlots() {
      if (!this.form.date) {
        return this.allTimeSlots.map(slot => ({
          value: slot,
          label: slot,
          disabled: false
        }));
      }

      const selectedDate = this.form.date;
      const bookedSlots = this.bookings
        .filter(booking => booking.date.split('T')[0] === selectedDate)
        .map(booking => booking.slot);

      return this.allTimeSlots.map(slot => ({
        value: slot,
        label: slot,
        disabled: bookedSlots.includes(slot)
      }));
    }
  },
  methods: {
    async fetchBookings() {
      this.loading = true;
      try {
        const res = await axios.get("http://localhost:5000/api/bookings");
        this.bookings = res.data;
      } catch (error) {
        console.error("Error fetching bookings:", error.message);
      } finally {
        this.loading = false;
      }
    },
    async submitBooking() {
      this.submitting = true;
      try {
        await axios.post("http://localhost:5000/api/bookings", this.form);
        this.form = { name: "", phone: "", date: "", slot: "" };
        await this.fetchBookings();
        // Show success message
        alert("Booking successful!");
      } catch (error) {
        alert("Failed to book. Please try again.");
      } finally {
        this.submitting = false;
      }
    },
    async deleteBooking(id) {
      if (confirm("Are you sure you want to delete this booking?")) {
        try {
          await axios.delete(`http://localhost:5000/api/bookings/${id}`);
          await this.fetchBookings();
        } catch (error) {
          alert("Failed to delete booking. Please try again.");
        }
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    formatSelectedDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    },
    isBookingToday(booking) {
      return booking.date.split('T')[0] === this.todayDate;
    },
    isSlotBookedToday(slot) {
      return this.bookings.some(booking => 
        booking.date.split('T')[0] === this.todayDate && booking.slot === slot
      );
    },
    getTodaySlotUser(slot) {
      const booking = this.bookings.find(booking => 
        booking.date.split('T')[0] === this.todayDate && booking.slot === slot
      );
      return booking ? booking.name : '';
    },
    getAvailableSlotsCount(date) {
      const bookedSlots = this.bookings
        .filter(booking => booking.date.split('T')[0] === date)
        .length;
      return 4 - bookedSlots;
    }
  },
  watch: {
    'form.date'() {
      // Reset slot selection when date changes
      this.form.slot = '';
    }
  },
  mounted() {
    this.fetchBookings();
  },
};
</script>

<style scoped>
/* Header Styles */
.booking-header {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  color: #2c3e50;
  padding: 2rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #e9ecef;
}

.booking-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.booking-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 0;
  color: #6c757d;
}

/* Loading Styles */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
}

.loading-spinner {
  text-align: center;
}

.loading-spinner .spinner-border {
  width: 3rem;
  height: 3rem;
}

.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #007bff;
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Card Styles */
.card {
  border: 1px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background: #ffffff;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  padding: 1.25rem 1.5rem;
  border-radius: 15px 15px 0 0;
}

.card-title {
  color: #2c3e50;
  font-weight: 600;
}

/* Form Styles */
.booking-form-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.booking-form {
  animation: fadeInUp 0.6s ease-out;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #ffffff;
  color: #495057;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  background-color: #ffffff;
}

.form-input::placeholder {
  color: #adb5bd;
}

.slot-unavailable {
  color: #dc3545 !important;
  font-style: italic;
}

.submit-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stats Card */
.stats-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: #a5d6a7;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.02);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.stat-content h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

.stat-content p {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
}

/* Today's Slots Card */
.today-slots-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-color: #ffb74d;
  animation: slideInDown 0.3s ease-out;
}

.slots-status {
  display: grid;
  gap: 0.75rem;
}

.slot-status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.slot-status-item.booked {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.2);
}

.slot-status-item.available {
  background: rgba(40, 167, 69, 0.1);
  border-color: rgba(40, 167, 69, 0.2);
}

.slot-time {
  font-weight: 600;
  color: #2c3e50;
}

.slot-status {
  flex: 1;
  text-align: center;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.booked {
  background: #dc3545;
  color: white;
}

.status-badge.available {
  background: #28a745;
  color: white;
}

.slot-user {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.slot-summary {
  display: flex;
  justify-content: space-around;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.summary-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.summary-value.available {
  color: #28a745;
}

.summary-value.booked {
  color: #dc3545;
}

/* Bookings List */
.bookings-list-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.header-actions {
  display: flex;
  align-items: center;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #007bff;
  background: transparent;
  color: #007bff;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover,
.filter-btn.active {
  background: #007bff;
  color: white;
}

.bookings-list {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.booking-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  animation: slideInRight 0.5s ease-out forwards;
  opacity: 0;
  transform: translateX(20px);
}

.booking-item.today-booking {
  border-left: 4px solid #28a745;
  background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);
}

.booking-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.today-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #28a745;
  color: white;
  font-size: 0.7rem;
  border-radius: 12px;
  margin-left: 0.5rem;
}

@keyframes slideInRight {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.booking-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-header-info {
  display: flex;
  align-items: center;
}

.booking-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 1rem;
  font-size: 1.2rem;
}

.booking-details {
  flex: 1;
}

.booking-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.booking-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.booking-schedule {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #007bff;
  font-weight: 500;
}

.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.delete-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

/* No Bookings State */
.no-bookings {
  text-align: center;
  padding: 3rem 1rem;
}

.no-bookings-icon {
  font-size: 4rem;
  color: #adb5bd;
  margin-bottom: 1rem;
}

.no-bookings h5 {
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.no-bookings p {
  color: #adb5bd;
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .booking-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }
  
  .booking-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .booking-actions {
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
  
  .booking-schedule {
    width: 100%;
    justify-content: space-between;
  }
  
  .slot-status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .slot-summary {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .booking-header {
    padding: 1.5rem 0;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .booking-header-info {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .booking-avatar {
    margin-bottom: 0.5rem;
  }
  
  .filter-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

/* Animations */
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
.bookings-list::-webkit-scrollbar {
  width: 6px;
}

.bookings-list::-webkit-scrollbar-track {
  background: #f1f3f4;
  border-radius: 10px;
}

.bookings-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.bookings-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Badge */
.badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
}

/* Utility Classes */
.text-muted {
  color: #6c757d !important;
  font-size: 0.9rem;
  margin-top: 0.25rem;
  display: block;
}

</style>







<!-- 
<template>
  <div class="container">
    <h1>Booking Form</h1>
    <form @submit.prevent="submitBooking">
      <label>Name:</label>
      <input v-model="form.name" required />

      <label>Phone:</label>
      <input v-model="form.phone" required />

      <label>Date:</label>
      <input type="date" v-model="form.date" required />

      <label>Slot:</label>
      <input v-model="form.slot" required />

      <button type="submit">Submit Booking</button>
    </form>

    <div v-if="showPayment" class="payment-section">
      <h2>Step 2: Complete Payment</h2>
      <p>Scan the QR or send ₹100 to:</p>
      <p><strong>UPI ID:</strong> yourupi@bank</p>
      <img src="/qr.png" alt="UPI QR Code" class="qr" />
      <p>After payment, share screenshot on WhatsApp: <strong>+91XXXXXXXXXX</strong></p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      form: {
        name: "",
        phone: "",
        date: "",
        slot: ""
      },
      showPayment: false
    };
  },
  methods: {
    async submitBooking() {
      try {
        const res = await axios.post("http://localhost:5000/api/bookings", this.form);
        alert("Booking saved! Please complete the payment.");
        this.showPayment = true;
        this.form = { name: "", phone: "", date: "", slot: "" };
      } catch (err) {
        alert("Booking failed. " + err.response.data.error);
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: auto;
  padding: 2rem;
  font-family: sans-serif;
}
input {
  width: 100%;
  padding: 0.5rem;
  margin: 0.3rem 0 1rem;
}
button {
  padding: 0.7rem 1.5rem;
  background-color: #1e90ff;
  color: white;
  border: none;
  cursor: pointer;
}
.payment-section {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  background: #f7f7f7;
}
.qr {
  width: 200px;
  margin: 1rem 0;
}
</style> -->
