// src/utils/authDebugger.js - Debug authentication issues
export const authDebugger = {
  // Check all authentication-related data
  checkAuthState() {
    console.log('🔍 AUTH DEBUGGER: Checking authentication state...');
    
    const results = {
      localStorage: this.checkLocalStorage(),
      tokens: this.checkTokens(),
      apiState: this.checkApiConfiguration(),
    };
    
    console.log('📊 AUTH DEBUGGER: Complete state check results:', results);
    return results;
  },
  
  // Check localStorage for auth data
  checkLocalStorage() {
    console.log('🔍 AUTH DEBUGGER: Checking localStorage...');
    
    const authKeys = ['token', 'authToken', 'accessToken', 'user', 'userInfo'];
    const storageData = {};
    
    authKeys.forEach(key => {
      const value = localStorage.getItem(key);
      storageData[key] = value ? {
        exists: true,
        length: value.length,
        preview: value.substring(0, 20) + (value.length > 20 ? '...' : '')
      } : { exists: false };
    });
    
    // Get all localStorage keys for complete picture
    const allKeys = Object.keys(localStorage);
    storageData.allKeys = allKeys;
    
    console.log('📊 AUTH DEBUGGER: localStorage data:', storageData);
    return storageData;
  },
  
  // Validate JWT tokens
  checkTokens() {
    console.log('🔍 AUTH DEBUGGER: Checking JWT tokens...');
    
    const tokenKeys = ['token', 'authToken', 'accessToken'];
    const tokenData = {};
    
    tokenKeys.forEach(key => {
      const token = localStorage.getItem(key);
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            
            tokenData[key] = {
              valid: true,
              payload: {
                userId: payload.userId || payload.id || payload.sub,
                email: payload.email,
                role: payload.role,
                iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
                exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
                isExpired: payload.exp ? payload.exp < now : null,
              }
            };
          } else {
            tokenData[key] = { valid: false, error: 'Invalid JWT format' };
          }
        } catch (error) {
          tokenData[key] = { valid: false, error: error.message };
        }
      } else {
        tokenData[key] = { exists: false };
      }
    });
    
    console.log('📊 AUTH DEBUGGER: Token data:', tokenData);
    return tokenData;
  },
  
  // Check API configuration
  checkApiConfiguration() {
    console.log('🔍 AUTH DEBUGGER: Checking API configuration...');
    
    const config = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
      environment: import.meta.env.NODE_ENV,
      environmentVars: {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        NODE_ENV: import.meta.env.NODE_ENV,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
      }
    };
    
    console.log('📊 AUTH DEBUGGER: API configuration:', config);
    return config;
  },
  
  // Test authentication flow
  async testAuthFlow() {
    console.log('🔍 AUTH DEBUGGER: Testing authentication flow...');
    
    try {
      // Import your API client
      const api = (await import('../services/api')).default;
      
      // Test a simple authenticated request
      const response = await api.get('/chargers', { params: { limit: 1 } });
      
      console.log('✅ AUTH DEBUGGER: Authentication test successful:', {
        status: response.status,
        hasData: !!response.data,
        dataType: typeof response.data,
      });
      
      return { success: true, response: response.data };
    } catch (error) {
      console.error('❌ AUTH DEBUGGER: Authentication test failed:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
      
      return { 
        success: false, 
        error: {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        }
      };
    }
  },
  
  // Clear all auth data
  clearAllAuthData() {
    console.log('🗑️ AUTH DEBUGGER: Clearing all authentication data...');
    
    const authKeys = ['token', 'authToken', 'accessToken', 'user', 'userInfo'];
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ AUTH DEBUGGER: All authentication data cleared');
  },
  
  // Set test token for debugging
  setTestToken(token) {
    console.log('🔧 AUTH DEBUGGER: Setting test token...');
    
    if (!token) {
      console.error('❌ AUTH DEBUGGER: No token provided');
      return false;
    }
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
    
    console.log('✅ AUTH DEBUGGER: Test token set successfully');
    return true;
  },
  
  // Generate debug report
  async generateDebugReport() {
    console.log('📋 AUTH DEBUGGER: Generating complete debug report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      authState: this.checkAuthState(),
      authFlow: await this.testAuthFlow(),
      userAgent: navigator.userAgent,
      currentURL: window.location.href,
    };
    
    console.log('📊 AUTH DEBUGGER: Complete debug report:', report);
    
    // Create downloadable report
    const reportText = JSON.stringify(report, null, 2);
    console.log('📄 AUTH DEBUGGER: Report text (copy this for support):', reportText);
    
    return report;
  }
};

// Make it globally available for debugging
if (typeof window !== 'undefined') {
  window.authDebugger = authDebugger;
}

export default authDebugger;