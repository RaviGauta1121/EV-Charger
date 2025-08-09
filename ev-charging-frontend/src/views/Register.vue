<template>
  <div class="register-container">
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
          <div class="register-card" :class="{ 'card-loading': loading }">
            <!-- Header Section -->
            <div class="card-header">
              <div class="logo-container">
                <div class="logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <h1 class="register-title">Create Account</h1>
              <p class="register-subtitle">Join us and start your journey today</p>
            </div>

            <!-- Form Section -->
            <div class="card-body">
              <form @submit.prevent="handleRegister" class="register-form">
                <!-- Full Name Field -->
                <div class="form-group">
                  <label for="name" class="form-label">
                    <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Full Name
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      v-model="form.name"
                      placeholder="Enter your full name"
                      required
                      :class="{ 'input-filled': form.name }"
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

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
                      type="password"
                      class="form-control"
                      id="password"
                      v-model="form.password"
                      placeholder="Create a strong password"
                      required
                      :class="{ 'input-filled': form.password }"
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="btn-register"
                  :disabled="loading"
                >
                  <span class="btn-content" :class="{ 'btn-loading': loading }">
                    <svg v-if="loading" class="loading-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span v-if="!loading">Create Account</span>
                    <span v-else>Creating Account...</span>
                  </span>
                  <div class="btn-shine"></div>
                </button>
              </form>

              <!-- Login Link -->
              <div class="login-link">
                <p>Already have an account? 
                  <router-link to="/login" class="link-primary">
                    Sign in here
                    <svg class="link-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </router-link>
                </p>
              </div>
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
  name: 'Register',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const toast = useToast()
    
    const form = ref({
      name: '',
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    
    const handleRegister = async () => {
      loading.value = true
      try {
        await authStore.register(form.value)
        toast.success('Registration successful!')
        router.push('/dashboard')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed')
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      handleRegister
    }
  }
}
</script>

<style scoped>
/* Container and Layout */
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
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
.register-card {
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

.register-card:hover {
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

.register-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-subtitle {
  color: #718096;
  font-size: 1rem;
  margin-bottom: 0;
  font-weight: 400;
}

/* Form Section */
.card-body {
  padding: 0 2rem 2rem;
}

.register-form {
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

/* Submit Button */
.btn-register {
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

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0);
}

.btn-register:disabled {
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

.btn-register:hover .btn-shine {
  left: 100%;
}

/* Login Link */
.login-link {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  animation: fadeIn 1s ease-out 0.4s both;
}

.login-link p {
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

/* Responsive Design */
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }
  
  .card-header {
    padding: 2rem 1.5rem 1rem;
  }
  
  .card-body {
    padding: 0 1.5rem 1.5rem;
  }
  
  .register-title {
    font-size: 1.8rem;
  }
  
  .form-control {
    padding: 0.875rem 1rem;
  }
  
  .btn-register {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .register-title {
    font-size: 1.6rem;
  }
  
  .floating-shapes .shape {
    display: none;
  }
}
</style>