import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: number | string;
  variant?: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}

export function StatCard({ icon: Icon, label, value, variant = 'blue', onClick }: Props) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className={`icon-wrapper ${variant}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="stat-content">
        <div className="label">{label}</div>
        <div className="value">{value}</div>
      </div>
    </Component>
  );
}