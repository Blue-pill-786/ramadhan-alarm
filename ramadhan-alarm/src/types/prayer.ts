export const PRAYER_NAMES = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha"
] as const;

export type PrayerName = typeof PRAYER_NAMES[number];

export type Timings = Record<PrayerName, string>;

export interface HijriDate {
  day: string;
  month: string;
  year: string;
}

export interface PrayerData {
  timings: Timings;
  hijri: HijriDate;
}