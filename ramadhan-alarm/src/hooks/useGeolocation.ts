import { useEffect, useState } from "react";
import { fetchIPLocation } from "../services/ipLocationService";

export interface Location {
  lat: number;
  lon: number;
  city?: string;
}

export default function useGeolocation(): Location | null {
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      fallbackToIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      async () => {
        // If GPS fails → fallback to IP
        fallbackToIP();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );

    async function fallbackToIP() {
      try {
        const ipLocation = await fetchIPLocation();
        setLocation({
          lat: ipLocation.latitude,
          lon: ipLocation.longitude,
          city: ipLocation.city
        });
      } catch {
        console.error("IP location fallback failed.");
      }
    }
  }, []);

  return location;
}