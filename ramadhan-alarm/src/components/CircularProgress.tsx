interface Props {
  percentage: number;
}

export default function CircularProgress({ percentage }: Props) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;

  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  const offset =
    circumference - (safePercentage / 100) * circumference;

  return (
    <div
      className="ring-wrapper"
    >
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          stroke="#1e293b"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
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
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transition: "stroke-dashoffset 1s linear",
            filter: "drop-shadow(0 0 8px rgba(52, 211, 153, 0.6))"
          }}
        />
      </svg>
    </div>
  );
}