import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { GPSLocation, MockLocationOption } from '../types';

export const AURANGABAD_NEIGHBORHOODS: MockLocationOption[] = [
  {
    label: 'CIDCO N-4, Town Centre',
    sublabel: 'Near Prozone Mall, Chhatrapati Sambhajinagar',
    latitude: 19.8760,
    longitude: 75.3640,
  },
  {
    label: 'Osmanpura, Kranti Chowk',
    sublabel: 'Station Road, Chhatrapati Sambhajinagar',
    latitude: 19.8665,
    longitude: 75.3210,
  },
  {
    label: 'Nirala Bazar, Khadkeshwar',
    sublabel: 'Near Samarth Nagar, Chhatrapati Sambhajinagar',
    latitude: 19.8835,
    longitude: 75.3260,
  },
  {
    label: 'Garkheda Point',
    sublabel: 'Sutgirni Chowk / Ulkanagari, Chhatrapati Sambhajinagar',
    latitude: 19.8580,
    longitude: 75.3530,
  },
  {
    label: 'Seven Hills Junction',
    sublabel: 'Jalna Road / Akashwani, Chhatrapati Sambhajinagar',
    latitude: 19.8710,
    longitude: 75.3520,
  },
  {
    label: 'Chikalthana MIDC',
    sublabel: 'Airport Road / Mukundwadi, Chhatrapati Sambhajinagar',
    latitude: 19.8740,
    longitude: 75.3980,
  },
];

export function useCurrentLocation() {
  const [location, setLocation] = useState<GPSLocation>({
    latitude: AURANGABAD_NEIGHBORHOODS[0].latitude,
    longitude: AURANGABAD_NEIGHBORHOODS[0].longitude,
    accuracy: 10,
  });
  const [address, setAddress] = useState<string>(AURANGABAD_NEIGHBORHOODS[0].label);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUsingGPS, setIsUsingGPS] = useState<boolean>(false);

  const fetchLiveGPS = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Using default Aurangabad hub.');
        setLoading(false);
        setIsUsingGPS(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: GPSLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setLocation(coords);
      setIsUsingGPS(true);

      // Attempt reverse geocoding
      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (reverse && reverse.length > 0) {
          const item = reverse[0];
          const parts = [
            item.name || item.street,
            item.district || item.subregion || item.city,
            item.region,
          ].filter(Boolean);
          setAddress(parts.length > 0 ? parts.join(', ') : 'Chhatrapati Sambhajinagar');
        } else {
          setAddress(`GPS: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        }
      } catch {
        setAddress(`GPS: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (err: any) {
      console.warn('GPS location fetch error:', err.message);
      setErrorMsg('Could not acquire device GPS. Using demo location.');
      setIsUsingGPS(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const setManualLocation = useCallback((option: MockLocationOption) => {
    setLocation({
      latitude: option.latitude,
      longitude: option.longitude,
      accuracy: 5,
    });
    setAddress(option.label);
    setIsUsingGPS(false);
    setErrorMsg(null);
  }, []);

  useEffect(() => {
    fetchLiveGPS();
  }, [fetchLiveGPS]);

  return {
    location,
    address,
    loading,
    errorMsg,
    isUsingGPS,
    fetchLiveGPS,
    setManualLocation,
    neighborhoodOptions: AURANGABAD_NEIGHBORHOODS,
  };
}
