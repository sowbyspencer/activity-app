// Expo app.config.js to inject .env variables into Expo's extra field
import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      arcgisApiKey: process.env.ARC_GIS_API_KEY,
    },
  };
};
