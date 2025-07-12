import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import type { LocationObject } from 'expo-location';

export default function useDeviceLocation() {
    const [location, setLocation] = useState<LocationObject | null>(null);
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
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            console.log('Device location:', loc);
        })();
    }, []);

    return { location, errorMsg };
}
