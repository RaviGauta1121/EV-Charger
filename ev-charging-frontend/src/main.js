// import { createApp } from "vue";
// import { createPinia } from "pinia";
// import Toast from "vue-toastification";
// import "vue-toastification/dist/index.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import "leaflet/dist/leaflet.css";

// import App from "./App.vue";
// import router from "./router";
// import "./assets/styles/main.css";

// const app = createApp(App);

// // Pinia store
// app.use(createPinia());

// // Vue Router
// app.use(router);

// // Toast configuration
// app.use(Toast, {
//   // Transition options
//   transition: "Vue-Toastification__bounce",

//   // Toast limits
//   maxToasts: 5,
//   newestOnTop: true,

//   // Default position
//   position: "top-right",

//   // Timeout settings
//   timeout: 4000,
//   closeOnClick: true,
//   pauseOnFocusLoss: true,
//   pauseOnHover: true,

//   // Drag settings
//   draggable: true,
//   draggablePercent: 0.6,

//   // Progress bar
//   hideProgressBar: false,

//   // Close button
//   showCloseButtonOnHover: false,
//   closeButton: "button",

//   // Icons
//   icon: true,

//   // RTL support
//   rtl: false,

//   // Container options
//   container: document.body,

//   // Toast classes
//   toastClassName: "custom-toast",

//   // Default toast options for different types
//   toastDefaults: {
//     success: {
//       timeout: 3000,
//       hideProgressBar: false,
//       icon: true,
//     },
//     error: {
//       timeout: 6000,
//       hideProgressBar: false,
//       icon: true,
//     },
//     info: {
//       timeout: 4000,
//       hideProgressBar: true,
//       icon: true,
//     },
//     warning: {
//       timeout: 5000,
//       hideProgressBar: false,
//       icon: true,
//     },
//   },
// });

// // Global error handler
// app.config.errorHandler = (error, instance, info) => {
//   console.error("Global error:", error);
//   console.error("Component instance:", instance);
//   console.error("Error info:", info);

//   // Show user-friendly error message
//   const toast = app.config.globalProperties.$toast;
//   if (toast) {
//     toast.error("An unexpected error occurred. Please try again.");
//   }
// };

// // Performance monitoring
// app.config.performance = true;

// // Development warnings
// if (process.env.NODE_ENV === "development") {
//   app.config.warnHandler = (msg, instance, trace) => {
//     console.warn("Vue warning:", msg);
//     console.warn("Component trace:", trace);
//   };
// }

// app.mount("#app");



import { createApp } from "vue";
import { createPinia } from "pinia";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "leaflet/dist/leaflet.css";

import App from "./App.vue";
import router from "./router";
import "./assets/styles/main.css";

const app = createApp(App);

// Pinia store
app.use(createPinia());

// Vue Router
app.use(router);

// Toast configuration
app.use(Toast, {
  // Transition options
  transition: "Vue-Toastification__bounce",

  // Toast limits
  maxToasts: 5,
  newestOnTop: true,

  // Default position
  position: "top-right",

  // Timeout settings
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,

  // Drag settings
  draggable: true,
  draggablePercent: 0.6,

  // Progress bar
  hideProgressBar: false,

  // Close button
  showCloseButtonOnHover: false,
  closeButton: "button",

  // Icons
  icon: true,

  // RTL support
  rtl: false,

  // Container options
  container: document.body,

  // Toast classes
  toastClassName: "custom-toast",

  // Default toast options for different types
  toastDefaults: {
    success: {
      timeout: 3000,
      hideProgressBar: false,
      icon: true,
    },
    error: {
      timeout: 6000,
      hideProgressBar: false,
      icon: true,
    },
    info: {
      timeout: 4000,
      hideProgressBar: true,
      icon: true,
    },
    warning: {
      timeout: 5000,
      hideProgressBar: false,
      icon: true,
    },
  },
});

// Global error handler
app.config.errorHandler = (error, instance, info) => {
  console.error("Global error:", error);
  console.error("Component instance:", instance);
  console.error("Error info:", info);

  // Show user-friendly error message
  const toast = app.config.globalProperties.$toast;
  if (toast) {
    toast.error("An unexpected error occurred. Please try again.");
  }
};

// Performance monitoring
app.config.performance = true;

// Development warnings
if (process.env.NODE_ENV === "development") {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn("Vue warning:", msg);
    console.warn("Component trace:", trace);
  };
}

// 🌐 Wake up backend before mounting the app
console.log("🔄 Waking up backend server...");

const wakeUpBackend = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch("https://ev-charger-8rud.onrender.com/health", {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Backend awake:", data.message);
    console.log("📊 Backend info:", {
      status: data.success,
      environment: data.environment,
      timestamp: data.timestamp
    });
    
    return true;
  } catch (error) {
    console.error("❌ Failed to wake up backend:", error.message);
    
    // Check specific error types
    if (error.name === 'AbortError') {
      console.warn("⏰ Backend wake-up timed out");
    } else if (error.message.includes('Failed to fetch')) {
      console.warn("🚫 CORS or network error detected");
    }
    
    return false;
  }
};

// Wake up backend and then mount app
wakeUpBackend().then((success) => {
  if (success) {
    console.log("🚀 Mounting Vue app with backend ready");
  } else {
    console.warn("⚠️ Mounting Vue app without backend confirmation");
  }
  
  // Mount the app regardless of backend status
  app.mount("#app");
}).catch((error) => {
  console.error("💥 Unexpected error during backend wake-up:", error);
  console.warn("🔄 Mounting Vue app anyway...");
  app.mount("#app");
});

// Add global properties for debugging
app.config.globalProperties.$backendUrl = "https://ev-charger-8rud.onrender.com";
app.config.globalProperties.$frontendUrl = "https://ev-charger-ybd8.vercel.app";