<template>
  <div class="login-container">
    <!-- Animated Background Elements -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 col-lg-5 col-xl-4">
          <div class="login-card" :class="{ 'card-loading': loading }">
            <!-- Header Section -->
            <div class="card-header">
              <div class="logo-container">
                <div class="logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <h1 class="login-title">Welcome Back</h1>
              <p class="login-subtitle">Sign in to continue your journey</p>
            </div>

            <!-- Form Section -->
            <div class="card-body">
              <form @submit.prevent="handleLogin" class="login-form">
                <!-- Email Field -->
                <div class="form-group">
                  <label for="email" class="form-label">
                    <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Email Address
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="form.email"
                      placeholder="Enter your email"
                      required
                      :class="{ 'input-filled': form.email }"
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

                <!-- Password Field -->
                <div class="form-group">
                  <label for="password" class="form-label">
                    <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Password
                  </label>
                  <div class="input-wrapper">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      v-model="form.password"
                      placeholder="Enter your password"
                      required
                      :class="{ 'input-filled': form.password }"
                    >
                    <button
                      type="button"
                      class="password-toggle"
                      @click="showPassword = !showPassword"
                      tabindex="-1"
                    >
                      <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 4.028 7.66544 6.17 6.17M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <div class="input-border"></div>
                  </div>
                </div>

                <!-- Forgot Password Link
                <div class="forgot-password">
                  <a href="#" class="forgot-link">Forgot your password?</a>
                </div> -->

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="btn-login"
                  :disabled="loading"
                >
                  <span class="btn-content" :class="{ 'btn-loading': loading }">
                    <svg v-if="loading" class="loading-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span v-if="!loading">Sign In</span>
                    <span v-else>Signing In...</span>
                  </span>
                  <div class="btn-shine"></div>
                </button>
              </form>

              <!-- Register Link -->
              <div class="register-link">
                <p>Don't have an account? 
                  <router-link to="/register" class="link-primary">
                    Create one now
                    <svg class="link-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </router-link>
                </p>
              </div>

              <!-- Social Login Options -->
              <!-- <div class="social-divider">
                <span>or continue with</span>
              </div> -->

            
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
    const showPassword = ref(false)
    
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
      showPassword,
      handleLogin
    }
  }
}
</script>

<style scoped>
/* Container and Layout */
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  margin-top: -4.5rem;
}

/* Animated Background Shapes */
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  border-radius: 50%;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  border-radius: 20px;
  top: 60%;
  right: 10%;
  animation-delay: -5s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  border-radius: 50%;
  top: 10%;
  right: 20%;
  animation-delay: -10s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  border-radius: 15px;
  bottom: 20%;
  left: 15%;
  animation-delay: -15s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(20px) rotate(240deg); }
}

/* Main Card */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.4s ease;
  animation: slideUp 0.6s ease-out;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

.card-loading {
  pointer-events: none;
  opacity: 0.9;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header Section */
.card-header {
  text-align: center;
  padding: 3rem 2rem 1rem;
  position: relative;
}

.logo-container {
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

.logo-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.login-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: #718096;
  font-size: 1rem;
  margin-bottom: 0;
  font-weight: 400;
}

/* Form Section */
.card-body {
  padding: 0 2rem 2rem;
}

.login-form {
  animation: fadeIn 0.8s ease-out 0.2s both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-icon {
  width: 16px;
  height: 16px;
  color: #667eea;
}

/* Input Styling */
.input-wrapper {
  position: relative;
}

.form-control {
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  color: #2d3748;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-control:focus {
  outline: none;
  background: #fff;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.form-control::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

/* Password Toggle */
.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #a0aec0;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #667eea;
}

.password-toggle svg {
  width: 20px;
  height: 20px;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.form-control:focus + .input-border,
.input-filled + .input-border {
  width: 100%;
}

/* Forgot Password */
.forgot-password {
  text-align: right;
  margin-bottom: 1.5rem;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #764ba2;
}

/* Submit Button */
.btn-login {
  width: 100%;
  padding: 1.25rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 1rem 0;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.btn-loading {
  opacity: 0.9;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.btn-login:hover .btn-shine {
  left: 100%;
}

/* Register Link */
.register-link {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  animation: fadeIn 1s ease-out 0.4s both;
}

.register-link p {
  margin: 0;
  color: #718096;
  font-size: 0.95rem;
}

.link-primary {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.3s ease;
}

.link-primary:hover {
  color: #764ba2;
  gap: 0.5rem;
}

.link-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.link-primary:hover .link-arrow {
  transform: translateX(3px);
}

/* Social Login */
.social-divider {
  position: relative;
  text-align: center;
  margin: 2rem 0 1.5rem;
  color: #a0aec0;
  font-size: 0.9rem;
}

.social-divider::before,
.social-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #e2e8f0;
}

.social-divider::before {
  left: 0;
}

.social-divider::after {
  right: 0;
}

.social-divider span {
  background: rgba(255, 255, 255, 0.95);
  padding: 0 1rem;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.social-btn svg {
  width: 20px;
  height: 20px;
}

.google-btn {
  color: #4285F4;
}

.github-btn {
  color: #333;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .card-header {
    padding: 2rem 1.5rem 1rem;
  }
  
  .card-body {
    padding: 0 1.5rem 1.5rem;
  }
  
  .login-title {
    font-size: 1.8rem;
  }
  
  .form-control {
    padding: 0.875rem 1rem;
  }
  
  .btn-login {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
  
  .social-buttons {
    grid-template-columns: 1fr;
  }
}
</style>