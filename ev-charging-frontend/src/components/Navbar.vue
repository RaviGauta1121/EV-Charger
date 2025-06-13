<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <div class="container">
      <router-link to="/dashboard" class="navbar-brand">
        ⚡ EV Charging
      </router-link>

      <button class="navbar-toggler" type="button" @click="toggleMobileMenu" aria-controls="navbarNav"
        :aria-expanded="isMobileMenuOpen" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
  color: #ffc107 !important;
}

.nav-link {
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 1rem !important;
  border-radius: 6px;
  margin: 0 0.2rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 2px;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  margin-top: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
  display: none;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  transition: all 0.2s ease;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.dropdown-item:active {
  background-color: #e9ecef;
}

.dropdown-divider {
  margin: 0;
  border-color: rgba(0, 0, 0, 0.1);
}

.navbar-toggler {
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.navbar-toggler:hover {
  border-color: rgba(255, 255, 255, 0.6);
  transform: rotate(90deg);
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
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
    background-color: rgba(33, 37, 41, 0.95);
    margin-top: 1rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
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

/* Dark theme enhancements */
.navbar-dark .navbar-nav .nav-link {
  color: rgba(255, 255, 255, 0.9);
}

.navbar-dark .navbar-nav .nav-link:hover {
  color: #fff;
}

/* Smooth transitions for route changes */
.router-link-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>