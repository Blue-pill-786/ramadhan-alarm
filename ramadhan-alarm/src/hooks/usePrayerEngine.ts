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

export default function usePrayerEngine(
  timings: Timings | null
): EngineResult | null {
  const [state, setState] = useState<EngineResult | null>(null);

  useEffect(() => {
    if (!timings) return;

    const build = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    };

    const calculate = () => {
      const now = new Date();

      // ---------- Build today's base times ----------
      const todayFajr = build(timings.Fajr);
      const dhuhr = build(timings.Dhuhr);
      const asr = build(timings.Asr);
      const maghrib = build(timings.Maghrib);
      const isha = build(timings.Isha);

      // ---------- Ensure strict chronological order ----------
      if (dhuhr <= todayFajr) dhuhr.setDate(dhuhr.getDate() + 1);
      if (asr <= dhuhr) asr.setDate(asr.getDate() + 1);
      if (maghrib <= asr) maghrib.setDate(maghrib.getDate() + 1);
      if (isha <= maghrib) isha.setDate(isha.getDate() + 1);

      // ---------- Compute next Fajr ----------
      let nextFajr = build(timings.Fajr);
      if (now >= nextFajr) {
        nextFajr.setDate(nextFajr.getDate() + 1);
      }

      // ---------- Night calculation ----------
      let nightStart = new Date(maghrib);
      if (now < maghrib) {
        nightStart.setDate(nightStart.getDate() - 1);
      }

      const nightDuration =
        nextFajr.getTime() - nightStart.getTime();

      const tahajjudStart = new Date(
        nightStart.getTime() + (2 / 3) * nightDuration
      );

      // ---------- Determine current & next prayer ----------
      let current: PrayerName = "Isha";
      let next: PrayerName = "Fajr";

      if (now >= tahajjudStart && now < nextFajr) {
        current = "Tahajjud";
        next = "Fajr";
      } else if (now >= todayFajr && now < dhuhr) {
        current = "Fajr";
        next = "Dhuhr";
      } else if (now >= dhuhr && now < asr) {
        current = "Dhuhr";
        next = "Asr";
      } else if (now >= asr && now < maghrib) {
        current = "Asr";
        next = "Maghrib";
      } else if (now >= maghrib && now < isha) {
        current = "Maghrib";
        next = "Isha";
      } else if (now >= isha && now < tahajjudStart) {
        current = "Isha";
        next = "Tahajjud";
      }

      // ---------- Fasting state ----------
      const isFasting =
        current === "Fajr" ||
        current === "Dhuhr" ||
        current === "Asr";

      // ---------- Sehri / Iftar target ----------
      const target = isFasting ? maghrib : nextFajr;

      const diff = Math.max(
        0,
        target.getTime() - now.getTime()
      );

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      // ---------- Prayer Progress (remaining based) ----------
      const timeline = [
        { name: "Fajr" as PrayerName, date: todayFajr },
        { name: "Dhuhr" as PrayerName, date: dhuhr },
        { name: "Asr" as PrayerName, date: asr },
        { name: "Maghrib" as PrayerName, date: maghrib },
        { name: "Isha" as PrayerName, date: isha },
        { name: "Tahajjud" as PrayerName, date: tahajjudStart },
        { name: "Fajr" as PrayerName, date: nextFajr }
      ];

      const prayerProgress =
        {} as Record<PrayerName, number>;

      timeline.forEach((p, i) => {
        const nextP = timeline[i + 1];
        if (!nextP) return;

        const start = p.date.getTime();
        const end = nextP.date.getTime();
        const duration = end - start;

        if (duration <= 0) {
          prayerProgress[p.name] = 0;
          return;
        }

        if (now < p.date) {
          prayerProgress[p.name] = 0;
        } else if (now >= nextP.date) {
          prayerProgress[p.name] = 100;
        } else {
          const remaining = end - now.getTime();
          prayerProgress[p.name] =
            (remaining / duration) * 100;
        }
      });

      // ---------- Main ring progress ----------
      const startTime = isFasting
        ? todayFajr
        : isha;

      const totalDuration =
        target.getTime() - startTime.getTime();

      const remainingMain =
        target.getTime() - now.getTime();

      const mainProgress =
        totalDuration > 0
          ? Math.min(
              100,
              Math.max(
                0,
                (remainingMain / totalDuration) * 100
              )
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

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [timings]);

  return state;
}