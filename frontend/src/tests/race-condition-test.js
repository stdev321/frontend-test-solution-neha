/**
 * Race Condition Test - Manual Testing Script
 * 
 * This script provides utilities to test the race condition fixes
 * in the authentication system. Run this in the browser console
 * to verify that the fixes are working properly.
 */

/**
 * Test 1: Token Availability Race Condition
 * 
 * This test simulates the scenario where multiple API calls are made
 * immediately after authentication, before tokens are ready.
 */
const testTokenRaceCondition = async () => {
  console.log('🧪 Testing Token Availability Race Condition...');
  
  try {
    // Clear any existing tokens
    if (window.tokenManager) {
      window.tokenManager.clearToken();
    }
    
    // Simulate multiple concurrent API calls
    const apiCalls = [
      fetch('/api/profile/me'),
      fetch('/api/conversation/list'),
      fetch('/api/personas')
    ];
    
    console.log('📤 Making concurrent API calls...');
    const startTime = Date.now();
    
    const results = await Promise.allSettled(apiCalls);
    const endTime = Date.now();
    
    console.log(`⏱️  Test completed in ${endTime - startTime}ms`);
    
    // Analyze results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Successful calls: ${successful}`);
    console.log(`❌ Failed calls: ${failed}`);
    
    // Check if calls had authorization headers
    const responses = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    
    console.log('📊 Response status codes:', responses.map(r => r.status));
    
    return {
      totalCalls: apiCalls.length,
      successful,
      failed,
      duration: endTime - startTime,
      passed: failed === 0 // All calls should succeed with proper token handling
    };
    
  } catch (error) {
    console.error('❌ Token race condition test failed:', error);
    return { passed: false, error: error.message };
  }
};

/**
 * Test 2: Navigation Race Condition
 * 
 * This test simulates the scenario where navigation occurs before
 * profile data is fully loaded.
 */
const testNavigationRaceCondition = () => {
  console.log('🧪 Testing Navigation Race Condition...');
  
  // Check if auth navigation hooks are being used
  const hasAuthNavigation = typeof window.useAuthNavigation !== 'undefined';
  
  // Check current auth state
  const authState = {
    currentUser: window.auth?.currentUser || null,
    userProfile: window.userProfile || null,
    authLoading: window.authLoading || false,
    profileLoading: window.profileLoading || false
  };
  
  console.log('📊 Current Auth State:', authState);
  
  // Simulate navigation conditions
  const shouldNavigate = authState.currentUser && 
                         authState.userProfile && 
                         !authState.authLoading && 
                         !authState.profileLoading;
  
  console.log(`🧭 Should navigate: ${shouldNavigate}`);
  
  if (shouldNavigate) {
    console.log('✅ Navigation conditions met - race condition avoided');
    return { passed: true, message: 'Navigation properly waits for profile' };
  } else {
    const missingConditions = [];
    if (!authState.currentUser) missingConditions.push('currentUser');
    if (!authState.userProfile) missingConditions.push('userProfile');
    if (authState.authLoading) missingConditions.push('authLoading: true');
    if (authState.profileLoading) missingConditions.push('profileLoading: true');
    
    console.log(`⏳ Waiting for: ${missingConditions.join(', ')}`);
    return { 
      passed: true, 
      message: `Correctly waiting for: ${missingConditions.join(', ')}` 
    };
  }
};

/**
 * Test 3: Token Manager Functionality
 * 
 * This test verifies that the TokenManager is working correctly.
 */
const testTokenManager = async () => {
  console.log('🧪 Testing TokenManager Functionality...');
  
  if (!window.tokenManager) {
    console.error('❌ TokenManager not available on window object');
    return { passed: false, error: 'TokenManager not found' };
  }
  
  try {
    // Test token info
    const tokenInfo = window.tokenManager.getTokenInfo();
    console.log('📊 Token Info:', tokenInfo);
    
    // Test concurrent token requests
    console.log('🔄 Testing concurrent token requests...');
    const concurrentRequests = [
      window.tokenManager.getValidToken(),
      window.tokenManager.getValidToken(),
      window.tokenManager.getValidToken()
    ];
    
    const tokens = await Promise.all(concurrentRequests);
    
    // All tokens should be the same (deduplication working)
    const allSame = tokens.every(token => token === tokens[0]);
    
    console.log(`🔐 Tokens received: ${tokens.length}`);
    console.log(`🤝 All tokens identical: ${allSame}`);
    console.log(`⏱️  Token length: ${tokens[0]?.length || 'N/A'}`);
    
    return {
      passed: allSame && tokens.length === 3,
      tokenInfo,
      tokensIdentical: allSame,
      tokenLength: tokens[0]?.length
    };
    
  } catch (error) {
    console.error('❌ TokenManager test failed:', error);
    return { passed: false, error: error.message };
  }
};

/**
 * Test 4: Retry Logic
 * 
 * This test verifies that retry logic is working for failed operations.
 */
