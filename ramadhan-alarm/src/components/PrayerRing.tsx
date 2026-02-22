interface Props {
  percentage: number;
  children?: React.ReactNode;
}

export default function PrayerRing({
  percentage,
  children
}: Props) {
  const size = 90;
  const stroke = 6;
  const radius = size / 2 - stroke;
  const circumference = radius * 2 * Math.PI;

  const safe = Math.min(Math.max(percentage, 0), 100);
  const offset =
    circumference - (safe / 100) * circumference;

  return (
    <div className="ring-wrapper">
      <svg width={size} height={size}>
        <circle
          stroke="#1e293b"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#34d399"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: "stroke-dashoffset 1s linear"
          }}
        />
      </svg>

      <div className="ring-content">
        {children}
      </div>
    </div>
  );
}