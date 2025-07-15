import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

// This hook provides device latitude and longitude for location-aware activity filtering.
// Used for passing lat/lon to activity fetch and creation APIs.

// Custom hook to get device latitude and longitude only
export default function useDeviceLocation(key?: number) {
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            console.log('Location permission status:', status);
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                console.log('Permission denied');
                return;
            }
            // Try last known position first (fast)
            let loc = await Location.getLastKnownPositionAsync();
            if (!loc) {
                // If not available, request new position with lower accuracy
                loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            }
            if (loc && loc.coords) {
                setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                setErrorMsg(null); // Clear error if location is retrieved
                console.log('[HOOK] Device lat/lon:', { latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            }
        })();
    }, [key]); // Add key to dependency array

    return { coords, errorMsg };
}
