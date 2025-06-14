<template>
  <div class="profile-container">
    <div class="container-fluid py-4">
      <div class="row">
        <!-- Profile Header -->
        <div class="col-12">
          <div class="profile-header mb-4">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h1 class="profile-title">
                  <i class="fas fa-user-circle me-3"></i>
                  My Profile
                </h1>
                <p class="profile-subtitle">Manage your account information and preferences</p>
              </div>
              <div class="col-md-4 text-md-end">
                <button 
                  class="btn btn-primary btn-lg"
                  @click="toggleEditMode"
                  :disabled="isSaving"
                >
                  <i class="fas" :class="isEditing ? 'fa-times' : 'fa-edit'"></i>
                  {{ isEditing ? 'Cancel' : 'Edit Profile' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Avatar Section -->
        <div class="col-lg-4 col-md-5 mb-4">
          <div class="profile-card">
            <div class="card-body text-center">
              <div class="avatar-container mb-3">
                <img 
                  :src="userProfile.avatar || '/api/placeholder/150/150'" 
                  :alt="userProfile.name"
                  class="profile-avatar"
                >
                <div class="avatar-overlay" v-if="isEditing">
                  <button class="btn btn-light btn-sm" @click="changeAvatar">
                    <i class="fas fa-camera"></i>
                  </button>
                </div>
              </div>
              <h3 class="profile-name">{{ userProfile.name }}</h3>
              <p class="profile-email">{{ userProfile.email }}</p>
              <div class="profile-badges">
                <span class="badge bg-success" v-if="userProfile.verified">
                  <i class="fas fa-check-circle me-1"></i>
                  Verified
                </span>
                <span class="badge bg-primary">
                  <i class="fas fa-star me-1"></i>
                  {{ userProfile.membershipTier }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Information Form -->
        <div class="col-lg-8 col-md-7">
          <form @submit.prevent="saveProfile" class="profile-form">
            <!-- Personal Information -->
            <div class="profile-card mb-4">
              <div class="card-header">
                <h4 class="card-title">
                  <i class="fas fa-user me-2"></i>
                  Personal Information
                </h4>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Full Name</label>
                    <input 
                      type="text" 
                      class="form-control"
                      v-model="formData.name"
                      :disabled="!isEditing"
                      required
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Email Address</label>
                    <input 
                      type="email" 
                      class="form-control"
                      v-model="formData.email"
                      :disabled="!isEditing"
                      required
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      class="form-control"
                      v-model="formData.phone"
                      :disabled="!isEditing"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Date of Birth</label>
                    <input 
                      type="date" 
                      class="form-control"
                      v-model="formData.dateOfBirth"
                      :disabled="!isEditing"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Vehicle Information -->
            <div class="profile-card mb-4">
              <div class="card-header">
                <h4 class="card-title">
                  <i class="fas fa-car me-2"></i>
                  Vehicle Information
                </h4>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Vehicle Make</label>
                    <select 
                      class="form-select"
                      v-model="formData.vehicleMake"
                      :disabled="!isEditing"
                    >
                      <option value="">Select Make</option>
                      <option value="Tesla">Tesla</option>
                      <option value="BMW">BMW</option>
                      <option value="Audi">Audi</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Chevrolet">Chevrolet</option>
                      <option value="Ford">Ford</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Vehicle Model</label>
                    <input 
                      type="text" 
                      class="form-control"
                      v-model="formData.vehicleModel"
                      :disabled="!isEditing"
                      placeholder="e.g., Model 3, i3, e-tron"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">License Plate</label>
                    <input 
                      type="text" 
                      class="form-control"
                      v-model="formData.licensePlate"
                      :disabled="!isEditing"
                      placeholder="ABC-1234"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Connector Type</label>
                    <select 
                      class="form-select"
                      v-model="formData.connectorType"
                      :disabled="!isEditing"
                    >
                      <option value="">Select Type</option>
                      <option value="Type 1">Type 1 (J1772)</option>
                      <option value="Type 2">Type 2 (Mennekes)</option>
                      <option value="CCS">CCS (Combined Charging System)</option>
                      <option value="CHAdeMO">CHAdeMO</option>
                      <option value="Tesla">Tesla Supercharger</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Address Information -->
            <div class="profile-card mb-4">
              <div class="card-header">
                <h4 class="card-title">
                  <i class="fas fa-map-marker-alt me-2"></i>
                  Address Information
                </h4>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-12 mb-3">
                    <label class="form-label">Street Address</label>
                    <input 
                      type="text" 
                      class="form-control"
                      v-model="formData.address"
                      :disabled="!isEditing"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">City</label>
                    <input 
                      type="text" 
                      class="form-control"
                      v-model="formData.city"
                      :disabled="!isEditing"
                    >
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">State</label>
                    <input 
                      type="text" 
                      class="form-control"
                      v-model="formData.state"
                      :disabled="!isEditing"
                    >
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">ZIP Code</label>
                    <input 
                      type="text" 
                      class="form-control"
                      v-model="formData.zipCode"
                      :disabled="!isEditing"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="profile-actions" v-if="isEditing">
              <button 
                type="submit" 
                class="btn btn-success btn-lg me-3"
                :disabled="isSaving"
              >
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-save me-2"></i>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-lg"
                @click="resetForm"
                :disabled="isSaving"
              >
                <i class="fas fa-undo me-2"></i>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/index.js'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    
    // Reactive state
    const isEditing = ref(false)
    const isSaving = ref(false)
    
    // User profile data
    const userProfile = reactive({
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-15',
      avatar: null,
      verified: true,
      membershipTier: 'Premium',
      vehicleMake: 'Tesla',
      vehicleModel: 'Model 3',
      licensePlate: 'EV-1234',
      connectorType: 'Tesla',
      address: '123 Electric Avenue',
      city: 'Tech City',
      state: 'CA',
      zipCode: '90210'
    })
    
    // Form data for editing
    const formData = reactive({ ...userProfile })
    
    // Computed properties
    const user = computed(() => authStore.user)
    
    // Methods
    const toggleEditMode = () => {
      if (isEditing.value) {
        resetForm()
      }
      isEditing.value = !isEditing.value
    }
    
    const resetForm = () => {
      Object.assign(formData, userProfile)
    }
    
    const saveProfile = async () => {
      isSaving.value = true
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update profile data
        Object.assign(userProfile, formData)
        
        // Update auth store if needed
        authStore.updateUser({
          name: formData.name,
          email: formData.email
        })
        
        isEditing.value = false
        console.log('Profile updated successfully!')
        
      } catch (error) {
        console.error('Failed to update profile:', error)
      } finally {
        isSaving.value = false
      }
    }
    
    const changeAvatar = () => {
      // Simulate file picker
      console.log('Avatar change functionality would be implemented here')
    }
    
    // Initialize component
    onMounted(() => {
      // Load user profile data
      if (user.value) {
        userProfile.name = user.value.name || userProfile.name
        userProfile.email = user.value.email || userProfile.email
        Object.assign(formData, userProfile)
      }
    })
    
    return {
      userProfile,
      formData,
      isEditing,
      isSaving,
      user,
      toggleEditMode,
      resetForm,
      saveProfile,
      changeAvatar
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding-top: 80px;
}

.profile-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.profile-title {
  color: #2c3e50;
  font-weight: 700;
  margin: 0;
  font-size: 2.5rem;
}

.profile-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.profile-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
}

.card-title {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.25rem;
}

.card-body {
  padding: 2rem;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  padding: 0.5rem;
}

.profile-name {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.profile-email {
  color: #6c757d;
  margin-bottom: 1rem;
}

.profile-badges {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.badge {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 20px;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control:disabled,
.form-select:disabled {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  color: #6c757d;
}

.profile-actions {
  text-align: center;
  margin-top: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.btn {
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-color: #007bff;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  border-color: #28a745;
}

.btn-success:hover {
  background: linear-gradient(135deg, #1e7e34, #155724);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  transform: translateY(-2px);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .profile-title {
    font-size: 2rem;
  }
  
  .profile-subtitle {
    font-size: 1rem;
  }
  
  .card-body {
    padding: 1.5rem;
  }
  
  .profile-actions {
    padding: 1.5rem;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .btn:last-child {
    margin-bottom: 0;
  }
}

@media (max-width: 576px) {
  .profile-header {
    padding: 1.5rem;
  }
  
  .profile-title {
    font-size: 1.75rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .profile-avatar {
    width: 100px;
    height: 100px;
  }
}
</style>