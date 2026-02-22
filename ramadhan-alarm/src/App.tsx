import { useEffect, useState } from "react";
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

  // Fetch prayer + hijri data
  useEffect(() => {
    if (!location) return;

    setLoading(true);

    fetchPrayerTimes(location.lat, location.lon)
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [location]);

  const engine = usePrayerEngine(data?.timings ?? null);

  if (loading) {
    return (
      <div className="app-container">
        <h1>🌙 Ramadhan Dashboard</h1>
        <p className="loading">Fetching prayer timings...</p>
      </div>
    );
  }

  if (!data || !engine) {
    return (
      <div className="app-container">
        <h1>🌙 Ramadhan Dashboard</h1>
        <p className="loading">
          Unable to load data.
        </p>
      </div>
    );
  }

  const isRamadan =
    data.hijri.month === "Ramadan";

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <h1>🌙 Ramadhan Dashboard</h1>

        <p className="hijri-date">
          {data.hijri.day} {data.hijri.month}{" "}
          {data.hijri.year} AH
        </p>

        {isRamadan && (
          <p className="ramadan-badge">
            🌙 Ramadan Day {data.hijri.day}
          </p>
        )}
      </div>

      {/* Main Iftar / Sehri Countdown */}
      <div className="main-ring-section">
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
      </div>

      {/* Prayer Grid */}
      <div className="prayer-grid">
        {PRAYER_NAMES.map((name) => (
          <div key={name} className="prayer-card">
            <PrayerRing
              percentage={engine.prayerProgress[name]}
            >
              <div className="prayer-name">
                {name}
              </div>
              <div className="prayer-time">
                {data.timings[name]}
              </div>
            </PrayerRing>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;