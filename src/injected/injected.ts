// Injected script for Coursera automation extension
// This script runs in the context of the web page and can access page variables

(function() {
  'use strict';

  // Injected script functionality
  console.log('[Coursera Automation] Injected script loaded');

  // Function to extract page data that's not accessible from content script
  function extractPageData() {
    return {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString()
    };
  }

  // Listen for messages from content script
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    
    if (event.data.type === 'COURSERA_AUTOMATION_REQUEST') {
      const pageData = extractPageData();
      
      window.postMessage({
        type: 'COURSERA_AUTOMATION_RESPONSE',
        payload: pageData
      }, '*');
    }
  });

  // Notify that injected script is ready
  window.postMessage({
    type: 'COURSERA_AUTOMATION_INJECTED_READY'
  }, '*');
})();
