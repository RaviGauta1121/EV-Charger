<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="settings-header">
      <i class="fas fa-cog"></i>
      <h4>Settings</h4>
    </div>

    <!-- Settings List -->
    <div class="settings-list">
      <!-- Profile -->
      <div class="setting-item">
        <div class="setting-info">
          <i class="fas fa-user"></i>
          <span>Name</span>
        </div>
        <input type="text" v-model="settings.name" placeholder="Your name">
      </div>

      <!-- Notifications -->
      <div class="setting-item">
        <div class="setting-info">
          <i class="fas fa-bell"></i>
          <span>Notifications</span>
        </div>
        <div class="toggle" @click="toggle('notifications')" :class="{ active: settings.notifications }">
          <div class="toggle-btn"></div>
        </div>
      </div>

      <!-- Auto Book -->
      <div class="setting-item">
        <div class="setting-info">
          <i class="fas fa-charging-station"></i>
          <span>Auto Book</span>
        </div>
        <div class="toggle" @click="toggle('autoBook')" :class="{ active: settings.autoBook }">
          <div class="toggle-btn"></div>
        </div>
      </div>

      <!-- Theme -->
      <div class="setting-item">
        <div class="setting-info">
          <i class="fas fa-palette"></i>
          <span>Theme</span>
        </div>
        <select v-model="settings.theme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <!-- Sound -->
      <div class="setting-item">
        <div class="setting-info">
          <i class="fas fa-volume-up"></i>
          <span>Sound</span>
        </div>
        <div class="toggle" @click="toggle('sound')" :class="{ active: settings.sound }">
          <div class="toggle-btn"></div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <button class="save-btn" @click="save" :disabled="saving">
      <i class="fas fa-save" v-if="!saving"></i>
      <i class="fas fa-spinner fa-spin" v-else></i>
      {{ saving ? 'Saving...' : 'Save' }}
    </button>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'Settings',
  setup() {
    const saving = ref(false)
    
    const settings = reactive({
      name: 'John Doe',
      notifications: true,
      autoBook: false,
      theme: 'light',
      sound: true
    })

    const toggle = (setting) => {
      settings[setting] = !settings[setting]
    }

    const save = async () => {
      saving.value = true
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
      saving.value = false
    }

    return {
      settings,
      saving,
      toggle,
      save
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Header */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 8px;
  color: #1976d2;
}

.settings-header i {
  font-size: 1.5rem;
  margin-right: 0.5rem;
  animation: spin 2s linear infinite;
}

.settings-header h4 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Settings List */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Setting Item */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.setting-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #90caf9;
}

/* Setting Info */
.setting-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #495057;
  font-weight: 500;
}

.setting-info i {
  width: 20px;
  text-align: center;
  color: #1976d2;
}

/* Toggle Switch */
.toggle {
  width: 44px;
  height: 24px;
  background: #dee2e6;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle:hover {
  background: #ced4da;
}

.toggle.active {
  background: linear-gradient(135deg, #bbdefb, #90caf9);
}

.toggle-btn {
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle.active .toggle-btn {
  transform: translateX(20px);
  background: #1976d2;
}

/* Input & Select */
input, select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 120px;
  transition: all 0.3s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #90caf9;
  box-shadow: 0 0 0 2px rgba(144, 202, 249, 0.2);
}

select {
  cursor: pointer;
  background: #ffffff;
}

/* Save Button */
.save-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.save-btn i {
  margin-right: 0.5rem;
}

/* Mobile */
@media (max-width: 480px) {
  .settings-container {
    margin: 0;
    padding: 1rem;
    border-radius: 0;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  input, select {
    width: 100%;
  }
}

/* Animation */
.setting-item {
  animation: slideIn 0.3s ease-out;
}

.setting-item:nth-child(1) { animation-delay: 0.1s; }
.setting-item:nth-child(2) { animation-delay: 0.2s; }
.setting-item:nth-child(3) { animation-delay: 0.3s; }
.setting-item:nth-child(4) { animation-delay: 0.4s; }
.setting-item:nth-child(5) { animation-delay: 0.5s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>