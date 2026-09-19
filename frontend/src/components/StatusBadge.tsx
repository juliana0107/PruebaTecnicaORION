import { formatLabel } from '../theme';

const STATUS_COLORS: Record<string, string> = {
  OPERATIVO: 'green',
  EN_MANTENIMIENTO: 'yellow',
  FUERA_DE_SERVICIO: 'red',
  RETIRADO: 'gray',
  PENDIENTE: 'gray',
  ASIGNADA: 'blue',
  EN_EJECUCION: 'yellow',
  PAUSADA: 'orange',
  COMPLETADA: 'green',
  CANCELADA: 'red',
  DISPONIBLE: 'green',
  NO_DISPONIBLE: 'orange',
  INACTIVA: 'gray',
  BAJA: 'gray',
  MEDIA: 'blue',
  ALTA: 'orange',
  CRITICA: 'red',
  PREVENTIVA: 'purple',
  CORRECTIVA: 'blue',
};

interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const color = STATUS_COLORS[status] ?? 'gray';
  const label = formatLabel(status);

  return (
    <span className={`badge ${color}`} title={label} role="status">
      {status.replace(/_/g, ' ')}
    </span>
  );
}