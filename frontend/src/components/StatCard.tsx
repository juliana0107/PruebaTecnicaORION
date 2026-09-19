import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: number | string;
  variant?: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatCard({ icon: Icon, label, value, variant = 'blue' }: Props) {
  return (
    <div className="stat-card">
      <div className={`icon-wrapper ${variant}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}