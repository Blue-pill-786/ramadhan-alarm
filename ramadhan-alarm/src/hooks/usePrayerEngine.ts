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

      // -----------------------
      // MAIN IFTAR / SEHRI LOGIC
      // -----------------------

      const isFasting =
        ["Fajr", "Dhuhr", "Asr"].includes(current);

      let targetDate: Date;

      if (isFasting) {
        // Countdown to Maghrib
        targetDate = prayers.find(p => p.name === "Maghrib")!.date;
      } else {
        // Countdown to next Fajr
        targetDate = prayers.find(p => p.name === "Fajr")!.date;

        if (now > targetDate) {
          targetDate = new Date(targetDate);
          targetDate.setDate(targetDate.getDate() + 1);
        }
      }

      const diff = targetDate.getTime() - now.getTime();

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      // -----------------------
      // MINI PRAYER PROGRESS
      // -----------------------

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

      // -----------------------
      // MAIN PROGRESS
      // -----------------------

      const totalDuration =
        targetDate.getTime() -
        (isFasting
          ? prayers.find(p => p.name === "Fajr")!.date.getTime()
          : now.getTime());

      const elapsedDuration =
        isFasting
          ? now.getTime() -
            prayers.find(p => p.name === "Fajr")!.date.getTime()
          : 0;

      const mainProgress =
        isFasting && totalDuration > 0
          ? (elapsedDuration / totalDuration) * 100
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