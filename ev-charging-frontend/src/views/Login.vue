<!-- src/views/Login.vue -->
<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card mt-5">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">Login</h2>
            
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="form.email"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="form.password"
                  required
                >
              </div>
              
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Login
              </button>
            </form>
            
            <div class="text-center mt-3">
              <p>Don't have an account? 
                <router-link to="/register">Register here</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'
import { useToast } from 'vue-toastification'

export default {
  name: 'Login',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const toast = useToast()
    
    const form = ref({
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    
    const handleLogin = async () => {
      loading.value = true
      
      // Print login data to terminal/console
      console.log('=== LOGIN ATTEMPT ===')
      console.log('Email:', form.value.email)
      console.log('Password:', form.value.password)
      console.log('Timestamp:', new Date().toISOString())
      console.log('=====================')
      
      try {
        console.log('🚀 Making API call to auth store...')
        const result = await authStore.login(form.value)
        console.log('📡 API Response:', result)
        console.log('✅ Login successful for:', form.value.email)
        toast.success('Login successful!')
        router.push('/dashboard')
      } catch (error) {
        console.error('❌ Login failed for:', form.value.email)
        console.error('📡 API Error Response:', error.response?.data || error.message)
        console.error('Full error object:', error)
        toast.error(error.response?.data?.message || 'Login failed')
      } finally {
        loading.value = false
        console.log('Login process completed')
      }
    }
    
    return {
      form,
      loading,
      handleLogin
    }
  }
}
</script>