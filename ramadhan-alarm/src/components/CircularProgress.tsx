interface Props {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export default function CircularProgress({
  percentage,
  size = 100,
  strokeWidth = 8,
  color = "#34d399",
  children
}: Props) {

  const radius = size / 2;
  const normalizedRadius = radius - strokeWidth;
  const circumference =
    normalizedRadius * 2 * Math.PI;

  const safePercentage = Math.min(
    Math.max(percentage, 0),
    100
  );

  const offset =
    circumference -
    (safePercentage / 100) * circumference;

  return (
    <div
      className="ring-wrapper"
      style={{ width: size, height: size }}
    >
      <svg
        height={size}
        width={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          stroke="rgba(255,255,255,0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transition: "stroke-dashoffset 1s linear"
          }}
        />
      </svg>

      {/* THIS IS WHAT YOU WERE MISSING */}
      <div className="ring-center">
        {children}
      </div>
    </div>
  );
}