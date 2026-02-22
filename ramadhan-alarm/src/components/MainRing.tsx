interface Props {
  percentage: number;
  isIftar: boolean;
}

export default function MainRing({
  percentage,
  isIftar
}: Props) {
  const radius = 75;
  const stroke = 8;
  const normalized = radius - stroke;
  const circumference = normalized * 2 * Math.PI;
  const offset =
    circumference - (percentage / 100) * circumference;

  return (
    <svg width={150} height={150}>
      <circle
        stroke="rgba(255,255,255,0.15)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalized}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={isIftar ? "#f97316" : "#22d3ee"}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={normalized}
        cx={radius}
        cy={radius}
        style={{
          transition: "stroke-dashoffset 1s linear"
        }}
      />
    </svg>
  );
}