import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>({
  userId: null,
  setUserId: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log("AuthProvider initialized with userId:", userId);
  }, [userId]);

  useEffect(() => {
    const loadUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      console.log("AsyncStorage.getItem returned:", storedUserId); // Log the value retrieved from AsyncStorage
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    loadUserId();
  }, []); // Load userId from storage on app startup

  const saveUserId = async (id: string | null) => {
    console.log("saveUserId called with:", id); // Log the value passed to saveUserId
    if (!id) {
      console.trace("saveUserId called with undefined/null!"); // Print stack trace
    }
    if (id) {
      console.log("AsyncStorage.setItem called with:", id); // Log the value being saved to AsyncStorage
      await AsyncStorage.setItem("userId", String(id)); // Always store as string
    } else {
      await AsyncStorage.removeItem("userId");
    }
    console.log("setUserId updating state with:", id); // Log the value being set in state
    setUserId(id);
  };

  return (
    <AuthContext.Provider value={{ userId, setUserId: saveUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
