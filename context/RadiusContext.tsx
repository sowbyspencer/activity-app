import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_RADIUS_KM = 50;

interface RadiusContextType {
  radius: number;
  setRadius: (r: number) => void;
}

const RadiusContext = createContext<RadiusContextType | undefined>(undefined);

export const useRadius = () => {
  const ctx = useContext(RadiusContext);
  if (!ctx) throw new Error("useRadius must be used within a RadiusProvider");
  return ctx;
};

export const RadiusProvider = ({ children }: { children: ReactNode }) => {
  const [radius, setRadiusState] = useState<number>(DEFAULT_RADIUS_KM);

  useEffect(() => {
    const loadRadius = async () => {
      const storedRadius = await AsyncStorage.getItem("activityRadius");
      if (storedRadius) setRadiusState(Number(storedRadius));
    };
    loadRadius();
  }, []);

  const setRadius = (r: number) => {
    setRadiusState(r);
    AsyncStorage.setItem("activityRadius", r.toString());
    console.log("[RadiusContext] Saved radius to AsyncStorage:", r);
  };

  return <RadiusContext.Provider value={{ radius, setRadius }}>{children}</RadiusContext.Provider>;
};
