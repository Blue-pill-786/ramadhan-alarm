import type { PrayerData } from "../types/prayer";

export async function fetchPrayerTimes(
  lat: number,
  lon: number
): Promise<PrayerData> {
  const today = new Date();

  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}?latitude=${lat}&longitude=${lon}&method=2`
  );

  const json = await res.json();
  const { timings, date, meta } = json.data;

  // ---------------------------
  // Hijri correction (display only)
  // ---------------------------

  const hijriDay = Number(date.hijri.day);

  const REGION_OFFSET =
    meta.timezone === "Asia/Kolkata" ? -1 : 0;

  const correctedHijriDay =
    hijriDay + REGION_OFFSET;

  return {
    timings: {
      Fajr: timings.Fajr.split(" ")[0],
      Dhuhr: timings.Dhuhr.split(" ")[0],
      Asr: timings.Asr.split(" ")[0],
      Maghrib: timings.Maghrib.split(" ")[0],
      Isha: timings.Isha.split(" ")[0]
    },
    hijri: {
      day: correctedHijriDay,
      month: date.hijri.month.en,
      year: date.hijri.year
    }
  };
}