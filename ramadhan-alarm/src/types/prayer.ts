export interface PrayerData {
  timings: {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  hijri: {
    day: string;
    month: { en: string };
    year: string;
  };
}