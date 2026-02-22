export const PRAYER_NAMES = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
  "Tahajjud"
] as const;

export type PrayerName = typeof PRAYER_NAMES[number];

export type Timings = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export interface HijriDate {
  day: string;
  month: string;
  year: string;
}

export interface PrayerData {
  timings: Timings;
  hijri: HijriDate;
}