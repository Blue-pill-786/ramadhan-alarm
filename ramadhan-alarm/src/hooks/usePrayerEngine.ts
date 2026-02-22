import { useEffect, useRef, useState } from "react";

interface EngineResult {
  currentPrayer: string;
  nextPrayer: string;
  timeLeft: string;
  progress: number;
}

export default function usePrayerEngine(
  timings: any | null
): EngineResult | null {
  const [state, setState] = useState<EngineResult | null>(null);
  const previousPrayerRef = useRef<string | null>(null);

  useEffect(() => {
    if (!timings) return;

    const interval = setInterval(() => {
      const now = new Date();

      const names = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      const prayers = names.map(name => {
        const [h, m] = timings[name].split(":").map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        return { name, date };
      });

      let current = "";
      let next = "";

      for (let i = 0; i < prayers.length; i++) {
        const p = prayers[i];
        const nextP = prayers[i + 1];

        if (now >= p.date && (!nextP || now < nextP.date)) {
          current = p.name;
          next = nextP ? nextP.name : "Fajr";
          break;
        }
      }

      if (!current) {
        current = "Isha";
        next = "Fajr";
      }

      if (previousPrayerRef.current !== current) {
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        previousPrayerRef.current = current;
      }

      const nextObj =
        prayers.find(p => p.name === next) || prayers[0];

      let target = new Date(nextObj.date);

      if (next === "Fajr" && now > prayers[4].date) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const currentObj = prayers.find(p => p.name === current);

      const intervalDuration =
        target.getTime() - currentObj!.date.getTime();

      const elapsed =
        now.getTime() - currentObj!.date.getTime();

      const progress =
        intervalDuration > 0
          ? (elapsed / intervalDuration) * 100
          : 0;

      setState({
        currentPrayer: current,
        nextPrayer: next,
        timeLeft: `${hours}h ${minutes}m ${seconds}s`,
        progress
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timings]);

  return state;
}