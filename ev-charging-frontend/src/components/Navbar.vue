<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
      <router-link to="/dashboard" class="navbar-brand">
        ⚡ EV Charging
      </router-link>

      <!-- Custom Animated Toggler -->
      <button 
        class="custom-navbar-toggler" 
        type="button" 
        @click="toggleMobileMenu" 
        aria-controls="navbarNav"
        :aria-expanded="isMobileMenuOpen" 
        aria-label="Toggle navigation"
        :class="{ 'active': isMobileMenuOpen }"
      >
        <span class="toggler-line line-1"></span>
        <span class="toggler-line line-2"></span>
        <span class="toggler-line line-3"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: isMobileMenuOpen }" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link" :class="{ active: $route.path === '/dashboard' }"
              @click="closeMobileMenu">
              <i class="fas fa-tachometer-alt me-1"></i>
              Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/chargers" class="nav-link" :class="{ active: $route.path === '/chargers' }"
              @click="closeMobileMenu">
              <i class="fas fa-charging-station me-1"></i>
              Chargers
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/map" class="nav-link" :class="{ active: $route.path === '/map' }"
              @click="closeMobileMenu">
              <i class="fas fa-map-marked-alt me-1"></i>
              Map View
            </router-link>
          </li>
        </ul>

        <ul class="navbar-nav">
          <li class="nav-item dropdown" v-if="user">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
              @click.prevent="toggleDropdown" aria-expanded="false" :class="{ 'pe-none': isLoggingOut }">
              <i class="fas fa-user-circle me-1"></i>
              {{ user.name || user.email || 'User' }}
              <span v-if="isLoggingOut" class="spinner-border spinner-border-sm ms-2" role="status"></span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" :class="{ show: isDropdownOpen }">
              <li>
                <router-link to="/profile" class="dropdown-item" @click="closeDropdown">
                  <i class="fas fa-user me-2"></i>
                  Profile
                </router-link>
              </li>
              <li>
                <router-link to="/bookings" class="dropdown-item" @click="closeDropdown">
                  <i class="fas fa-calendar-alt me-2"></i>
                  My Bookings
                </router-link>
              </li>
              <li>
                <router-link to="/settings" class="dropdown-item" @click="closeDropdown">
                  <i class="fas fa-cog me-2"></i>
                  Settings
                </router-link>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="handleLogout"
                  :class="{ 'pe-none text-muted': isLoggingOut }">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
                </a>
              </li>
            </ul>
          </li>

          <li class="nav-item" v-else>
            <router-link to="/login" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-sign-in-alt me-1"></i>
              Login
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/index.js'

export default {
  name: 'Navbar',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const route = useRoute()

    // Reactive state
    const isLoggingOut = ref(false)
    const isDropdownOpen = ref(false)
    const isMobileMenuOpen = ref(false)

    // Computed properties
    const user = computed(() => authStore.user)
    const isAuthenticated = computed(() => authStore.isAuthenticated)

    // Methods
    const handleLogout = async () => {
      if (isLoggingOut.value) return

      isLoggingOut.value = true
      closeDropdown()

      try {
        await authStore.logout()
        console.log('Logged out successfully')
        router.push('/login')
      } catch (error) {
        console.error('Logout failed. Please try again.', error)
      } finally {
        isLoggingOut.value = false
      }
    }

    const toggleDropdown = () => {
      if (isLoggingOut.value) return
      isDropdownOpen.value = !isDropdownOpen.value
    }

    const closeDropdown = () => {
      isDropdownOpen.value = false
    }

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (isDropdownOpen.value && !event.target.closest('.dropdown')) {
        closeDropdown()
      }
      // Close mobile menu if clicked outside
      if (isMobileMenuOpen.value && !event.target.closest('.navbar')) {
        closeMobileMenu()
      }
    }

    const showWelcomeMessage = () => {
      if (user.value && route.path === '/dashboard') {
        console.log(`Welcome back, ${user.value.name || 'User'}!`)
      }
    }

    // Watchers
    watch(route, (to, from) => {
      // Close mobile menu and dropdown on route change
      closeMobileMenu()
      closeDropdown()

      // Show navigation toast for main sections
      const routeNames = {
        '/dashboard': 'Dashboard',
        '/chargers': 'Chargers',
        '/map': 'Map View',
        '/profile': 'Profile',
        '/settings': 'Settings'
      }

      if (routeNames[to.path] && to.path !== from.path && isAuthenticated.value) {
        console.log(`Navigated to ${routeNames[to.path]}`)
      }
    })

    // Lifecycle
    onMounted(() => {
      // Add click outside listener
      document.addEventListener('click', handleClickOutside)

      // Show welcome message on component mount if user is authenticated
      if (isAuthenticated.value) {
        setTimeout(showWelcomeMessage, 500)
      }
    })

    onUnmounted(() => {
      // Remove click outside listener
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      user,
      isAuthenticated,
      isLoggingOut,
      isDropdownOpen,
      isMobileMenuOpen,
      handleLogout,
      toggleDropdown,
      closeDropdown,
      toggleMobileMenu,
      closeMobileMenu
    }
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #dee2e6;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
  color: #2c3e50 !important;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
  color: #007bff !important;
}

