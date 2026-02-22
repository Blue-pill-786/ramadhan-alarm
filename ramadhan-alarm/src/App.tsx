import { useEffect, useState } from "react";
import useGeolocation from "./hooks/useGeolocation";
import usePrayerEngine from "./hooks/usePrayerEngine";
import { fetchPrayerTimes } from "./services/prayerService";
import { PRAYER_NAMES } from "./types/prayer";
import type { PrayerData } from "./types/prayer";
import CircularProgress from "./components/CircularProgress";
import "./App.css";

function App() {
  const location = useGeolocation();
  const [data, setData] =
    useState<PrayerData | null>(null);
  const [error, setError] =
    useState<boolean>(false);

  // Fetch data
  useEffect(() => {
    if (!location) return;

    fetchPrayerTimes(location.lat, location.lon)
      .then((res) => {
        setData(res);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setData(null);
      });
  }, [location]);

  const engine = usePrayerEngine(
    data?.timings ?? null
  );

  /* =========================
     LOADING STATE
  ========================= */

  if (!location) {
    return (
      <div className="app-container sky-isha">
        <div className="content-wrapper">
          <div className="state-message">
            Waiting for location permission...
          </div>
        </div>
      </div>
    );
  }

  if (!data || !engine) {
    return (
      <div className="app-container sky-isha">
        <div className="content-wrapper">

          <div className="header">
            <h1>🌙 Ramadhan Dashboard</h1>
          </div>

          <div className="main-ring-section">
            <div className="skeleton skeleton-circle"></div>
          </div>

          <div className="prayer-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="prayer-card skeleton skeleton-card"
              />
            ))}
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container sky-isha">
        <div className="content-wrapper">
          <div className="state-message error">
            Unable to fetch prayer timings.
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================= */

  const skyClass = `sky-${engine.currentPrayer.toLowerCase()}`;

  const isRamadan =
    data.hijri.month.toLowerCase() === "ramadan";

  return (
    <div className={`app-container ${skyClass}`}>
      <div className="content-wrapper">

        {/* HEADER */}
        <div className="header">
          <h1>🌙 Ramadhan Dashboard</h1>

          <p>
            {data.hijri.day} {data.hijri.month}{" "}
            {data.hijri.year} AH
          </p>

          {isRamadan && (
            <p>Ramadan Day {data.hijri.day}</p>
          )}
        </div>

        {/* MAIN COUNTDOWN */}
        <div className="main-ring-section">
          <h3>
            {engine.isFasting
              ? "🌇 Iftar Countdown"
              : "🌅 Sehri Countdown"}
          </h3>

          <CircularProgress
            percentage={engine.mainProgress}
            size={170}
            strokeWidth={12}
            color={
              engine.isFasting
                ? "#f97316"
                : "#22d3ee"
            }
          >
            <div>
              <div>{engine.timeLeft}</div>
            </div>
          </CircularProgress>

          <p>
            Tahajjud starts at {engine.tahajjudTime}
          </p>
        </div>

        {/* PRAYER GRID */}
        <div className="prayer-grid">
          {PRAYER_NAMES.map((name) => (
            <div
              key={name}
              className={`prayer-card ${
                engine.currentPrayer === name
                  ? "active"
                  : ""
              }`}
            >
              <CircularProgress
                percentage={
                  engine.prayerProgress[name] ?? 0
                }
                size={90}
                strokeWidth={6}
              >
                <div>
                  <div>{name}</div>

                  {name !== "Tahajjud" && (
                    <div>
                      {data.timings[name]}
                    </div>
                  )}
                </div>
              </CircularProgress>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;