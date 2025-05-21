// config.ts
const USE_LIVE_SERVER = false; // set to true for live server

const LOCAL_DEV_IP = "10.34.70.149:5000";
const LIVE_SERVER = "activity-app-server.onrender.com";

export const API_URL = USE_LIVE_SERVER
    ? `https://${LIVE_SERVER}`
    : `http://${LOCAL_DEV_IP}`;