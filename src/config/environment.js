// Environment configuration for LiveKit
// In production, these should be set as environment variables

export const ENV_CONFIG = {
  // LiveKit WebSocket URL
  LIVEKIT_URL: 'wss://moodbites-ansgjxj5.livekit.cloud',
  
  // Video Call Service URL
  VIDEO_CALL_SERVICE_URL: 'http://localhost:5006',
  
  // Development mode
  IS_DEVELOPMENT: true,
  
  // Production mode
  IS_PRODUCTION: false
};

// Helper function to get the full API URL
export const getVideoCallAPIUrl = () => {
  return `${ENV_CONFIG.VIDEO_CALL_SERVICE_URL}/api/getToken`;
};

// Helper function to get LiveKit WebSocket URL
export const getLiveKitURL = () => {
  return ENV_CONFIG.LIVEKIT_URL;
};
