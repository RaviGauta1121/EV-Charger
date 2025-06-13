<!-- src/App.vue -->
<template>
  <div id="app">
    <Navbar v-if="isAuthenticated" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from './store'
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  },
  setup() {
    const authStore = useAuthStore()
    
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    
    return {
      isAuthenticated
    }
  }
}
</script>

<style>
.main-content {
  padding-top: 70px;
}
</style>