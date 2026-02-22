import { ReactNode } from "react";

interface Props {
  percentage: number;
  children: ReactNode;
}

export default function PrayerRing({
  percentage,
  children
}: Props) {
  const radius = 35;
  const stroke = 5;
  const normalized = radius - stroke;
  const circumference = normalized * 2 * Math.PI;
  const offset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="ring-wrapper">
      <svg width={70} height={70}>
        <circle
          stroke="rgba(255,255,255,0.15)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalized}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#34d399"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={normalized}
          cx={radius}
          cy={radius}
          style={{
            transition: "stroke-dashoffset 0.8s ease"
          }}
        />
      </svg>

      <div className="ring-content">
        {children}
      </div>
    </div>
  );
}