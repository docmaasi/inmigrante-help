import { toast } from 'sonner';

/**
 * Centralized error handling utility for consistent, user-friendly error messages
 */

// Common error patterns and their user-friendly messages
const ERROR_MESSAGES = {
  // Network errors
  'Failed to fetch': 'Unable to connect to the server. Please check your internet connection and try again.',
  'NetworkError': 'Network error. Please check your internet connection.',
  'net::ERR_': 'Connection failed. Please check your internet and try again.',
  'timeout': 'The request took too long. Please try again.',

  // Auth errors
  'Invalid login credentials': 'The email or password you entered is incorrect. Please try again.',
  'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
  'User already registered': 'An account with this email already exists. Try signing in instead.',
  'Password should be at least': 'Password must be at least 6 characters long.',
  'Invalid email': 'Please enter a valid email address.',

  // Permission errors
  'permission denied': 'You don\'t have permission to perform this action. Please contact your team admin.',
  'row-level security': 'You don\'t have access to this resource.',
  'JWT expired': 'Your session has expired. Please sign in again.',
  'not authenticated': 'Please sign in to continue.',

  // Database errors
  'duplicate key': 'This item already exists. Please use a different name.',
  'violates foreign key': 'This action cannot be completed because related data exists.',
  'violates not-null': 'Please fill in all required fields.',
  'unique constraint': 'This value is already in use. Please choose a different one.',

  // Storage errors
  'Payload too large': 'The file is too large. Please choose a smaller file (max 5MB).',
  'invalid file type': 'This file type is not supported. Please use JPG, PNG, or PDF.',
  'storage/unauthorized': 'You don\'t have permission to upload files.',

  // Rate limiting
  'rate limit': 'Too many requests. Please wait a moment and try again.',
  'too many requests': 'Please slow down and try again in a few seconds.',
};

/**
 * Get a user-friendly error message from an error object
 */
export function getErrorMessage(error, fallbackMessage = 'Something went wrong. Please try again.') {
  if (!error) return fallbackMessage;

  // Get the error message string
  const errorString = typeof error === 'string'
    ? error
    : error.message || error.error_description || error.msg || String(error);

  // Check against known error patterns
  for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
    if (errorString.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }

  // If error is already user-friendly (starts with capital, ends with period/question)
  if (/^[A-Z].*[.!?]$/.test(errorString) && errorString.length < 200) {
    return errorString;
  }

  // Return the original message if it seems readable, otherwise fallback
  if (errorString.length < 100 && !errorString.includes('_') && !/^[a-z]/.test(errorString)) {
    return errorString;
  }

  return fallbackMessage;
}

/**
 * Show an error toast with a user-friendly message
 */
export function showError(error, context = '') {
  const message = getErrorMessage(error);
  const fullMessage = context ? `${context}: ${message}` : message;

  toast.error(fullMessage, {
    duration: 5000,
    description: context ? 'Please try again or contact support if the problem persists.' : undefined,
  });

  // Log the original error for debugging
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);

  return message;
}

/**
 * Context-specific error handlers for common operations
 */
export const errorHandlers = {
  // Form validation errors
  validation: (fields) => {
    const fieldList = Array.isArray(fields) ? fields.join(', ') : fields;
    toast.error(`Please fill in required fields: ${fieldList}`);
  },

  // Save/update errors
  save: (itemType, error) => {
    const message = getErrorMessage(error, `Unable to save ${itemType}. Please try again.`);
    toast.error(message);
    console.error(`Failed to save ${itemType}:`, error);
  },

  // Delete errors
  delete: (itemType, error) => {
    const message = getErrorMessage(error, `Unable to delete ${itemType}. Please try again.`);
    toast.error(message);
    console.error(`Failed to delete ${itemType}:`, error);
  },

  // Load/fetch errors
  load: (itemType, error) => {
    const message = getErrorMessage(error, `Unable to load ${itemType}. Please refresh the page.`);
    toast.error(message);
    console.error(`Failed to load ${itemType}:`, error);
  },

  // Upload errors
  upload: (error) => {
    const message = getErrorMessage(error, 'File upload failed. Please try a different file.');
    toast.error(message);
    console.error('Upload failed:', error);
  },

  // Send errors (messages, notifications, etc.)
  send: (itemType, error) => {
    const message = getErrorMessage(error, `Unable to send ${itemType}. Please try again.`);
    toast.error(message);
    console.error(`Failed to send ${itemType}:`, error);
  },
};

/**
 * Wrapper for async operations with automatic error handling
 */
export async function withErrorHandling(operation, context, fallbackMessage) {
  try {
    return await operation();
  } catch (error) {
    showError(error, context);
    throw error;
  }
}

export default {
  getErrorMessage,
  showError,
  errorHandlers,
  withErrorHandling,
};
