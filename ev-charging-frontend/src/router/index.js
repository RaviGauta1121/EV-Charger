//  router/indexedDB.js

import { createRouter, createWebHistory } from "vue-router";
import { authService } from "../services/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/register",
      name: "Register",
      component: () => import("../views/Register.vue"),
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("../views/Dashboard.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/chargers",
      name: "ChargerList",
      component: () => import("../views/ChargerList.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/map",
      name: "MapPage",
      component: () => import("../views/MapPage.vue"),
      meta: { requiresAuth: true },
    }, {
      path: "/profile",
      name: "profile",
      component: () => import("../components/Profile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/bookings",
      name: "bookings",
      component: () => import("../components/Bookings.vue"),
      meta: { requiresAuth: true },
    },

     {
      path: "/settings",
      name: "settings",
      component: () => import("../components/Settings.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  console.log(`Navigating from ${from.path} to ${to.path}`);
  
  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = authService.isAuthenticated();
  
  console.log('Auth required:', requiresAuth);
  console.log('User authenticated:', isAuthenticated);
  
  if (requiresAuth && !isAuthenticated) {
    console.log('Redirecting to login - user not authenticated');
    next("/login");
  } else if (
    (to.name === "Login" || to.name === "Register") &&
    isAuthenticated
  ) {
    console.log('Redirecting to dashboard - user already authenticated');
    next("/dashboard");
  } else {
    console.log('Navigation allowed');
    next();
  }
});

// Add error handling for failed route loads
router.onError((error) => {
  console.error('Router error:', error);
});

export default router;