interface Props {
  percentage: number;
  isIftar?: boolean;
}

export default function MainRing({ percentage, isIftar }: Props) {
  const size = 200;
  const stroke = 16;
  const radius = size / 2 - stroke;
  const circumference = radius * 2 * Math.PI;

  const safe = Math.min(Math.max(percentage, 0), 100);
  const offset =
    circumference - (safe / 100) * circumference;

  return (
    <div className="main-ring-wrapper">
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <linearGradient id="mainGrad">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        <circle
          stroke="#1e293b"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        <circle
          stroke="url(#mainGrad)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className={isIftar ? "iftar-pulse" : ""}
          style={{
            transition: "stroke-dashoffset 1s linear"
          }}
        />
      </svg>
    </div>
  );
}