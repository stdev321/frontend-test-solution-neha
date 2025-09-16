/**
 * Quick Manual Testing Utilities
 * Copy and paste these into browser console for immediate testing
 */

// Test 1: Simple Token Test
window.testTokens = async () => {
  console.log('🧪 Testing Token Availability...');
  
  if (!window.tokenManager) {
    console.error('❌ TokenManager not found. Check if imports are working.');
    return;
  }
  
  try {
    const token = await window.tokenManager.getValidToken();
    console.log('✅ Token obtained:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('📊 Token info:', window.tokenManager.getTokenInfo());
  } catch (error) {
    console.error('❌ Token test failed:', error.message);
  }
};

// Test 2: API Call Test
window.testAPICalls = async () => {
  console.log('🧪 Testing API Calls with Race Condition Fix...');
  
  try {
    // Clear any cached tokens to simulate race condition
    if (window.tokenManager) {
      window.tokenManager.clearToken();
    }
    
    // Make a simple API call that requires auth
    const response = await fetch('/api/profile/me');
    console.log('📡 API Response status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ API call successful - race condition avoided!');
    } else if (response.status === 401) {
      console.log('❌ Got 401 - race condition still exists');
    } else {
      console.log(`ℹ️  Got ${response.status} - check if you're logged in`);
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
};

// Test 3: Auth State Check
window.checkAuthState = () => {
  console.log('🧪 Checking Authentication State...');
  
  const authState = {
    tokenManagerAvailable: !!window.tokenManager,
    currentUser: !!window.authContext?.currentUser,
    userProfile: !!window.authContext?.userProfile,
    loading: window.authContext?.loading,
    profileLoading: window.authContext?.profileLoading
  };
  
  console.log('📊 Auth State:', authState);
  
  if (authState.currentUser && authState.userProfile && !authState.loading && !authState.profileLoading) {
    console.log('✅ Fully authenticated - navigation should work');
  } else {
    const waiting = [];
    if (!authState.currentUser) waiting.push('currentUser');
    if (!authState.userProfile) waiting.push('userProfile'); 
    if (authState.loading) waiting.push('auth loading');
    if (authState.profileLoading) waiting.push('profile loading');
    console.log(`⏳ Waiting for: ${waiting.join(', ')}`);
  }
  
  return authState;
};

console.log('🛠️ Quick test utilities loaded!');
console.log('📝 Available commands:');
console.log('  window.testTokens()     - Test token availability');
console.log('  window.testAPICalls()   - Test API calls with race condition fix');
console.log('  window.checkAuthState() - Check current authentication state');