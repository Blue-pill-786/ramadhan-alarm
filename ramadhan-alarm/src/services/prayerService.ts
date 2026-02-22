import axios from "axios";
import type { PrayerData } from "../types/prayer";

export const fetchPrayerTimes = async (
  lat: number,
  lon: number
): Promise<PrayerData> => {
  const date = new Date().toISOString().split("T")[0];

  const response = await axios.get(
    `https://api.aladhan.com/v1/timings/${date}`,
    {
      params: {
        latitude: lat,
        longitude: lon,
        method: 1
      }
    }
  );

  const cleanTimings = response.data.data.timings;

  return {
    timings: {
      Fajr: cleanTimings.Fajr.split(" ")[0],
      Dhuhr: cleanTimings.Dhuhr.split(" ")[0],
      Asr: cleanTimings.Asr.split(" ")[0],
      Maghrib: cleanTimings.Maghrib.split(" ")[0],
      Isha: cleanTimings.Isha.split(" ")[0],
    },
    hijri: response.data.data.date.hijri
  };
};