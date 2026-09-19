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
  if (data.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{emptyMessage}</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bar-chart">
      {data.map((bar, i) => (
        <div className="bar-row" key={i}>
          <span className="bar-label" title={bar.label}>{bar.label}</span>
          <div className="bar-track">
            <div
              className={`bar-fill ${bar.color || 'blue'}`}
              style={{ width: `${(bar.value / max) * 100}%` }}
            />
          </div>
          <span className="bar-value">{bar.value}</span>
        </div>
      ))}
    </div>
  );
}