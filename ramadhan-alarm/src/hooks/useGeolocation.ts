import { useEffect, useState } from "react";
import { fetchIPLocation } from "../services/ipLocationService";

export interface Location {
  lat: number;
  lon: number;
  city?: string;
}

export default function useGeolocation(): Location | null {
  const [location, setLocation] =
    useState<Location | null>(null);

  useEffect(() => {
    let resolved = false;

    const fallbackToIP = async () => {
      try {
        const ipLocation =
          await fetchIPLocation();

        setLocation({
          lat: ipLocation.latitude,
          lon: ipLocation.longitude,
          city: ipLocation.city
        });

        resolved = true;
      } catch (err) {
        console.error(
          "IP fallback failed.",
          err
        );

        // 🌍 FINAL HARD FALLBACK (India default)
        setLocation({
          lat: 19.0760, // Mumbai
          lon: 72.8777
        });

        resolved = true;
      }
    };

    if (!navigator.geolocation) {
      fallbackToIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (resolved) return;

        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });

        resolved = true;
      },
      () => {
        fallbackToIP();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );
  }, []);

  return location;
}