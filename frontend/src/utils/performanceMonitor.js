/**
 * Client-side Performance Monitor
 * Tracks real user metrics (RUM) in production
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      resources: [],
      vitals: {}
    };
    
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    // Measure page load performance
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.measurePageLoad();
          this.measureResources();
          this.measureWebVitals();
        }, 0);
      });
    }

    // Track route changes for SPAs
    this.trackRouteChanges();
  }

  measurePageLoad() {
    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    this.metrics.pageLoad = {
      // Time to first byte
      TTFB: timing.responseStart - navigationStart,
      
      // DOM Content Loaded
      domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
      
      // Full page load
      pageLoadTime: timing.loadEventEnd - navigationStart,
      
      // DNS lookup
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      
      // TCP connection
      tcpConnect: timing.connectEnd - timing.connectStart,
      
      // Request time
      requestTime: timing.responseEnd - timing.requestStart,
      
      // DOM processing
      domProcessing: timing.domComplete - timing.domLoading,
      
      // Resource loading
      resourceLoadTime: timing.loadEventEnd - timing.responseEnd
    };

    console.log('📊 Page Load Metrics:', this.metrics.pageLoad);
    this.sendToAnalytics('pageLoad', this.metrics.pageLoad);
  }

  measureResources() {
    const resources = window.performance.getEntriesByType('resource');
    
    // Group resources by type
    const resourcesByType = {};
    
    resources.forEach(resource => {
      const type = this.getResourceType(resource.name);
      
      if (!resourcesByType[type]) {
        resourcesByType[type] = {
          count: 0,
          totalSize: 0,
          totalDuration: 0,
          slowest: { duration: 0, name: '' }
        };
      }
      
      resourcesByType[type].count++;
      resourcesByType[type].totalDuration += resource.duration;
      
      // Track transferSize if available
      if (resource.transferSize) {
        resourcesByType[type].totalSize += resource.transferSize;
      }
      
      // Track slowest resource
      if (resource.duration > resourcesByType[type].slowest.duration) {
        resourcesByType[type].slowest = {
          duration: resource.duration,
          name: resource.name
        };
      }
    });

    this.metrics.resources = resourcesByType;
    
    // Find largest images
    const images = resources.filter(r => this.getResourceType(r.name) === 'image');
    const largestImages = images
      .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
      .slice(0, 5)
      .map(img => ({
        url: img.name,
        size: this.formatBytes(img.transferSize || 0),
        duration: Math.round(img.duration) + 'ms'
      }));

    if (largestImages.length > 0) {
      console.log('🖼️ Largest Images:', largestImages);
    }

    console.log('📦 Resources by Type:', resourcesByType);
    this.sendToAnalytics('resources', resourcesByType);
  }

  measureWebVitals() {
    // Largest Contentful Paint (LCP)
    if (window.PerformanceObserver) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.vitals.LCP = Math.round(lastEntry.renderTime || lastEntry.loadTime);
          console.log('🎨 LCP:', this.metrics.vitals.LCP + 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.vitals.FID = Math.round(entry.processingStart - entry.startTime);
            console.log('⚡ FID:', this.metrics.vitals.FID + 'ms');
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.metrics.vitals.CLS = Math.round(clsValue * 1000) / 1000;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    }

    // First Contentful Paint (FCP)
    if (window.performance && window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.vitals.FCP = Math.round(entry.startTime);
          console.log('🎨 FCP:', this.metrics.vitals.FCP + 'ms');
        }
      });
    }
  }

  trackRouteChanges() {
    // Track client-side route changes
    let lastPath = window.location.pathname;
    
    const checkForRouteChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        
        // Measure route change performance
        const routeChangeStart = performance.now();
        
        requestAnimationFrame(() => {
          const routeChangeEnd = performance.now();
          const routeChangeDuration = Math.round(routeChangeEnd - routeChangeStart);
          
          console.log(`🔄 Route change to ${currentPath}: ${routeChangeDuration}ms`);
          this.sendToAnalytics('routeChange', {
            path: currentPath,
            duration: routeChangeDuration
          });
        });
      }
    };
    
    // Check for route changes periodically
    setInterval(checkForRouteChange, 100);
  }

  getResourceType(url) {
    const extension = url.split('.').pop().split('?')[0].toLowerCase();
    const typeMap = {
      'js': 'script',
      'css': 'stylesheet',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'svg': 'image',
      'webp': 'image',
      'woff': 'font',
      'woff2': 'font',
      'ttf': 'font',
      'json': 'fetch'
    };
    return typeMap[extension] || 'other';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  sendToAnalytics(eventType, data) {
    // Store in localStorage for debugging
    const stored = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
    stored.push({
      timestamp: new Date().toISOString(),
      type: eventType,
      data: data,
      url: window.location.href
    });
    
    // Keep only last 20 entries
    if (stored.length > 20) {
      stored.shift();
    }
    
    localStorage.setItem('performanceMetrics', JSON.stringify(stored));
    
    // In production, you would send this to your analytics service
    // Example: fetch('/api/analytics/performance', { method: 'POST', body: JSON.stringify(data) })
  }

  // Public method to get current metrics
  getMetrics() {
    return this.metrics;
  }

  // Public method to log metrics to console
  logMetrics() {
    console.group('🚀 Performance Metrics');
    console.log('Page Load:', this.metrics.pageLoad);
    console.log('Resources:', this.metrics.resources);
    console.log('Web Vitals:', this.metrics.vitals);
    console.log('Stored Metrics:', JSON.parse(localStorage.getItem('performanceMetrics') || '[]'));
    console.groupEnd();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export for use in React components
export default performanceMonitor;

// Add global access for debugging
if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
}