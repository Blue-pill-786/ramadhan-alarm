import { useEffect, useState } from "react";

interface EngineResult {
  currentPrayer: string;
  nextPrayer: string;
  timeLeft: string;
  prayerProgress: Record<string, number>;
  mainProgress: number;
}

export default function usePrayerEngine(
  timings: any | null
): EngineResult | null {
  const [state, setState] = useState<EngineResult | null>(null);

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

      // ---- CURRENT + NEXT ----
      let current = "Isha";
      let next = "Fajr";

      for (let i = 0; i < prayers.length; i++) {
        const p = prayers[i];
        const nextP = prayers[i + 1];

        if (now >= p.date && (!nextP || now < nextP.date)) {
          current = p.name;
          next = nextP ? nextP.name : "Fajr";
          break;
        }
      }

      // ---- IFTAR / SEHRI TARGET ----
      const isFasting =
        ["Fajr", "Dhuhr", "Asr"].includes(current);

      let targetDate: Date;
      let startDate: Date;

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

      const diff = targetDate.getTime() - now.getTime();

      const hours = Math.max(0, Math.floor(diff / 3600000));
      const minutes = Math.max(
        0,
        Math.floor((diff % 3600000) / 60000)
      );
      const seconds = Math.max(
        0,
        Math.floor((diff % 60000) / 1000)
      );

      // ---- MINI PRAYER RINGS ----
      const prayerProgress: Record<string, number> = {};

      prayers.forEach((p, index) => {
        const nextP = prayers[index + 1];

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

      // ---- MAIN RING PROGRESS ----
      const totalDuration =
        targetDate.getTime() - startDate.getTime();

      const elapsedDuration =
        now.getTime() - startDate.getTime();

      const mainProgress =
        totalDuration > 0
          ? Math.min(
              100,
              Math.max(0, (elapsedDuration / totalDuration) * 100)
            )
          : 0;

      setState({
        currentPrayer: current,
        nextPrayer: next,
        timeLeft: `${hours}h ${minutes}m ${seconds}s`,
        prayerProgress,
        mainProgress
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timings]);

  return state;
}