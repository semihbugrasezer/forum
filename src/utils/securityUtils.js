/**
 * Security utility functions
 * This file provides security functions used throughout the application
 */

/**
 * Sanitizes user input against XSS attacks
 * @param {string} input - User input to sanitize
 * @return {string} Sanitized text
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.replace(/<[^>]*>/g, "");
};

/**
 * Creates a safe string for Supabase queries
 * @param {string} query - Query text
 * @return {string} Safe query text
 */
export const sanitizeSupabaseQuery = (query) => {
  if (!query) return "";
  return sanitizeInput(String(query).trim());
};

/**
 * Safely sanitizes HTML content
 * @param {string} html - HTML content to sanitize
 * @return {string} Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== "string") return "";

  // Remove dangerous script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/on\w+='[^']*'/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "data-safe:");
};

/**
 * Checks user permissions based on role
 * @param {string} userRole - User role
 * @param {Array} allowedRoles - Array of allowed roles
 * @return {boolean} Whether user has permission
 */
export const hasPermission = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles || !Array.isArray(allowedRoles)) {
    return false;
  }

  return allowedRoles.includes(userRole);
};

/**
 * Validates Supabase session expiry
 * @param {Object} session - Supabase session object
 * @return {boolean} Whether session is valid
 */
export const validateSessionExpiry = (session) => {
  if (!session || !session.expires_at) {
    return false;
  }

  const expirationTime = new Date(session.expires_at).getTime();
  const currentTime = Date.now();

  return expirationTime > currentTime;
};

/**
 * Applies rate limiting to a function
 * @param {Function} fn Function to rate limit
 * @param {number} delay Limit duration in milliseconds
 * @returns {Function} Rate limited function
 */
export const rateLimit = (fn, delay) => {
  let lastRun = 0;
  let timeout;

  return function (...args) {
    const now = Date.now();

    if (lastRun && now - lastRun < delay) {
      clearTimeout(timeout);
      return new Promise((resolve) => {
        timeout = setTimeout(() => {
          lastRun = now;
          resolve(fn.apply(this, args));
        }, delay);
      });
    }

    lastRun = now;
    return fn.apply(this, args);
  };
};

/**
 * Evaluates password strength
 * @param {string} password - Password to evaluate
 * @return {Object} Password strength evaluation
 */
export const evaluatePasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: "Password cannot be empty" };

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length < 8) {
    feedback.push("Password must be at least 8 characters long");
  } else {
    score += 1;
  }

  // Character variety
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Password complexity
  if (score < 3) {
    feedback.push(
      "Password must contain uppercase, lowercase, numbers, and special characters"
    );
  }

  return {
    score: score, // Score between 0-5
    isStrong: score >= 4,
    feedback: feedback.join(". "),
  };
};

/**
 * Masks API keys for logging
 * @param {string} key - Key to mask
 * @return {string} Masked key
 */
export const maskApiKey = (key) => {
  if (!key || typeof key !== "string") return "";

  // Show first 4 and last 4 characters, mask the rest
  const length = key.length;
  if (length <= 8) return "****";

  return `${key.substring(0, 4)}${"*".repeat(length - 8)}${key.substring(
    length - 4
  )}`;
};

/**
 * Generates Content Security Policy
 * @returns {string} CSP rules
 */
export const generateCSP = () => {
  return (
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://*.googleusercontent.com https://www.google-analytics.com https://*.stripe.com https://www.googletagmanager.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://www.google-analytics.com https://*.stripe.com https://www.googletagmanager.com; " +
    "frame-src 'self' https://*.supabase.co https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "worker-src 'self' blob:; " +
    "child-src 'self' blob:; " +
    "manifest-src 'self';"
  );
};

/**
 * Securely stores user session information
 * @param {Object} session - Session information to store
 */
export const secureSessionStorage = {
  setItem: (key, value) => {
    try {
      // Remove sensitive information (e.g., tokens)
      const safeValue = { ...value };
      if (safeValue.access_token)
        safeValue.access_token = maskApiKey(safeValue.access_token);
      if (safeValue.refresh_token)
        safeValue.refresh_token = maskApiKey(safeValue.refresh_token);

      sessionStorage.setItem(sanitizeInput(key), JSON.stringify(safeValue));
    } catch (error) {
      console.error(
        "Session storage error:",
        sanitizeInput(error.message || "")
      );
    }
  },

  getItem: (key) => {
    try {
      const item = sessionStorage.getItem(sanitizeInput(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(
        "Session retrieval error:",
        sanitizeInput(error.message || "")
      );
      return null;
    }
  },

  removeItem: (key) => {
    try {
      sessionStorage.removeItem(sanitizeInput(key));
    } catch (error) {
      console.error(
        "Session removal error:",
        sanitizeInput(error.message || "")
      );
    }
  },
};
