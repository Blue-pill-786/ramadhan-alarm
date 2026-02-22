import type { PrayerData } from "../types/prayer";

export async function fetchPrayerTimes(
  lat: number,
  lon: number
): Promise<PrayerData> {
  const today = new Date();

  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}?latitude=${lat}&longitude=${lon}&method=2&adjustment=1`
  );

  const json = await res.json();
  const data = json.data;

  const hijriDay = Number(data.date.hijri.day);
  const REGION_OFFSET = -1; // India moon adjustment

  return {
    timings: {
      Fajr: data.timings.Fajr.split(" ")[0],
      Dhuhr: data.timings.Dhuhr.split(" ")[0],
      Asr: data.timings.Asr.split(" ")[0],
      Maghrib: data.timings.Maghrib.split(" ")[0],
      Isha: data.timings.Isha.split(" ")[0]
    },
    hijri: {
      day: (hijriDay + REGION_OFFSET).toString(),
      month: data.date.hijri.month.en,
      year: data.date.hijri.year
    }
  };
}