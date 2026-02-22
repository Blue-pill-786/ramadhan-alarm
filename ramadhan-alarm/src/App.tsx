import useGeolocation from "./hooks/useGeolocation";
import { fetchPrayerTimes } from "./services/prayerService";
import usePrayerEngine from "./hooks/usePrayerEngine";
import PrayerRing from "./components/PrayerRing";
import MainRing from "./components/MainRing";
import { useEffect, useState } from "react";
import type { PrayerData } from "./types/prayer";
import "./App.css";

function App() {
  const location = useGeolocation();
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location) {
      setLoading(true);
      fetchPrayerTimes(location.lat, location.lon)
        .then((res) => setData(res))
        .finally(() => setLoading(false));
    }
  }, [location]);

  const engine = usePrayerEngine(data?.timings ?? null);

  const isFasting =
    engine &&
    ["Fajr", "Dhuhr", "Asr"].includes(engine.currentPrayer);

  return (
    <div className="app-container">
      <h1 className="app-title">🌙 Ramadhan Dashboard</h1>

      {loading && (
        <div className="skeleton-wrapper">
          <div className="skeleton-main-ring" />
          <div className="skeleton-grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      )}

      {!loading && data && engine && (
        <>
          <div className="main-ring-section">
            <h3 className="section-title">
              {isFasting
                ? "🌇 Iftar Countdown"
                : "🌅 Sehri Countdown"}
            </h3>

            <MainRing
              percentage={engine.mainProgress}
              isIftar={isFasting}
            />

            <p
              key={engine.timeLeft}
              className="main-countdown fade-change"
            >
              {engine.timeLeft}
            </p>
          </div>

          <div className="prayer-grid">
            {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map(
              (name) => (
                <div key={name} className="prayer-card">
                  <PrayerRing
                    percentage={
                      engine.prayerProgress[name] || 0
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
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;