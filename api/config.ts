// -----------------------------------------------------------------------------
// config.ts - API base URL configuration
// -----------------------------------------------------------------------------
// Exports the API_URL constant, switching between local and live server.
// Used by all API service modules.
// -----------------------------------------------------------------------------

const USE_LIVE_SERVER = true; // set to true for live server

const LOCAL_DEV_IP = "192.168.50.144:5000";
const LIVE_SERVER = "activity-app-server.onrender.com";

export const API_URL = USE_LIVE_SERVER
    ? `https://${LIVE_SERVER}`
    : `http://${LOCAL_DEV_IP}`;