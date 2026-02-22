import { useEffect, useState } from "react";
import type { Timings, PrayerName } from "../types/prayer";
import { PRAYER_NAMES } from "../types/prayer";

interface EngineResult {
  currentPrayer: PrayerName;
  nextPrayer: PrayerName;
  timeLeft: string;
  prayerProgress: Record<PrayerName, number>;
  mainProgress: number;
  isFasting: boolean;
  tahajjudTime: string;
}

export default function usePrayerEngine(
  timings: Timings | null
): EngineResult | null {
  const [state, setState] =
    useState<EngineResult | null>(null);

  useEffect(() => {
    if (!timings) return;

    const interval = setInterval(() => {
      const now = new Date();

      const basePrayers = [
        { name: "Fajr", time: timings.Fajr },
        { name: "Dhuhr", time: timings.Dhuhr },
        { name: "Asr", time: timings.Asr },
        { name: "Maghrib", time: timings.Maghrib },
        { name: "Isha", time: timings.Isha }
      ];

      const prayers = basePrayers.map(p => {
        const [h, m] = p.time.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        return { name: p.name, date };
      });

      // Tahajjud = last third of night
      const maghrib = prayers.find(p => p.name === "Maghrib")!.date;
      let fajr = prayers.find(p => p.name === "Fajr")!.date;

      if (fajr <= maghrib) {
        fajr = new Date(fajr);
        fajr.setDate(fajr.getDate() + 1);
      }

      const nightDuration =
        fajr.getTime() - maghrib.getTime();

      const tahajjudStart = new Date(
        maghrib.getTime() + (2 / 3) * nightDuration
      );

      prayers.push({
        name: "Tahajjud",
        date: tahajjudStart
      });

      // Determine current & next
      let current: PrayerName = "Isha";
      let next: PrayerName = "Fajr";

      for (let i = 0; i < prayers.length; i++) {
        const p = prayers[i];
        const nextP = prayers[i + 1];

        if (now >= p.date && (!nextP || now < nextP.date)) {
          current = p.name as PrayerName;
          next = nextP
            ? (nextP.name as PrayerName)
            : "Fajr";
          break;
        }
      }

      const isFasting =
        ["Fajr", "Dhuhr", "Asr"].includes(current);

      let target = isFasting ? maghrib : fajr;

      if (!isFasting && now > fajr) {
        target = new Date(fajr);
        target.setDate(target.getDate() + 1);
      }

      const diff = Math.max(
        0,
        target.getTime() - now.getTime()
      );

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const prayerProgress =
        {} as Record<PrayerName, number>;

      prayers.forEach((p, i) => {
        const nextP = prayers[i + 1];

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

      setState({
        currentPrayer: current,
        nextPrayer: next,
        timeLeft: `${hours}h ${minutes}m ${seconds}s`,
        prayerProgress,
        mainProgress:
          nightDuration > 0
            ? (1 - diff / nightDuration) * 100
            : 0,
        isFasting,
        tahajjudTime:
          tahajjudStart.toTimeString().slice(0, 5)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timings]);

  return state;
}