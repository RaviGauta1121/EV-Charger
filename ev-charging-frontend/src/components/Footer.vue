<!-- src/components/Footer.vue -->
<template>
  <footer class="site-footer">
    <!-- CTA Section -->
    <div class="footer-cta">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <div class="cta-content">
              <h2 class="cta-title">
                <i class="fas fa-plus-circle me-3"></i>
                Expand Your EV Charging Network
              </h2>
              <p class="cta-subtitle">
                Join our growing network of charging stations. We help property owners install and manage EV chargers with zero upfront costs and revenue sharing opportunities.
              </p>
              <div class="cta-features">
                <div class="feature-item">
                  <i class="fas fa-check-circle"></i>
                  <span>Free Installation & Maintenance</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-chart-line"></i>
                  <span>Revenue Sharing Program</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-headset"></i>
                  <span>24/7 Technical Support</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 text-lg-end">
            <div class="cta-actions">
              <button @click="openContactModal" class="btn btn-primary btn-lg cta-btn">
                <i class="fas fa-handshake me-2"></i>
                Partner With Us
              </button>
              <button @click="openLocationModal" class="btn btn-outline-primary btn-lg cta-btn mt-2">
                <i class="fas fa-map-marker-alt me-2"></i>
                Add Your Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Footer Content -->
    <div class="footer-main">
      <div class="container-fluid">
        <div class="row">
          <!-- Company Info -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-section">
              <div class="footer-logo">
                <i class="fas fa-charging-station"></i>
                <h3>EVCharge Network</h3>
              </div>
              <p class="footer-description">
                Leading the future of electric vehicle charging infrastructure with smart, sustainable, and accessible charging solutions across the region.
              </p>
              <div class="social-links">
                <a href="#" class="social-link" aria-label="Facebook">
                  <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="social-link" aria-label="Twitter">
                  <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="social-link" aria-label="LinkedIn">
                  <i class="fab fa-linkedin-in"></i>
                </a>
                <a href="#" class="social-link" aria-label="Instagram">
                  <i class="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="col-lg-2 col-md-6 mb-4">
            <div class="footer-section">
              <h4 class="footer-title">Quick Links</h4>
              <ul class="footer-links">
                <li><router-link to="/dashboard">Dashboard</router-link></li>
                <li><router-link to="/chargers">Find Chargers</router-link></li>
                <li><router-link to="/map">Location Map</router-link></li>
                <li><router-link to="/pricing">Pricing Plans</router-link></li>
                <li><router-link to="/support">Support Center</router-link></li>
              </ul>
            </div>
          </div>

          <!-- Services -->
          <div class="col-lg-2 col-md-6 mb-4">
            <div class="footer-section">
              <h4 class="footer-title">Services</h4>
              <ul class="footer-links">
                <li><a href="#" @click.prevent="openServiceModal('installation')">Charger Installation</a></li>
                <li><a href="#" @click.prevent="openServiceModal('maintenance')">Maintenance Plans</a></li>
                <li><a href="#" @click.prevent="openServiceModal('monitoring')">Remote Monitoring</a></li>
                <li><a href="#" @click.prevent="openServiceModal('consulting')">Site Consulting</a></li>
                <li><a href="#" @click.prevent="openServiceModal('fleet')">Fleet Solutions</a></li>
              </ul>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-section">
              <h4 class="footer-title">Get In Touch</h4>
              <div class="contact-info">
                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="fas fa-phone"></i>
                  </div>
                  <div class="contact-details">
                    <strong>Partnership Hotline</strong>
                    <a href="tel:+911234567890">+91 12345 67890</a>
                  </div>
                </div>
                
                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <div class="contact-details">
                    <strong>Partnership Email</strong>
                    <a href="mailto:partners@evcharge.com">partners@evcharge.com</a>
                  </div>
                </div>
                
                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div class="contact-details">
                    <strong>Headquarters</strong>
                    <span>Bhopal, Madhya Pradesh, India</span>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="contact-details">
                    <strong>Business Hours</strong>
                    <span>Mon-Sun: 24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="copyright">
              &copy; {{ currentYear }} EVCharge Network. All rights reserved.
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="footer-bottom-links">
              <a href="#" @click.prevent="openModal('privacy')">Privacy Policy</a>
              <a href="#" @click.prevent="openModal('terms')">Terms of Service</a>
              <a href="#" @click.prevent="openModal('cookies')">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Modal -->
    <div v-if="showContactModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-handshake me-2"></i>
            Partner With Us
          </h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitPartnershipForm">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Full Name *</label>
                <input v-model="partnerForm.name" type="text" class="form-control" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Company/Organization</label>
                <input v-model="partnerForm.company" type="text" class="form-control">
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Email Address *</label>
                <input v-model="partnerForm.email" type="email" class="form-control" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Phone Number *</label>
                <input v-model="partnerForm.phone" type="tel" class="form-control" required>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Property Type *</label>
              <select v-model="partnerForm.propertyType" class="form-control" required>
                <option value="">Select Property Type</option>
                <option value="commercial">Commercial Building</option>
                <option value="residential">Residential Complex</option>
                <option value="retail">Shopping Center/Mall</option>
                <option value="hotel">Hotel/Resort</option>
                <option value="hospital">Hospital/Healthcare</option>
                <option value="office">Office Complex</option>
                <option value="parking">Parking Facility</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Location Address *</label>
              <textarea v-model="partnerForm.address" class="form-control" rows="2" required></textarea>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Estimated Parking Spaces</label>
                <input v-model="partnerForm.parkingSpaces" type="number" class="form-control" min="1">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Preferred Timeline</label>
                <select v-model="partnerForm.timeline" class="form-control">
                  <option value="">Select Timeline</option>
                  <option value="immediate">Immediate (1-2 months)</option>
                  <option value="short">Short term (3-6 months)</option>
                  <option value="medium">Medium term (6-12 months)</option>
                  <option value="long">Long term (1+ years)</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Additional Information</label>
              <textarea v-model="partnerForm.message" class="form-control" rows="3" 
                       placeholder="Tell us about your property, expected traffic, current electrical capacity, or any specific requirements..."></textarea>
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input v-model="partnerForm.agreeTerms" class="form-check-input" type="checkbox" id="agreeTerms" required>
                <label class="form-check-label" for="agreeTerms">
                  I agree to the <a href="#" @click.prevent="openModal('terms')">Terms of Service</a> and <a href="#" @click.prevent="openModal('privacy')">Privacy Policy</a>
                </label>
              </div>
            </div>
            <div class="text-end">
              <button type="button" @click="closeModal" class="btn btn-outline-secondary me-2">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="submittingForm">
                <i v-if="submittingForm" class="fas fa-spinner fa-spin me-2"></i>
                <i v-else class="fas fa-paper-plane me-2"></i>
                Submit Partnership Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Location Modal -->
    <div v-if="showLocationModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-map-marker-alt me-2"></i>
            Add Your Location
          </h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="quick-contact-options">
            <div class="contact-option" @click="callPartnershipLine">
              <div class="option-icon">
                <i class="fas fa-phone"></i>
              </div>
              <div class="option-content">
                <h4>Call Our Partnership Team</h4>
                <p>Speak directly with our partnership specialists</p>
                <strong>+91 12345 67890</strong>
              </div>
            </div>
            
            <div class="contact-option" @click="emailPartnership">
              <div class="option-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <div class="option-content">
                <h4>Email Partnership Team</h4>
                <p>Send us your location details and requirements</p>
                <strong>partners@evcharge.com</strong>
              </div>
            </div>
            
            <div class="contact-option" @click="openContactModal">
              <div class="option-icon">
                <i class="fas fa-form"></i>
              </div>
              <div class="option-content">
                <h4>Fill Partnership Form</h4>
                <p>Complete our detailed partnership application</p>
                <strong>Detailed Application</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'Footer',
  setup() {
    const toast = useToast()
    
    // Modal states
    const showContactModal = ref(false)
    const showLocationModal = ref(false)
    const submittingForm = ref(false)
    
    // Form data
    const partnerForm = ref({
      name: '',
      company: '',
      email: '',
      phone: '',
      propertyType: '',
      address: '',
      parkingSpaces: '',
      timeline: '',
      message: '',
      agreeTerms: false
    })
    
    // Computed properties
    const currentYear = computed(() => new Date().getFullYear())
    
    // Methods
    const openContactModal = () => {
      showLocationModal.value = false
      showContactModal.value = true
    }
    
    const openLocationModal = () => {
      showContactModal.value = false
      showLocationModal.value = true
    }
    
    const closeModal = () => {
      showContactModal.value = false
      showLocationModal.value = false
    }
    
    const openModal = (type) => {
      toast.info(`${type.charAt(0).toUpperCase() + type.slice(1)} page coming soon!`)
    }
    
    const openServiceModal = (service) => {
      toast.info(`${service.charAt(0).toUpperCase() + service.slice(1)} service details available soon!`)
    }
    
    const callPartnershipLine = () => {
      window.open('tel:+911234567890')
    }
    
    const emailPartnership = () => {
      window.open('mailto:partners@evcharge.com?subject=Partnership Inquiry - Location Addition')
    }
    
   // Updated submitPartnershipForm method for Footer.vue
// Replace the existing submitPartnershipForm method with this:

const submitPartnershipForm = async () => {
  submittingForm.value = true
  
  try {
    // Validate required fields
    if (!partnerForm.value.name || !partnerForm.value.email || 
        !partnerForm.value.phone || !partnerForm.value.propertyType || 
        !partnerForm.value.address || !partnerForm.value.agreeTerms) {
      toast.error('Please fill in all required fields and agree to terms')
      return
    }
    
    // API call to backend
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/partnerships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: partnerForm.value.name,
        company: partnerForm.value.company,
        email: partnerForm.value.email,
        phone: partnerForm.value.phone,
        propertyType: partnerForm.value.propertyType,
        address: partnerForm.value.address,
        parkingSpaces: partnerForm.value.parkingSpaces ? parseInt(partnerForm.value.parkingSpaces) : null,
        timeline: partnerForm.value.timeline,
        message: partnerForm.value.message,
        agreeTerms: partnerForm.value.agreeTerms
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // Handle validation errors
      if (data.errors) {
        const errorMessages = Object.values(data.errors).filter(Boolean).join(', ')
        toast.error(`Validation Error: ${errorMessages}`)
      } else {
        toast.error(data.message || 'Failed to submit partnership request')
      }
      return
    }
    
    // Success
    toast.success(data.message || 'Partnership request submitted successfully! We will contact you within 24 hours.')
    
    // Reset form
    partnerForm.value = {
      name: '',
      company: '',
      email: '',
      phone: '',
      propertyType: '',
      address: '',
      parkingSpaces: '',
      timeline: '',
      message: '',
      agreeTerms: false
    }
    
    closeModal()
    
  } catch (error) {
    console.error('Network error:', error)
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      toast.error('Unable to connect to server. Please check your internet connection and try again.')
    } else {
      toast.error('An unexpected error occurred. Please try again later.')
    }
  } finally {
    submittingForm.value = false
  }
}

