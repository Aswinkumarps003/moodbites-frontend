/**
 * DEPRECATED: This file is deprecated. Use /config/api.js instead.
 * Keeping for backward compatibility only.
 */

// Environment configuration for LiveKit
// In production, these should be set as environment variables

export const ENV_CONFIG = {
  // LiveKit WebSocket URL
  LIVEKIT_URL: import.meta.env.VITE_LIVEKIT_URL || 'wss://moodbites-ansgjxj5.livekit.cloud',
  
  // Video Call Service URL
  VIDEO_CALL_SERVICE_URL: import.meta.env.VITE_VIDEO_CALL_SERVICE_URL || 'http://localhost:5006',
  
  // Development mode
  IS_DEVELOPMENT: import.meta.env.DEV || true,
  
  // Production mode
  IS_PRODUCTION: import.meta.env.PROD || false
};

// Helper function to get the full API URL
export const getVideoCallAPIUrl = () => {
  return `${ENV_CONFIG.VIDEO_CALL_SERVICE_URL}/api/getToken`;
};

// Helper function to get LiveKit WebSocket URL
export const getLiveKitURL = () => {
  return ENV_CONFIG.LIVEKIT_URL;
};
