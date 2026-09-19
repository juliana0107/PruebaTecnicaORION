import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && (
        <button className="primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}