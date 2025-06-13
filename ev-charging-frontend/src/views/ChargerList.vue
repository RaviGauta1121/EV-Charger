<!-- src/views/ChargerList.vue -->
<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Charging Stations</h1>
          <button v-if="canAddChargers" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#chargerModal"
            @click="openAddModal">
            <i class="fas fa-plus me-2"></i>Add Charger
          </button>
          <div v-else class="text-muted small">
            <i class="fas fa-info-circle me-1"></i>
            Admin access required to add chargers
          </div>
        </div>

        <!-- User Role Info (for debugging) -->
        <div v-if="showDebugInfo" class="alert alert-info mb-3">
          <small>
            <strong>Debug Info:</strong> Current user role: {{ currentUserRole || 'Not available' }}
            | Can modify: {{ canModifyChargers ? 'Yes' : 'No' }}
            | Can delete: {{ canDeleteChargers ? 'Yes' : 'No' }}
          </small>
        </div>

        <!-- Filters -->
        <div class="row mb-4">
          <div class="col-md-3">
            <input v-model="filters.search" type="text" class="form-control" placeholder="Search chargers..."
              @input="updateFilters">
          </div>
          <div class="col-md-2">
            <select v-model="filters.status" class="form-select" @change="updateFilters">
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.type" class="form-select" @change="updateFilters">
              <option value="">All Types</option>
              <option value="Standard">Standard</option>
              <option value="Fast">Fast</option>
              <option value="Rapid">Rapid</option>
              <option value="Ultra Fast">Ultra Fast</option>
            </select>
          </div>
          <div class="col-md-3">
            <input v-model="filters.location" type="text" class="form-control" placeholder="Filter by city..."
              @input="updateFilters">
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="clearFilters">
              Clear
            </button>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="chargersStore.loading" class="loading-spinner text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading charging stations...</p>
        </div>

        <!-- Error Message -->
        <div v-else-if="chargersStore.error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ chargersStore.error }}
          <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchChargers">
            Try Again
          </button>
        </div>

        <!-- Charger Cards -->
        <div v-else class="row">
          <div v-for="charger in displayedChargers" :key="charger._id" class="col-md-6 col-lg-4 mb-4">
            <ChargerCard :charger="charger" :can-edit="canModifyChargers" :can-delete="canDeleteChargers"
              @edit="openEditModal" @delete="handleDelete" @update="handleUpdate" @remove="handleRemove" />
          </div>

          <!-- No Results -->
          <div v-if="displayedChargers.length === 0 && !chargersStore.loading" class="col-12">
            <div class="text-center py-5">
              <i class="fas fa-search fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">No chargers found</h4>
              <p class="text-muted">Try adjusting your filters or add a new charger</p>
              <button class="btn btn-outline-primary" @click="clearFilters">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" aria-label="Charger pagination" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                Previous
              </button>
            </li>
            <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- ChargerModal Component -->
    <ChargerModal v-if="canModifyChargers" :charger="selectedCharger" :is-edit-mode="isEditMode"
      @charger-saved="handleChargerSaved" @modal-closed="resetModal" />

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Confirm Delete</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this charging station?</p>
            <div v-if="chargerToDelete" class="alert alert-warning">
              <strong>{{ chargerToDelete.name }}</strong><br>
              <small class="text-muted">{{ chargerToDelete.location }}</small>
            </div>
            <p class="text-danger small">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete" :disabled="deleteLoading">
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Delete Station
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Unauthorized Action Modal -->
    <div class="modal fade" id="unauthorizedModal" tabindex="-1" aria-labelledby="unauthorizedModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="unauthorizedModalLabel">
              <i class="fas fa-lock text-warning me-2"></i>
              Unauthorized Action
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Permission Denied</strong>
            </div>
            <p>{{ unauthorizedMessage }}</p>
            <p class="text-muted small">
              Contact your system administrator if you believe you should have access to this feature.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Container for all notifications -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <!-- Success Toast -->
      <div ref="successToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <i class="fas fa-check-circle text-success me-2"></i>
          <strong class="me-auto">Success</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>

      <!-- Warning Toast -->
      <div ref="warningToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <i class="fas fa-exclamation-triangle text-warning me-2"></i>
          <strong class="me-auto">Warning</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ warningMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useChargersStore } from '../store/charger'
