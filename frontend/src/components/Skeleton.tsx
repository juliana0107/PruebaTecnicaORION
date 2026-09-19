export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Cargando contenido">
      <div className="skeleton skeleton-title" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="skeleton-dashboard" aria-busy="true" aria-label="Cargando dashboard">
      <div className="skeleton skeleton-title" />
      <div className="skeleton-grid-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
      <div className="skeleton-grid-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-chart" />
        ))}
      </div>
    </div>
  );
}