// Also add this method to handle network status
const checkNetworkStatus = () => {
  if (!navigator.onLine) {
    toast.warning('You appear to be offline. Please check your internet connection.')
    return false
  }
  return true
}

// You can call checkNetworkStatus() before making the API call if needed
    
    return {
      showContactModal,
      showLocationModal,
      submittingForm,
      partnerForm,
      currentYear,
      openContactModal,
      openLocationModal,
      closeModal,
      openModal,
      openServiceModal,
      callPartnershipLine,
      emailPartnership,
      submitPartnershipForm
    }
  }
}
</script>

<style scoped>
/* Footer CTA Section */
.footer-cta {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  color: #2c3e50;
  padding: 3rem 0;
  border-bottom: 1px solid #e9ecef;
}

.cta-content {
  margin-bottom: 1.5rem;
}

.cta-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.cta-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.cta-features {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: #495057;
}

.feature-item i {
  color: #28a745;
  margin-right: 0.5rem;
  font-size: 1rem;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cta-btn {
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 220px;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Main Footer */
.footer-main {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #ecf0f1;
  padding: 3rem 0 2rem;
}

.footer-section {
  height: 100%;
}

.footer-logo {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.footer-logo i {
  font-size: 2.5rem;
  color: #3498db;
  margin-right: 1rem;
}

.footer-logo h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #ecf0f1;
}

.footer-description {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  color: #ecf0f1;
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #3498db;
  color: white;
  transform: translateY(-2px);
}

.footer-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #ecf0f1;
  position: relative;
}

.footer-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.5rem;
  width: 30px;
  height: 2px;
  background: #3498db;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: rgba(236, 240, 241, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.footer-links a:hover {
  color: #3498db;
  padding-left: 0.5rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
}

