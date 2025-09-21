/**
 * Secure storage utility for handling sensitive data like authentication tokens
 * Uses encryption and secure storage practices
 */

// Simple encryption/decryption using base64 and XOR cipher
// Note: For production, consider using a more robust encryption library like crypto-js
class SecureStorage {
  constructor() {
    // Generate a simple key based on browser fingerprint
    this.key = this.generateKey();
  }

  // Generate a simple encryption key
  generateKey() {
    const userAgent = navigator.userAgent;
    const screenInfo = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fingerprint = userAgent + screenInfo + timezone;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Simple XOR encryption
  encrypt(text) {
    if (!text) return "";

    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyChar = this.key.charCodeAt(i % this.key.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    return btoa(result); // Base64 encode
  }

  // Simple XOR decryption
  decrypt(encryptedText) {
    if (!encryptedText) return "";

    try {
      const decoded = atob(encryptedText); // Base64 decode
      let result = "";
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i);
        const keyChar = this.key.charCodeAt(i % this.key.length);
        result += String.fromCharCode(charCode ^ keyChar);
      }
      return result;
    } catch (error) {
      return "";
    }
  }

  // Store encrypted data
  setItem(key, value) {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);
      const encrypted = this.encrypt(stringValue);
      localStorage.setItem(`secure_${key}`, encrypted);

      // Set expiration time (24 hours for tokens)
      const expiration = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(`secure_${key}_exp`, expiration.toString());
    } catch (error) {
      // Silently handle storage errors
    }
  }

  // Retrieve and decrypt data
  getItem(key) {
    try {
      // Check expiration
      const expiration = localStorage.getItem(`secure_${key}_exp`);
      if (expiration && Date.now() > parseInt(expiration)) {
        this.removeItem(key);
        return null;
      }

      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;

      const decrypted = this.decrypt(encrypted);

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      return null;
    }
  }

  // Remove data
  removeItem(key) {
    localStorage.removeItem(`secure_${key}`);
    localStorage.removeItem(`secure_${key}_exp`);
  }

  // Clear all secure data
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("secure_")) {
        localStorage.removeItem(key);
      }
    });
  }

  // Check if token is expired
  isTokenExpired(key) {
    const expiration = localStorage.getItem(`secure_${key}_exp`);
    return expiration ? Date.now() > parseInt(expiration) : true;
  }
}

// Create singleton instance
const secureStorage = new SecureStorage();

// Token-specific methods
export const tokenStorage = {
  setToken: (token) => secureStorage.setItem("auth_token", token),
  getToken: () => secureStorage.getItem("auth_token"),
  removeToken: () => secureStorage.removeItem("auth_token"),
  isTokenExpired: () => secureStorage.isTokenExpired("auth_token"),

  setUser: (user) => secureStorage.setItem("user_data", user),
  getUser: () => secureStorage.getItem("user_data"),
  removeUser: () => secureStorage.removeItem("user_data"),

  clearAll: () => secureStorage.clear(),
};

export default secureStorage;