/* Custom Animated Navbar Toggler */
.custom-navbar-toggler {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-navbar-toggler:hover {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-color: #90caf9;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

.custom-navbar-toggler:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.3);
}

.custom-navbar-toggler:active {
  transform: scale(0.95);
}

.toggler-line {
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, #495057, #6c757d);
  margin: 2px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
  position: relative;
  transform-origin: center;
}

/* Animated states */
.custom-navbar-toggler.active .line-1 {
  transform: rotate(45deg) translate(6px, 6px);
  background: linear-gradient(90deg, #dc3545, #c82333);
}

.custom-navbar-toggler.active .line-2 {
  opacity: 0;
  transform: scale(0);
}

.custom-navbar-toggler.active .line-3 {
  transform: rotate(-45deg) translate(6px, -6px);
  background: linear-gradient(90deg, #dc3545, #c82333);
}

/* Ripple effect */
.custom-navbar-toggler::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(25, 118, 210, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.custom-navbar-toggler:active::before {
  width: 60px;
  height: 60px;
}

/* Show toggler on mobile */
@media (max-width: 991.98px) {
  .custom-navbar-toggler {
    display: flex;
  }
}

.nav-link {
  color: #495057 !important;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 1rem !important;
  border-radius: 6px;
  margin: 0 0.2rem;
  font-weight: 500;
}

.nav-link:hover {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #2c3e50 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-link.active {
  background: linear-gradient(135deg, #bbdefb, #90caf9);
  color: #1976d2 !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, #1976d2, #1565c0);
  border-radius: 2px;
}

.dropdown-menu {
  border: 1px solid #e9ecef;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background-color: #ffffff;
  display: none;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  color: #495057;
  transition: all 0.2s ease;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #2c3e50;
  transform: translateX(5px);
}

.dropdown-item:active {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
}

.dropdown-divider {
  margin: 0;
  border-color: #dee2e6;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  color: #6c757d;
}

.pe-none {
  pointer-events: none;
}

/* Mobile menu styles */
.navbar-collapse {
  transition: all 0.3s ease;
}

.navbar-collapse:not(.show) {
  display: none;
}

.navbar-collapse.show {
  display: block;
}

/* Enhanced mobile responsiveness */
@media (max-width: 991.98px) {
  .navbar-nav {
    text-align: center;
    padding: 1rem 0;
  }

  .navbar-nav .nav-item {
    margin: 0.25rem 0;
  }

  .nav-link {
    margin: 0.25rem 0;
    border-radius: 25px;
  }

  .dropdown-menu-end {
    right: 0 !important;
    left: auto !important;
    margin-top: 0.25rem;
  }

  .navbar-collapse {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    margin-top: 1rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
    border: 1px solid #e9ecef;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 576px) {
  .navbar-brand {
    font-size: 1.25rem;
  }

  .nav-link {
    font-size: 0.95rem;
  }

  .dropdown-item {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .custom-navbar-toggler {
    width: 44px;
    height: 44px;
  }

  .toggler-line {
    width: 20px;
    height: 2px;
  }
}

/* Animation for navbar brand */
@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.navbar-brand:active {
  animation: pulse 0.3s ease-in-out;
}

/* Loading state styling */
.nav-link.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Accessibility improvements */
.nav-link:focus,
.dropdown-item:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Light theme enhancements */
.navbar-light .navbar-nav .nav-link {
  color: #495057;
}

.navbar-light .navbar-nav .nav-link:hover {
  color: #2c3e50;
}

/* Smooth transitions for route changes */
.router-link-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* User dropdown styling */
.dropdown-toggle {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 1px solid #dee2e6;
  border-radius: 20px;
  padding: 0.5rem 1rem !important;
}

.dropdown-toggle:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  border-color: #ced4da;
}

/* Icon styling */
.nav-link i {
  color: #6c757d;
  opacity: 0.8;
}

.nav-link:hover i,
.nav-link.active i {
  color: inherit;
  opacity: 1;
}

/* Enhanced card-like appearance for mobile menu */
@media (max-width: 991.98px) {
  .navbar-collapse.show {
    padding: 1rem;
    margin: 0.5rem;
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  }
  
  .nav-link {
    background: linear-gradient(135deg, #f8f9fa, #ffffff);
    border: 1px solid #e9ecef;
    margin: 0.25rem 0;
  }
  
  .nav-link:hover {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    border-color: #90caf9;
  }
}
</style>