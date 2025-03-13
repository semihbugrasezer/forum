import { supabase } from "../core/services/supabase";

// Login attempt tracking
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS =
  parseInt(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export const loginWithEmail = async (email, password) => {
  try {
    // Check if user is locked out
    const attempts = loginAttempts.get(email) || {
      count: 0,
      timestamp: Date.now(),
    };
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      const timeDiff = Date.now() - attempts.timestamp;
      if (timeDiff < LOCKOUT_TIME) {
        throw new Error(
          `Too many login attempts. Please try again in ${Math.ceil(
            (LOCKOUT_TIME - timeDiff) / 60000
          )} minutes.`
        );
      }
      // Reset attempts after lockout period
      loginAttempts.delete(email);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Reset attempts on successful login
    loginAttempts.delete(email);
    return data;
  } catch (error) {
    // Increment failed attempts
    const attempts = loginAttempts.get(email) || {
      count: 0,
      timestamp: Date.now(),
    };
    loginAttempts.set(email, {
      count: attempts.count + 1,
      timestamp: Date.now(),
    });
    throw error;
  }
};

export const registerWithEmail = async (email, password, displayName) => {
  // Password strength validation
  const minLength = parseInt(process.env.REACT_APP_PASSWORD_MIN_LENGTH) || 8;
  if (password.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters long`);
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    throw new Error("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    throw new Error("Password must contain at least one number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Password must contain at least one special character");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  // Clear any stored session data
  sessionStorage.clear();
  localStorage.removeItem("lastActive");
};

// Session timeout handler
const SESSION_TIMEOUT =
  parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600000;

export const setupSessionTimeout = () => {
  const checkSession = () => {
    const lastActive = localStorage.getItem("lastActive");
    if (lastActive && Date.now() - parseInt(lastActive) > SESSION_TIMEOUT) {
      logout();
    }
  };

  // Update last active timestamp
  const updateLastActive = () => {
    localStorage.setItem("lastActive", Date.now().toString());
  };

  // Check session every minute
  setInterval(checkSession, 60000);

  // Update last active on user interaction
  ["mousedown", "keydown", "touchstart", "scroll"].forEach((event) => {
    document.addEventListener(event, updateLastActive);
  });

  // Initial update
  updateLastActive();
};

// CSRF Token management
export const generateCSRFToken = () => {
  const token = Math.random().toString(36).substring(2);
  sessionStorage.setItem("csrfToken", token);
  return token;
};

export const validateCSRFToken = (token) => {
  return token === sessionStorage.getItem("csrfToken");
};
