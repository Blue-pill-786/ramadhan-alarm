import useGeolocation from "./hooks/useGeolocation";
import { fetchPrayerTimes } from "./services/prayerService";
import usePrayerEngine from "./hooks/usePrayerEngine";
import CircularProgress from "./components/CircularProgress";
import { useEffect, useState } from "react";
import type { PrayerData } from "./types/prayer";
import "./App.css";

function App() {
  const location = useGeolocation();
  const [data, setData] = useState<PrayerData | null>(null);

  useEffect(() => {
    if (location) {
      fetchPrayerTimes(location.lat, location.lon)
        .then(setData);
    }
  }, [location]);

  const engine = usePrayerEngine(data?.timings ?? null);

  const fastingPrayers = ["Fajr", "Dhuhr", "Asr"];
  const isFasting =
    engine && fastingPrayers.includes(engine.currentPrayer);

  return (
    <div className="app-container">
      <div className="header">
        <h1>🌙 Ramadhan Dashboard</h1>

        {data && (
          <p className="hijri">
            {data.hijri.day} {data.hijri.month.en} {data.hijri.year} AH
          </p>
        )}

        {data?.hijri.month.en === "Ramadan" && (
          <p className="ramadan-day">
            🌙 Ramadan Day {data.hijri.day}
          </p>
        )}
      </div>

      {data && (
        <>
          <div className="section">
            <div className="section-title">
              Today's Prayers
            </div>

            <div className="prayer-grid">
              {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((name) => (
                <div
                  key={name}
                  className={`prayer-card
                    ${engine?.currentPrayer === name ? "active" : ""}
                    ${name === "Fajr" || name === "Maghrib" ? "highlight" : ""}
                  `}
                >
                  <div className="prayer-name">{name}</div>
                  <div className="prayer-time">
                    {data.timings[name]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {engine && (
            <div className="section countdown">
              <div className="section-title">
                ⏳ Next Prayer: {engine.nextPrayer}
              </div>

              <div className="progress-ring">
                <CircularProgress
                  percentage={engine.progress}
                />
              </div>

              <div className="countdown-time">
                {engine.timeLeft}
              </div>
            </div>
          )}

          {isFasting && (
            <div className="section fasting-progress">
              🌅 Fasting in progress  
              <br />
              Iftar at {data.timings.Maghrib}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;