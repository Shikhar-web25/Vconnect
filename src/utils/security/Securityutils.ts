/**
 * Security Utilities for React Native App
 * 
 * This file contains helper functions for implementing security features
 * throughout the application.
 */

import { Alert, Platform } from 'react-native';

/**
 * Security Configuration
 */
export const SecurityConfig = {
  // Encryption settings
  ENCRYPTION_ENABLED: true,
  ENCRYPTION_ALGORITHM: 'AES-256',
  
  // Session settings
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Biometric settings
  BIOMETRIC_ENABLED: true,
  FALLBACK_TO_PASSCODE: true,
  
  // 2FA settings
  TWO_FACTOR_REQUIRED: false,
  TWO_FACTOR_METHOD: 'SMS', // SMS, EMAIL, or AUTHENTICATOR
};

/**
 * Check if device is rooted/jailbroken
 * Note: Requires react-native-device-info package
 */
export const isDeviceSecure = async (): Promise<boolean> => {
  try {
    // This is a placeholder - implement with react-native-device-info
    // const DeviceInfo = require('react-native-device-info');
    // const isRooted = await DeviceInfo.isRooted();
    // const isJailbroken = await DeviceInfo.isJailbroken();
    // return !isRooted && !isJailbroken;
    
    return true; // Assuming secure for now
  } catch (error) {
    console.error('Error checking device security:', error);
    return false;
  }
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} => {
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let message = '';
  
  // Check minimum length
  if (password.length < 8) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Password must be at least 8 characters long',
    };
  }
  
  // Check for uppercase, lowercase, numbers, and special characters
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (criteriaCount < 2) {
    strength = 'weak';
    message = 'Password is weak. Include uppercase, lowercase, numbers, and special characters.';
  } else if (criteriaCount < 4) {
    strength = 'medium';
    message = 'Password is medium strength.';
  } else {
    strength = 'strong';
    message = 'Password is strong!';
  }
  
  return {
    isValid: criteriaCount >= 2,
    strength,
    message,
  };
};

/**
 * Sanitize user input to prevent injection attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Check if biometric authentication is available
 * Note: Requires react-native-biometrics package
 */
export const isBiometricAvailable = async (): Promise<{
  available: boolean;
  biometryType: 'FaceID' | 'TouchID' | 'Biometrics' | null;
}> => {
  try {
    // This is a placeholder - implement with react-native-biometrics
    // const ReactNativeBiometrics = require('react-native-biometrics');
    // const rnBiometrics = new ReactNativeBiometrics();
    // const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    
    return {
      available: true,
      biometryType: Platform.OS === 'ios' ? 'FaceID' : 'Biometrics',
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return {
      available: false,
      biometryType: null,
    };
  }
};

/**
 * Authenticate with biometrics
 */
export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    // This is a placeholder - implement with react-native-biometrics
    // const ReactNativeBiometrics = require('react-native-biometrics');
    // const rnBiometrics = new ReactNativeBiometrics();
    // const { success } = await rnBiometrics.simplePrompt({
    //   promptMessage: 'Confirm your identity',
    // });
    // return success;
    
    // For now, show an alert
    return new Promise((resolve) => {
      Alert.alert(
        'Biometric Authentication',
        'Biometric authentication would be triggered here',
        [
          { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
          { text: 'Authenticate', onPress: () => resolve(true) },
        ]
      );
    });
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

/**
 * Secure data encryption (placeholder)
 * Note: Implement with react-native-encrypted-storage
 */
export const securelyStoreData = async (key: string, value: string): Promise<boolean> => {
  try {
    // This is a placeholder - implement with react-native-encrypted-storage
    // const EncryptedStorage = require('react-native-encrypted-storage');
    // await EncryptedStorage.setItem(key, value);
    
    console.log(`Securely stored data for key: ${key}`);
    return true;
  } catch (error) {
    console.error('Error storing secure data:', error);
    return false;
  }
};

/**
 * Retrieve securely stored data (placeholder)
 */
export const retrieveSecureData = async (key: string): Promise<string | null> => {
  try {
    // This is a placeholder - implement with react-native-encrypted-storage
    // const EncryptedStorage = require('react-native-encrypted-storage');
    // const value = await EncryptedStorage.getItem(key);
    // return value;
    
    console.log(`Retrieved secure data for key: ${key}`);
    return null;
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    return null;
  }
};

/**
 * Delete securely stored data
 */
export const deleteSecureData = async (key: string): Promise<boolean> => {
  try {
    // This is a placeholder - implement with react-native-encrypted-storage
    // const EncryptedStorage = require('react-native-encrypted-storage');
    // await EncryptedStorage.removeItem(key);
    
    console.log(`Deleted secure data for key: ${key}`);
    return true;
  } catch (error) {
    console.error('Error deleting secure data:', error);
    return false;
  }
};

/**
 * Prevent screenshots (Android only)
 * Note: Requires native module implementation
 */
export const preventScreenshots = (prevent: boolean = true): void => {
  if (Platform.OS === 'android') {
    try {
      // This is a placeholder - implement with native module
      // const { PreventScreenshot } = require('react-native-prevent-screenshot');
      // if (prevent) {
      //   PreventScreenshot.forbid();
      // } else {
      //   PreventScreenshot.allow();
      // }
      
      console.log(`Screenshot prevention ${prevent ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error setting screenshot prevention:', error);
    }
  }
};

/**
 * Log security event (for audit trail)
 */
export const logSecurityEvent = (event: string, details?: any): void => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}`, details || '');
  
  // In production, send to a secure logging service
  // Do not log sensitive information like passwords, tokens, etc.
};

/**
 * Validate session token
 */
export const validateSession = (token: string): boolean => {
  // Implement your session validation logic here
  // This could involve checking token expiry, validity, etc.
  return token && token.length > 0;
};

/**
 * Rate limiting for login attempts
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    if (now - record.timestamp > this.windowMs) {
      this.attempts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export default {
  SecurityConfig,
  isDeviceSecure,
  validatePasswordStrength,
  sanitizeInput,
  generateSecureToken,
  isBiometricAvailable,
  authenticateWithBiometrics,
  securelyStoreData,
  retrieveSecureData,
  deleteSecureData,
  preventScreenshots,
  logSecurityEvent,
  validateSession,
  RateLimiter,
};