import ChargerCard from '@/components/ChargerCard.vue'
import ChargerModal from '@/components/ChargerModal.vue'

export default {
  name: 'ChargerList',
  components: {
    ChargerCard,
    ChargerModal
  },
  setup() {
    // Use the Pinia store
    const chargersStore = useChargersStore()

    // Local reactive state
    const deleteLoading = ref(false)
    const selectedCharger = ref(null)
    const chargerToDelete = ref(null)
    const isEditMode = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    const toastMessage = ref('')
    const warningMessage = ref('')
    const successToast = ref(null)
    const warningToast = ref(null)

    // Authorization state
    const currentUserRole = ref(null)
    const unauthorizedMessage = ref('')
    const showDebugInfo = ref(false) // Set to true for debugging

    // Error handling state
    const errorMessage = ref('')

    // Local filters (separate from store filters for better UX)
    const filters = ref({
      search: '',
      status: '',
      type: '',
      location: ''
    })

    // Authorization computed properties
    const canModifyChargers = computed(() => {
      const role = currentUserRole.value
      return role === 'admin' || role === 'manager'
    })

    const canDeleteChargers = computed(() => {
      const role = currentUserRole.value
      return role === 'admin'
    })

    const canAddChargers = computed(() => {
      const role = currentUserRole.value
      return role === 'admin' || role === 'manager'
    })

    // Get user role from various sources
    const getUserRole = () => {
      try {
        // Try to get from local storage
        const user = localStorage.getItem('user')
        if (user) {
          const parsedUser = JSON.parse(user)
          return parsedUser.role || parsedUser.userType || 'user'
        }

        // Try to get from session storage
        const sessionUser = sessionStorage.getItem('user')
        if (sessionUser) {
          const parsedUser = JSON.parse(sessionUser)
          return parsedUser.role || parsedUser.userType || 'user'
        }

        // Try to get from auth store (if using Pinia/Vuex)
        if (window.$auth && window.$auth.user) {
          return window.$auth.user.role || window.$auth.user.userType || 'user'
        }

        // Default to 'user' if nothing found
        return 'user'
      } catch (error) {
        console.warn('⚠️ Error getting user role:', error)
        return 'user'
      }
    }

    // Enhanced Error Handling Methods
    const handleError = (error, operation = 'operation') => {
      console.error(`❌ Error during ${operation}:`, error)

      let message = `Failed to ${operation}`
      let isAuthError = false

      if (error.message) {
        message = error.message
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.response?.status) {
        switch (error.response.status) {
          case 401:
            message = 'Authentication required. Please login.'
            isAuthError = true
            break
          case 403:
            message = 'Permission denied. Admin access required.'
            isAuthError = true
            break
          case 404:
            message = 'Charger not found.'
            break
          case 500:
            message = 'Server error. Please try again later.'
            break
          default:
            message = `Error ${error.response.status}: ${operation} failed`
        }
      }

      if (isAuthError) {
        showUnauthorizedModal(message)
      } else {
        showErrorToast(message)
      }
    }

    const showUnauthorizedModal = (message) => {
      try {
        unauthorizedMessage.value = message

        // Check if Bootstrap is available
        if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Modal) {
          console.warn('⚠️ Bootstrap not available, using alert fallback')
          alert(`Unauthorized: ${message}`)
          return
        }

        nextTick(() => {
          const modal = document.getElementById('unauthorizedModal')
          if (modal) {
            const bsModal = new window.bootstrap.Modal(modal)
            bsModal.show()
          } else {
            alert(`Unauthorized: ${message}`)
          }
        })
      } catch (error) {
        console.error('❌ Error showing unauthorized modal:', error)
        alert(`Unauthorized: ${message}`)
      }
    }

    const showErrorToast = (message) => {
      try {
        // Check if Bootstrap is available, fallback to alert if not
        if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Toast) {
          console.warn('⚠️ Bootstrap not available, using alert fallback')
          alert(`Error: ${message}`)
          return
        }

        // Create and show error toast
        const toastHtml = `
          <div class="toast align-items-center text-white bg-danger border-0" role="alert">
            <div class="d-flex">
              <div class="toast-body">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
              </div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
          </div>
        `

        // Add to toast container and show
        const toastContainer = document.querySelector('.toast-container')
        if (toastContainer) {
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = toastHtml
          const toastElement = tempDiv.firstElementChild
          toastContainer.appendChild(toastElement)

          const toast = new window.bootstrap.Toast(toastElement)
          toast.show()

          // Remove element after hiding
          toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove()
          })
        } else {
          alert(`Error: ${message}`)
        }
      } catch (error) {
        console.error('❌ Error showing error toast:', error)
        alert(`Error: ${message}`)
      }
    }

    // Computed properties
    const filteredChargers = computed(() => {
      let result = [...chargersStore.filteredChargers]

      // Apply additional local filters
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        result = result.filter(charger =>
          charger.name?.toLowerCase().includes(searchTerm) ||
          charger.location?.toLowerCase().includes(searchTerm)
        )
      }

      if (filters.value.location) {
        result = result.filter(charger =>
          charger.location?.toLowerCase().includes(filters.value.location.toLowerCase())
        )
      }

      return result
    })

    const displayedChargers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredChargers.value.slice(start, end)
    })

    const totalPages = computed(() =>
      Math.ceil(filteredChargers.value.length / itemsPerPage.value)
    )

    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages.value, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    // Enhanced Methods with Error Handling
    const fetchChargers = async () => {
      try {
        console.log('🔄 Fetching chargers through store...')
        await chargersStore.fetchChargers()
        console.log('✅ Chargers fetched successfully')
      } catch (error) {
        handleError(error, 'fetch chargers')
      }
    }

    const updateFilters = () => {
      try {
        // Update store filters
        chargersStore.setFilters({
          status: filters.value.status,
          type: filters.value.type,
          power: '', // You can add power filter to UI if needed
        })
        currentPage.value = 1
      } catch (error) {
        handleError(error, 'update filters')
      }
    }

    const clearFilters = () => {
      try {
        filters.value = {
          search: '',
          status: '',
          type: '',
          location: ''
        }
        chargersStore.clearFilters()
        currentPage.value = 1
      } catch (error) {
        handleError(error, 'clear filters')
      }
    }

    const openAddModal = () => {
      try {
        if (!canAddChargers.value) {
          showUnauthorizedModal('You need admin or manager privileges to add new charging stations.')
          return
        }

        console.log('🆕 Opening add modal')
        selectedCharger.value = null
        isEditMode.value = false

        // Check if Bootstrap is available
        if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Modal) {
          console.warn('⚠️ Bootstrap Modal not available')
          alert('Modal functionality requires Bootstrap. Please ensure Bootstrap is loaded.')
          return
        }

        // Use nextTick to ensure DOM is updated
        nextTick(() => {
          const modal = document.getElementById('chargerModal')
          if (modal) {
            const bsModal = new window.bootstrap.Modal(modal)
            bsModal.show()
          } else {
            throw new Error('Modal element not found')
          }
        })
      } catch (error) {
        handleError(error, 'open add modal')
      }
    }

    const openEditModal = (charger) => {
      try {
        if (!canModifyChargers.value) {
          showUnauthorizedModal('You need admin or manager privileges to edit charging stations.')
          return
        }

        console.log('✏️ Opening edit modal for charger:', charger)

        if (!charger || !charger._id) {
          throw new Error('Invalid charger data for editing')
        }

        // Check if Bootstrap is available
        if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Modal) {
          console.warn('⚠️ Bootstrap Modal not available')
          alert('Modal functionality requires Bootstrap. Please ensure Bootstrap is loaded.')
          return
        }

        selectedCharger.value = { ...charger }
        isEditMode.value = true

        // Use nextTick to ensure DOM is updated
        nextTick(() => {
          const modal = document.getElementById('chargerModal')
          if (modal) {
            const bsModal = new window.bootstrap.Modal(modal)
            bsModal.show()
          } else {
            throw new Error('Modal element not found')
          }
        })
      } catch (error) {
        handleError(error, 'open edit modal')
      }
    }

    // Alternative handlers for different event names
    const handleUpdate = (charger) => {
      console.log('🔄 Update event received:', charger)
      openEditModal(charger)
    }

    const handleRemove = (chargerId) => {
      console.log('🗑️ Remove event received for ID:', chargerId)
      handleDelete(chargerId)
    }

    const handleDelete = (chargerId) => {
      try {
        if (!canDeleteChargers.value) {
          showUnauthorizedModal('You need admin privileges to delete charging stations.')
          return
        }

        console.log('🗑️ Delete requested for charger ID:', chargerId)

        if (!chargerId) {
          throw new Error('No charger ID provided for deletion')
        }

        const charger = chargersStore.chargers.find(c => c._id === chargerId)
        if (!charger) {
          throw new Error('Charger not found')
        }

        // Check if Bootstrap is available
        if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Modal) {
          console.warn('⚠️ Bootstrap Modal not available')
          // Fallback to confirm dialog
          const confirmed = confirm(`Are you sure you want to delete "${charger.name}"? This action cannot be undone.`)
          if (confirmed) {
            chargerToDelete.value = charger
            confirmDelete()
          }
          return
        }

        chargerToDelete.value = charger

        // Use nextTick to ensure DOM is updated
        nextTick(() => {
          const deleteModalElement = document.getElementById('deleteModal')
          if (deleteModalElement) {
            const deleteModal = new window.bootstrap.Modal(deleteModalElement)
            deleteModal.show()
          } else {
            throw new Error('Delete modal element not found')
          }
        })
      } catch (error) {
        handleError(error, 'prepare delete')
      }
    }

    const confirmDelete = async () => {
      if (!chargerToDelete.value) {
        handleError(new Error('No charger selected for deletion'), 'delete charger')
        return
      }

      if (!canDeleteChargers.value) {
        showUnauthorizedModal('You need admin privileges to delete charging stations.')
        return
      }

      try {
        deleteLoading.value = true
        console.log('🗑️ Deleting charger:', chargerToDelete.value._id)

        await chargersStore.deleteCharger(chargerToDelete.value._id)

        // Close modal (if Bootstrap is available)
        if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
          const deleteModalElement = document.getElementById('deleteModal')
          if (deleteModalElement) {
            const deleteModal = window.bootstrap.Modal.getInstance(deleteModalElement)
            if (deleteModal) {
              deleteModal.hide()
            }
          }
        }

        // Show success message
        showToast('Charging station deleted successfully')
        chargerToDelete.value = null

        console.log('✅ Charger deleted successfully')

        // Refresh the chargers list
        await fetchChargers()

      } catch (error) {
        handleError(error, 'delete charger')
      } finally {
        deleteLoading.value = false
      }
    }

    const handleChargerSaved = async ({ charger, isEditMode: wasEditMode }) => {
      try {
        console.log('💾 Charger saved:', charger, 'Edit mode:', wasEditMode)

        if (wasEditMode) {
          showToast('Charging station updated successfully')
        } else {
          showToast('Charging station added successfully')
        }

        // Refresh the chargers list
        await fetchChargers()
        resetModal()
      } catch (error) {
        handleError(error, wasEditMode ? 'update charger' : 'create charger')
      }
    }

    const resetModal = () => {
      try {
        console.log('🔄 Resetting modal state')
        selectedCharger.value = null
        isEditMode.value = false
      } catch (error) {
        handleError(error, 'reset modal')
      }
    }

    const changePage = (page) => {
      try {
        if (page >= 1 && page <= totalPages.value) {
          currentPage.value = page
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } catch (error) {
        handleError(error, 'change page')
      }
    }

    const showToast = (message) => {
      try {
        toastMessage.value = message

        // Check if Bootstrap is available
        if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Toast) {
          console.warn('⚠️ Bootstrap Toast not available, using alert fallback')
          alert(message)
          return
        }

        if (successToast.value) {
          const toast = new window.bootstrap.Toast(successToast.value)
          toast.show()
        } else {
          // Fallback if toast ref not available
          alert(message)
        }
      } catch (error) {
        console.error('❌ Error showing toast:', error)
        // Fallback to alert if toast fails
        alert(message)
      }
    }

    const showWarningToast = (message) => {
      try {
        warningMessage.value = message

        // Check if Bootstrap is available
        if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Toast) {
          console.warn('⚠️ Bootstrap Toast not available, using alert fallback')
          alert(`Warning: ${message}`)
          return
        }

        if (warningToast.value) {
          const toast = new window.bootstrap.Toast(warningToast.value)
          toast.show()
        } else {
          // Fallback if toast ref not available
          alert(`Warning: ${message}`)
        }
      } catch (error) {
        console.error('❌ Error showing warning toast:', error)
        // Fallback to alert if toast fails
        alert(`Warning: ${message}`)
      }
    }

    // Debug method to check store state
    const debugStoreState = () => {
      console.log('🔍 Store state debug:')
      console.log('- Chargers count:', chargersStore.chargers?.length || 0)
      console.log('- Filtered chargers count:', chargersStore.filteredChargers?.length || 0)
      console.log('- Loading:', chargersStore.loading)
      console.log('- Error:', chargersStore.error)
      console.log('- Current user role:', currentUserRole.value)
      console.log('- Can modify:', canModifyChargers.value)
      console.log('- Can delete:', canDeleteChargers.value)
    }

    // Watch for filter changes to reset pagination
    watch(filters, () => {
      currentPage.value = 1
    }, { deep: true })

    // Lifecycle
    onMounted(async () => {
      try {
        console.log('🚀 ChargerList mounted, initializing...')

        // Get current user role
        currentUserRole.value = getUserRole()
        console.log('👤 Current user role:', currentUserRole.value)

        // Check if Bootstrap is available and warn if not
        if (typeof window.bootstrap === 'undefined') {
          console.warn('⚠️ Bootstrap JavaScript not loaded - using fallback functionality')
          // Don't throw error, just warn and continue
        } else {
          console.log('✅ Bootstrap is available')
        }

        // Debug store state
        debugStoreState()

        // Fetch chargers
        await fetchChargers()

        // Debug after fetch
        setTimeout(() => {
          debugStoreState()
        }, 1000)
      } catch (error) {
        handleError(error, 'initialize component')
      }
    })

    return {
      // Store
      chargersStore,

      // State
      deleteLoading,
      selectedCharger,
      chargerToDelete,
      isEditMode,
      currentPage,
      filters,
      toastMessage,
      warningMessage,
      successToast,
      warningToast,

      // Authorization state
      currentUserRole,
      unauthorizedMessage,
      showDebugInfo,

      // Error handling state
      errorMessage,

      // Computed
      displayedChargers,
      totalPages,
      visiblePages,
      canModifyChargers,
      canDeleteChargers,
      canAddChargers,

      // Methods
      fetchChargers,
      updateFilters,
      clearFilters,
      openAddModal,
      openEditModal,
      handleDelete,
      handleUpdate,
      handleRemove,
      confirmDelete,
      handleChargerSaved,
      resetModal,
      changePage,
      showToast,
      showWarningToast,
      debugStoreState,

      // Authorization methods
      getUserRole,

      // Error handling methods
      handleError,
      showUnauthorizedModal,
      showErrorToast
    }
  }
}
</script>
