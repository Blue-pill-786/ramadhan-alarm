import { useEffect, useMemo, useState } from "react";
import useGeolocation from "./hooks/useGeolocation";
import usePrayerEngine from "./hooks/usePrayerEngine";
import { fetchPrayerTimes } from "./services/prayerService";
import { PRAYER_NAMES } from "./types/prayer";
import type { PrayerData } from "./types/prayer";
import PrayerRing from "./components/PrayerRing";
import MainRing from "./components/MainRing";
import "./App.css";

function App() {
  const location = useGeolocation();
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prayer data
  useEffect(() => {
    if (!location) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchPrayerTimes(location.lat, location.lon)
      .then(setData)
      .catch(() => setError("Unable to fetch prayer timings"))
      .finally(() => setLoading(false));
  }, [location]);

  const engine = usePrayerEngine(data?.timings ?? null);

  // Dynamic sky theme class
  const skyClass = engine
    ? `sky-${engine.currentPrayer.toLowerCase()}`
    : "sky-isha";

  // Gregorian date
  const gregorianDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, []);

  const isRamadan =
    data?.hijri.month.toLowerCase() === "ramadan";

  return (
    <div className={`app-container ${skyClass}`}>
      {/* HEADER */}
      <header className="header">
        <h1>🌙 Ramadhan Dashboard</h1>

        <p className="gregorian-date">
          {gregorianDate}
        </p>

        {data && (
          <p className="hijri-date">
            {data.hijri.day} {data.hijri.month}{" "}
            {data.hijri.year} AH
          </p>
        )}

        {isRamadan && data && (
          <p className="ramadan-badge">
            🌙 Ramadan Day {data.hijri.day}
          </p>
        )}
      </header>

      {/* LOADING */}
      {loading && (
        <div className="state-message">
          Fetching prayer timings...
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="state-message error">
          {error}
        </div>
      )}

      {/* MAIN CONTENT */}
      {!loading && !error && data && engine && (
        <>
          {/* MAIN COUNTDOWN */}
          <section className="main-ring-section">
            <h3>
              {engine.isFasting
                ? "🌇 Iftar Countdown"
                : "🌅 Sehri Countdown"}
            </h3>

            <MainRing
              percentage={engine.mainProgress}
              isIftar={engine.isFasting}
            />

            <p className="main-countdown">
              {engine.timeLeft}
            </p>
          </section>

          {/* PRAYER GRID */}
          <section className="prayer-grid">
            {PRAYER_NAMES.map((name) => {
              const isActive =
                engine.currentPrayer === name;

              return (
                <div
                  key={name}
                  className={`prayer-card ${
                    isActive ? "active" : ""
                  }`}
                >
                  <PrayerRing
                    percentage={
                      engine.prayerProgress[name] ?? 0
                    }
                  >
                    <div className="prayer-name">
                      {name}
                    </div>
                    <div className="prayer-time">
                      {data.timings[name]}
                    </div>
                  </PrayerRing>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

export default App;