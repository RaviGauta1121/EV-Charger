// src/services/api.js - Vue.js version with enhanced token management
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

console.log('🔧 Vue API Client: Base URL:', API_BASE_URL);

// Token management utilities for Vue
export const tokenManager = {
  setToken(token) {
    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("token", token); // Keep both for compatibility
      console.log('✅ Vue Token Manager: Token stored successfully');
    }
  },
  
  getToken() {
    // Check multiple possible token keys
    const authToken = localStorage.getItem("authToken");
    const token = localStorage.getItem("token");
    const accessToken = localStorage.getItem("accessToken");
    
    const finalToken = authToken || token || accessToken;
    console.log('🔍 Vue Token Manager: Token check:', {
      authToken: authToken ? 'EXISTS' : 'NOT FOUND',
      token: token ? 'EXISTS' : 'NOT FOUND',
      accessToken: accessToken ? 'EXISTS' : 'NOT FOUND',
      finalToken: finalToken ? 'EXISTS' : 'NOT FOUND'
    });
    return finalToken;
  },
  
  clearToken() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    console.log('🗑️ Vue Token Manager: All tokens cleared');
  },
  
  isAuthenticated() {
    const token = this.getToken();
    if (!token) {
      console.log('❌ Vue Token Manager: No token found');
      return false;
    }
    
    try {
      // Basic JWT validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        console.log('⏰ Vue Token Manager: Token is expired');
        this.clearToken();
        return false;
      }
      
      console.log('✅ Vue Token Manager: Token is valid');
      return true;
    } catch (error) {
      console.error('❌ Vue Token Manager: Invalid token format:', error);
      this.clearToken();
      return false;
    }
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🔍 VUE API INTERCEPTOR: Running request interceptor');
    console.log('🔍 VUE API INTERCEPTOR: Request details:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL
    });
    
    const token = tokenManager.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ VUE API INTERCEPTOR: Added Authorization header');
      console.log('🔑 VUE API INTERCEPTOR: Token preview:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ VUE API INTERCEPTOR: No token found in localStorage');
      console.log('🔍 VUE API INTERCEPTOR: Available localStorage keys:', Object.keys(localStorage));
    }
    
    // Log final headers (excluding sensitive data)
    const headersToLog = { ...config.headers };
    if (headersToLog.Authorization) {
      headersToLog.Authorization = 'Bearer [REDACTED]';
    }
    console.log('📤 VUE API INTERCEPTOR: Final headers:', headersToLog);
    
    return config;
  },
  (error) => {
    console.error('❌ VUE API INTERCEPTOR: Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 VUE API INTERCEPTOR: Response received:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    const errorDetails = {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      data: error.response?.data
    };
    
    console.error('❌ VUE API INTERCEPTOR: Response error:', errorDetails);
    
    if (error.response?.status === 401) {
      console.log('🔒 VUE API INTERCEPTOR: 401 Unauthorized - clearing tokens');
      tokenManager.clearToken();
      
      // Vue router navigation (adjust path as needed)
      if (window.location.pathname !== '/login') {
        console.log('🔄 VUE API INTERCEPTOR: Redirecting to login');
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;