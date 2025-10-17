// LiveKit Configuration
// Note: In production, these should be environment variables

export const LIVEKIT_CONFIG = {
  // Your API Key from the screenshot
  API_KEY: "APIu6mDeZQKW7C5",
  
  // Your API Secret from the screenshot (server-side only)
  API_SECRET: "80y92tSB4VytbGeH2TpL6nlhYSDN2vQMUBGyfHxcyxh",
  
  // Your Websocket URL from the screenshot
  WEBSOCKET_URL: "wss://moodbites-ansgxjx5.livekit.cloud"
};

// Environment variables (preferred for production)
export const getLiveKitConfig = () => ({
  apiKey: process.env.REACT_APP_LIVEKIT_API_KEY || LIVEKIT_CONFIG.API_KEY,
  apiSecret: process.env.REACT_APP_LIVEKIT_API_SECRET || LIVEKIT_CONFIG.API_SECRET,
  websocketUrl: process.env.REACT_APP_LIVEKIT_URL || LIVEKIT_CONFIG.WEBSOCKET_URL,
});
