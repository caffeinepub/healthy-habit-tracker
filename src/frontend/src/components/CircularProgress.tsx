interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  emoji?: string;
  completed?: boolean;
}

export default function CircularProgress({
  value,
  size = 88,
  strokeWidth = 8,
  label,
  sublabel,
  emoji,
}: CircularProgressProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value, 100) / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
          role="img"
          aria-label={
            label
              ? `${label} progress: ${Math.round(value)}%`
              : `Progress: ${Math.round(value)}%`
          }
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="oklch(0.88 0.05 168)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="oklch(0.63 0.13 172)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {emoji ? (
            <span className="text-xl leading-none">{emoji}</span>
          ) : (
            <span className="text-sm font-bold text-foreground">
              {Math.round(value)}%
            </span>
          )}
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[80px]">
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