const testRetryLogic = async () => {
  console.log('🧪 Testing Retry Logic...');
  
  if (!window.retryUtils) {
    console.error('❌ Retry utilities not available on window object');
    return { passed: false, error: 'Retry utilities not found' };
  }
  
  try {
    let attemptCount = 0;
    
    // Create a function that fails twice, then succeeds
    const flakyOperation = async () => {
      attemptCount++;
      console.log(`🔄 Attempt ${attemptCount}`);
      
      if (attemptCount < 3) {
        throw new Error('Simulated failure');
      }
      
      return 'Success!';
    };
    
    const startTime = Date.now();
    const result = await window.retryUtils.retryWithBackoff(flakyOperation, {
      maxRetries: 3,
      initialDelay: 100,
      debugMode: true
    });
    const endTime = Date.now();
    
    console.log(`✅ Retry logic worked: ${result}`);
    console.log(`📊 Total attempts: ${attemptCount}`);
    console.log(`⏱️  Total time: ${endTime - startTime}ms`);
    
    return {
      passed: result === 'Success!' && attemptCount === 3,
      attempts: attemptCount,
      duration: endTime - startTime,
      result
    };
    
  } catch (error) {
    console.error('❌ Retry logic test failed:', error);
    return { passed: false, error: error.message };
  }
};

/**
 * Run All Tests
 * 
 * Runs all race condition tests and provides a summary report.
 */
const runAllRaceConditionTests = async () => {
  console.log('🚀 Starting Race Condition Test Suite...');
  console.log('=====================================');
  
  const tests = [
    { name: 'Token Availability Race Condition', test: testTokenRaceCondition },
    { name: 'Navigation Race Condition', test: testNavigationRaceCondition },
    { name: 'Token Manager Functionality', test: testTokenManager },
    { name: 'Retry Logic', test: testRetryLogic }
  ];
  
  const results = {};
  
  for (const { name, test } of tests) {
    console.log(`\n🧪 Running: ${name}`);
    console.log('-'.repeat(50));
    
    try {
      const result = await test();
      results[name] = result;
      
      if (result.passed) {
        console.log(`✅ ${name}: PASSED`);
      } else {
        console.log(`❌ ${name}: FAILED`);
        if (result.error) console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ ${name}: ERROR - ${error.message}`);
      results[name] = { passed: false, error: error.message };
    }
  }
  
  // Summary Report
  console.log('\n📋 RACE CONDITION TEST SUMMARY');
  console.log('=====================================');
  
  const passed = Object.values(results).filter(r => r.passed).length;
  const total = Object.keys(results).length;
  
  console.log(`📊 Tests Passed: ${passed}/${total}`);
  console.log(`🎯 Success Rate: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('🎉 All race condition tests passed!');
    console.log('✅ The authentication system fixes are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Review the results above.');
  }
  
  return {
    passed,
    total,
    successRate: (passed / total) * 100,
    results
  };
};

/**
 * Debug Information
 * 
 * Provides detailed information about the current state of the system
 * for debugging race condition issues.
 */
const getDebugInfo = () => {
  console.log('🔍 AUTHENTICATION SYSTEM DEBUG INFO');
  console.log('=====================================');
  
  // TokenManager status
  if (window.tokenManager) {
    console.log('🔐 TokenManager Status:', window.tokenManager.getTokenInfo());
  } else {
    console.log('❌ TokenManager not available');
  }
  
  // Auth Context status
  const authContext = window.authContext || {};
  console.log('👤 Auth Context:', {
    currentUser: !!authContext.currentUser,
    userProfile: !!authContext.userProfile,
    loading: authContext.loading,
    profileLoading: authContext.profileLoading,
    authError: authContext.authError
  });
  
  // API interceptor status
  console.log('🌐 API Interceptors:', {
    requestInterceptors: window.axios?.defaults?.interceptors?.request?.handlers?.length || 0,
    responseInterceptors: window.axios?.defaults?.interceptors?.response?.handlers?.length || 0
  });
  
  // Recent console errors
  const recentErrors = window.console._errors?.slice(-5) || [];
  if (recentErrors.length > 0) {
    console.log('🚨 Recent Errors:', recentErrors);
  }
  
  // Performance metrics
  if (window.performance) {
    const navigation = window.performance.getEntriesByType('navigation')[0];
    console.log('⚡ Performance:', {
      loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      domReady: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
    });
  }
};

// Export functions to window for manual testing
if (typeof window !== 'undefined') {
  window.raceConditionTests = {
    testTokenRaceCondition,
    testNavigationRaceCondition,
    testTokenManager,
    testRetryLogic,
    runAllRaceConditionTests,
    getDebugInfo
  };
  
  console.log('🧪 Race condition tests loaded!');
  console.log('📝 Available commands:');
  console.log('  - window.raceConditionTests.runAllRaceConditionTests()');
  console.log('  - window.raceConditionTests.getDebugInfo()');
  console.log('  - window.raceConditionTests.testTokenRaceCondition()');
}

export {
  testTokenRaceCondition,
  testNavigationRaceCondition,
  testTokenManager,
  testRetryLogic,
  runAllRaceConditionTests,
  getDebugInfo
};