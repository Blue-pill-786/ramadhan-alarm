import { useEffect, useState } from "react";
import type { Timings, PrayerName } from "../types/prayer";

interface EngineResult {
  currentPrayer: PrayerName;
  nextPrayer: PrayerName;
  timeLeft: string;
  prayerProgress: Record<PrayerName, number>;
  mainProgress: number;
  isFasting: boolean;
  tahajjudTime: string;
}

// const PRAYERS: PrayerName[] = [
//   "Fajr",
//   "Dhuhr",
//   "Asr",
//   "Maghrib",
//   "Isha",
//   "Tahajjud"
// ];

export default function usePrayerEngine(
  timings: Timings | null
): EngineResult | null {
  const [state, setState] = useState<EngineResult | null>(null);

  useEffect(() => {
    if (!timings) return;

    const calculate = () => {
      const now = new Date();

      // Build base prayer times
      const buildDate = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
      };

      const fajr = buildDate(timings.Fajr);
      const dhuhr = buildDate(timings.Dhuhr);
      const asr = buildDate(timings.Asr);
      const maghrib = buildDate(timings.Maghrib);
      const isha = buildDate(timings.Isha);

      // Adjust fajr if it's technically tomorrow
      let adjustedFajr = new Date(fajr);
      if (fajr <= maghrib) {
        adjustedFajr.setDate(adjustedFajr.getDate() + 1);
      }

      // Tahajjud = last third of night
      const nightDuration =
        adjustedFajr.getTime() - maghrib.getTime();

      const tahajjudStart = new Date(
        maghrib.getTime() + (2 / 3) * nightDuration
      );

      const prayers = [
        { name: "Fajr" as PrayerName, date: fajr },
        { name: "Dhuhr" as PrayerName, date: dhuhr },
        { name: "Asr" as PrayerName, date: asr },
        { name: "Maghrib" as PrayerName, date: maghrib },
        { name: "Isha" as PrayerName, date: isha },
        { name: "Tahajjud" as PrayerName, date: tahajjudStart }
      ].sort((a, b) => a.date.getTime() - b.date.getTime());

      // Determine current & next prayer
      let current: PrayerName = "Isha";
      let next: PrayerName = "Fajr";

      for (let i = 0; i < prayers.length; i++) {
        const p = prayers[i];
        const nextP = prayers[i + 1];

        if (now >= p.date && (!nextP || now < nextP.date)) {
          current = p.name;
          next = nextP ? nextP.name : "Fajr";
          break;
        }
      }

      // Fasting state
      const isFasting =
        current === "Fajr" ||
        current === "Dhuhr" ||
        current === "Asr";

      // Target for main countdown
      let target = isFasting ? maghrib : adjustedFajr;

      if (!isFasting && now > adjustedFajr) {
        target = new Date(adjustedFajr);
        target.setDate(target.getDate() + 1);
      }

      const diff = Math.max(
        0,
        target.getTime() - now.getTime()
      );

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      // Prayer progress
      const prayerProgress = {} as Record<
        PrayerName,
        number
      >;

      prayers.forEach((p, i) => {
        const nextP = prayers[i + 1];

        if (now < p.date) {
          prayerProgress[p.name] = 0;
        } else if (!nextP || now >= nextP.date) {
          prayerProgress[p.name] = 100;
        } else {
          const duration =
            nextP.date.getTime() - p.date.getTime();
          const elapsed =
            now.getTime() - p.date.getTime();

          prayerProgress[p.name] =
            (elapsed / duration) * 100;
        }
      });

      // Main progress
      const startTime = isFasting ? fajr : maghrib;
      const totalDuration =
        target.getTime() - startTime.getTime();
      const elapsed =
        now.getTime() - startTime.getTime();

      const mainProgress =
        totalDuration > 0
          ? Math.min(
              100,
              Math.max(0, (elapsed / totalDuration) * 100)
            )
          : 0;

      setState({
        currentPrayer: current,
        nextPrayer: next,
        timeLeft: `${hours}h ${minutes}m ${seconds}s`,
        prayerProgress,
        mainProgress,
        isFasting,
        tahajjudTime:
          tahajjudStart.toTimeString().slice(0, 5)
      });
    };

    calculate(); // Run immediately
    const interval = setInterval(calculate, 1000);

    return () => clearInterval(interval);
  }, [timings]);

  return state;
}