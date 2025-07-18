/**
 * Validates and sanitizes URLs to prevent XSS and redirect attacks
 */

// List of allowed protocols for URLs
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

// List of allowed domains for redirects (add your trusted domains here)
const ALLOWED_REDIRECT_DOMAINS = [
  'liquidlab.trade',
  'app.liquidlab.trade',
  'api.liquidlab.trade'
];

/**
 * Validates if a URL is safe to use for images or links
 * @param url - The URL to validate
 * @returns The validated URL or null if invalid
 */
export function validateImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    const parsedUrl = new URL(url);
    
    // Check if protocol is allowed
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      console.warn('Invalid URL protocol:', parsedUrl.protocol);
      return null;
    }
    
    // Additional check for data URLs or javascript
    if (url.toLowerCase().includes('javascript:') || 
        url.toLowerCase().includes('data:') ||
        url.toLowerCase().includes('vbscript:')) {
      console.warn('Potentially dangerous URL detected:', url);
      return null;
    }
    
    return url;
  } catch (error) {
    console.warn('Invalid URL:', url);
    return null;
  }
}

/**
 * Validates if a URL is safe for redirects
 * @param url - The URL to validate for redirect
 * @returns The validated URL or null if invalid
 */
export function validateRedirectUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    const parsedUrl = new URL(url);
    
    // Check if protocol is allowed
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      console.warn('Invalid redirect URL protocol:', parsedUrl.protocol);
      return null;
    }
    
    // Check if it's a relative URL (same origin)
    if (url.startsWith('/')) {
      return url;
    }
    
    // Check if the domain is in our allowed list
    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowedDomain = ALLOWED_REDIRECT_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowedDomain) {
      console.warn('Redirect to untrusted domain blocked:', hostname);
      return null;
    }
    
    return url;
  } catch (error) {
    console.warn('Invalid redirect URL:', url);
    return null;
  }
}

/**
 * Sanitizes a URL for safe use in href attributes
 * @param url - The URL to sanitize
 * @param fallback - Fallback URL if validation fails
 * @returns Safe URL or fallback
 */
export function sanitizeUrl(url: string | null | undefined, fallback: string = '#'): string {
  const validated = validateRedirectUrl(url);
  return validated || fallback;
}