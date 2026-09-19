import { useMemo } from 'react';
import type { CSSProperties } from 'react';

interface Bar {
  label: string;
  value: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

interface Props {
  data: Bar[];
  emptyMessage?: string;
}

export function BarChart({ data, emptyMessage = 'Sin datos' }: Props) {
  const max = useMemo(
    () => Math.max(...data.map((d) => d.value), 1),
    [data],
  );

  if (data.length === 0) {
    return <p className="empty-chart-message">{emptyMessage}</p>;
  }

  return (
    <div className="bar-chart" role="list" aria-label="Gráfico de barras">
      {data.map((bar) => {
        const width = `${(bar.value / max) * 100}%`;
        const style: CSSProperties = { width };

        return (
          <div className="bar-row" key={bar.label} role="listitem">
            <span className="bar-label" title={bar.label}>
              {bar.label}
            </span>
            <div className="bar-track">
              <div
                className={`bar-fill ${bar.color ?? 'blue'}`}
                style={style}
                aria-label={`${bar.label}: ${bar.value}`}
              />
            </div>
            <span className="bar-value">{bar.value}</span>
          </div>
        );
      })}
    </div>
  );
}