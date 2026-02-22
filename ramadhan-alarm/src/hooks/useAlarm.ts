import { useEffect } from "react";
import { sendNotification } from "../services/notificationService";

export default function useAlarm(
  targetTime: string | null,
  label: string
) {
  useEffect(() => {
    if (!targetTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = targetTime.split(":").map(Number);

      if (
        now.getHours() === hours &&
        now.getMinutes() === minutes &&
        now.getSeconds() === 0
      ) {
        sendNotification(label, `${label} time has started.`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, label]);
}