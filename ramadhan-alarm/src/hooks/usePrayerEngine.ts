import { useEffect, useState } from "react";
import { PRAYER_NAMES } from "../types/prayer";
import type { PrayerName, Timings } from "../types/prayer";

interface EngineResult {
  currentPrayer: PrayerName;
  nextPrayer: PrayerName;
  timeLeft: string;
  prayerProgress: Record<PrayerName, number>;
  mainProgress: number;
  isFasting: boolean;
}

export default function usePrayerEngine(
  timings: Timings | null
): EngineResult | null {
  const [state, setState] = useState<EngineResult | null>(null);

  useEffect(() => {
    if (!timings) return;

    const interval = setInterval(() => {
      const now = new Date();

      const prayers = PRAYER_NAMES.map(name => {
        const [h, m] = timings[name].split(":").map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        return { name, date };
      });

      let current: PrayerName = "Isha";
      let next: PrayerName = "Fajr";

      for (let i = 0; i < prayers.length; i++) {
        const p = prayers[i];
        const nextP = prayers[i + 1];

        if (now >= p.date && (!nextP || now < nextP.date)) {
          current = p.name as PrayerName;
          next = nextP ? (nextP.name as PrayerName) : "Fajr";
          break;
        }
      }

      const isFasting =
        ["Fajr", "Dhuhr", "Asr"].includes(current);

      let startDate: Date;
      let targetDate: Date;

      if (isFasting) {
        startDate = prayers.find(p => p.name === "Fajr")!.date;
        targetDate = prayers.find(p => p.name === "Maghrib")!.date;
      } else {
        startDate = prayers.find(p => p.name === "Isha")!.date;
        targetDate = prayers.find(p => p.name === "Fajr")!.date;

        if (now > targetDate) {
          targetDate = new Date(targetDate);
          targetDate.setDate(targetDate.getDate() + 1);
        }
      }

      const diff = Math.max(
        0,
        targetDate.getTime() - now.getTime()
      );

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor(
        (diff % 3600000) / 60000
      );
      const seconds = Math.floor(
        (diff % 60000) / 1000
      );

      const prayerProgress =
        {} as Record<PrayerName, number>;

      prayers.forEach((p, index) => {
        const nextP = prayers[index + 1];

        if (now < p.date) {
          prayerProgress[p.name as PrayerName] = 0;
        } else if (!nextP || now >= nextP.date) {
          prayerProgress[p.name as PrayerName] = 100;
        } else {
          const duration =
            nextP.date.getTime() - p.date.getTime();
          const elapsed =
            now.getTime() - p.date.getTime();
          prayerProgress[p.name as PrayerName] =
            (elapsed / duration) * 100;
        }
      });

      const totalDuration =
        targetDate.getTime() - startDate.getTime();

      const elapsedDuration =
        now.getTime() - startDate.getTime();

      const mainProgress =
        totalDuration > 0
          ? Math.min(
              100,
              Math.max(
                0,
                (elapsedDuration / totalDuration) * 100
              )
            )
          : 0;

      setState({
        currentPrayer: current,
        nextPrayer: next,
        timeLeft: `${hours}h ${minutes}m ${seconds}s`,
        prayerProgress,
        mainProgress,
        isFasting
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timings]);

  return state;
}