.contact-icon {
  width: 40px;
  height: 40px;
  background: rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.contact-icon i {
  color: #3498db;
  font-size: 1rem;
}

.contact-details {
  display: flex;
  flex-direction: column;
}

.contact-details strong {
  color: #ecf0f1;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.contact-details a,
.contact-details span {
  color: rgba(236, 240, 241, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
}

.contact-details a:hover {
  color: #3498db;
}

/* Footer Bottom */
.footer-bottom {
  background: #1a252f;
  color: rgba(236, 240, 241, 0.7);
  padding: 1.5rem 0;
}

.copyright {
  margin: 0;
  font-size: 0.9rem;
}

.footer-bottom-links {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
}

.footer-bottom-links a {
  color: rgba(236, 240, 241, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-bottom-links a:hover {
  color: #3498db;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px 15px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.modal-body {
  padding: 2rem;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

.form-check-label a {
  color: #3498db;
  text-decoration: none;
}

.form-check-label a:hover {
  text-decoration: underline;
}

/* Quick Contact Options */
.quick-contact-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-option {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.contact-option:hover {
  border-color: #3498db;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
  transform: translateY(-2px);
}

.option-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  color: white;
  font-size: 1.5rem;
}

.option-content h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.option-content p {
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.option-content strong {
  color: #3498db;
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer-cta {
    padding: 2rem 0;
  }
  
  .cta-title {
    font-size: 1.8rem;
  }
  
  .cta-features {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cta-actions {
    margin-top: 1.5rem;
  }
  
  .footer-main {
    padding: 2rem 0 1.5rem;
  }
  
  .footer-bottom-links {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .modal-content {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .modal-header,
  .modal-body {
    padding: 1.5rem;
  }
  
  .contact-option {
    flex-direction: column;
    text-align: center;
  }
  
  .option-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .cta-title {
    font-size: 1.5rem;
  }
  
  .cta-btn {
    min-width: auto;
    width: 100%;
  }
  
  .footer-logo {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-logo i {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .contact-item {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}

/* Animation for form submission */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus states for accessibility */
.btn:focus,
.form-control:focus,
.modal-close:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

/* Loading animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fa-spin {
  animation: spin 1s linear infinite;
}

/* Hover effects for better UX */
.footer-section:hover .footer-title::after {
  width: 50px;
  transition: width 0.3s ease;
}

/* Print styles */
@media print {
  .footer-cta,
  .modal-overlay {
    display: none;
  }
  
  .footer-main {
    background: none;
    color: #000;
  }
  
  .footer-links a {
    color: #000;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .footer-main {
    background: #000;
    color: #fff;
  }
  
  .footer-cta {
    background: #fff;
    color: #000;
    border: 2px solid #000;
  }
  
  .btn {
    border: 2px solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .cta-btn:hover,
  .social-link:hover,
  .contact-option:hover {
    transform: none;
  }
  
  .modal-content {
    animation: none;
  }
  
  .fa-spin {
    animation: none;
  }
}
</style>