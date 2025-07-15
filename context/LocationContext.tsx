import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LocationCoords {
  latitude: number | null;
  longitude: number | null;
}

interface LocationContextType {
  coords: LocationCoords;
  setCoords: (coords: LocationCoords) => void;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoordsState] = useState<LocationCoords>({ latitude: null, longitude: null });

  useEffect(() => {
    // Load from AsyncStorage on mount
    (async () => {
      const stored = await AsyncStorage.getItem("device_coords");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCoordsState(parsed);
        } catch {}
      }
      // Always refresh location on mount
      await refreshLocation();
    })();
  }, []);

  const setCoords = (newCoords: LocationCoords) => {
    setCoordsState(newCoords);
    AsyncStorage.setItem("device_coords", JSON.stringify(newCoords));
  };

  const refreshLocation = async () => {
    try {
      const { status } = await import("expo-location").then((Location) => Location.requestForegroundPermissionsAsync());
      if (status === "granted") {
        const loc = await import("expo-location").then((Location) => Location.getCurrentPositionAsync({}));
        if (loc && loc.coords) {
          setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      }
    } catch {}
  };

  return <LocationContext.Provider value={{ coords, setCoords, refreshLocation }}>{children}</LocationContext.Provider>;
};

export const useLocationContext = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationContext must be used within a LocationProvider");
  return ctx;
};
