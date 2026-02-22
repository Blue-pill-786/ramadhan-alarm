import { useEffect, useState } from "react";

export interface CountdownResult {
  label: string;
  timeLeft: string;
  isSehriOrIftar: boolean;
  currentPrayer: string;
}

export default function useCountdown(
  timings: {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  } | null
): CountdownResult | null {
  const [result, setResult] = useState<CountdownResult | null>(null);

  useEffect(() => {
    if (!timings) return;

    const interval = setInterval(() => {
      const now = new Date();

      const prayerOrder = [
        { name: "Fajr", time: timings.Fajr },
        { name: "Dhuhr", time: timings.Dhuhr },
        { name: "Asr", time: timings.Asr },
        { name: "Maghrib", time: timings.Maghrib },
        { name: "Isha", time: timings.Isha }
      ];

      const todayTargets = prayerOrder.map(p => {
        const [h, m] = p.time.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        return { ...p, date };
      });

      let nextPrayer = todayTargets.find(p => now < p.date);

      // If all passed → next is tomorrow Fajr
      if (!nextPrayer) {
        const [h, m] = timings.Fajr.split(":").map(Number);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(h, m, 0, 0);

        nextPrayer = {
          name: "Fajr",
          time: timings.Fajr,
          date: tomorrow
        };
      }

      const diff = nextPrayer.date.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setResult({
        label: nextPrayer.name,
        timeLeft: `${hours}h ${minutes}m ${seconds}s`,
        isSehriOrIftar:
          nextPrayer.name === "Fajr" ||
          nextPrayer.name === "Maghrib"
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timings]);

  return result;
}