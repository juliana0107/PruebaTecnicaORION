import { useMemo } from 'react';
import type { CSSProperties } from 'react';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Segment[];
  size?: number;
  thickness?: number;
  total?: number;
}

interface ComputedSegment extends Segment {
  dash: number;
  offset: number;
}

export function DonutChart({ data, size = 140, thickness = 18, total }: Props) {
  const computedTotal = useMemo(
    () => total ?? data.reduce((acc, d) => acc + d.value, 0),
    [data, total],
  );

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo<ComputedSegment[]>(() => {
    if (computedTotal === 0) return [];
    let offset = 0;
    return data
      .filter((d) => d.value > 0)
      .map((d) => {
        const ratio = d.value / computedTotal;
        const dash = ratio * circumference;
        const seg: ComputedSegment = { ...d, dash, offset };
        offset += dash;
        return seg;
      });
  }, [data, computedTotal, circumference]);

  const ariaLabel = data
    .map((d) => `${d.label}: ${d.value}`)
    .join(', ');

  if (computedTotal === 0) {
    return (
      <div className="donut-wrapper">
        <svg width={size} height={size} className="donut-svg" role="img" aria-label="Sin datos">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={thickness}
          />
        </svg>
        <div className="donut-legend">
          <p className="empty-chart-message">Sin datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donut-wrapper">
      <div className="donut-visual">
        <svg
          width={size}
          height={size}
          className="donut-svg"
          style={{ transform: 'rotate(-90deg)' }}
          role="img"
          aria-label={`Distribución: ${ariaLabel}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={thickness}
          />
          {segments.map((s) => (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="donut-center">
          <div className="donut-center-value">{computedTotal}</div>
          <div className="donut-center-label">Total</div>
        </div>
      </div>

      <div className="donut-legend">
        {data.map((d) => {
          const dotStyle: CSSProperties = { background: d.color };
          return (
            <div key={d.label} className="donut-legend-item">
              <span className="donut-legend-dot" style={dotStyle} />
              <span className="donut-legend-label">{d.label}</span>
              <span className="donut-legend-value">{d.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}