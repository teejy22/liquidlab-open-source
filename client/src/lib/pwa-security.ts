// PWA Security utilities to prevent data leakage

/**
 * Clear all service worker caches on logout
 * This prevents sensitive data from being accessible after logout
 */
export function clearPWACachesOnLogout() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // Send message to service worker to clear all caches
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE'
    });
    
    // Also dispatch custom event for PWAInstaller listener
    window.dispatchEvent(new Event('user-logout'));
  }
  
  // Clear all client-side storage as well
  try {
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear specific localStorage items (preserve non-sensitive settings)
    const keysToPreserve = ['theme', 'language', 'dismissed-install-prompt'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear IndexedDB if used
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      }).catch(() => {
        // Silently fail if IndexedDB is not accessible
      });
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

/**
 * Check if PWA is installed and running in standalone mode
 */
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         // @ts-ignore - navigator.standalone is iOS specific
         (window.navigator as any).standalone === true;
}

/**
 * Security check for service worker updates
 * Forces update if a security patch is available
 */
export async function checkForSecurityUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      // Check for updates
      await registration.update();
      
      // If update is available and it's a security update, force activation
      if (registration.waiting) {
        // In production, you might check a version header to determine if it's a security update
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }
}