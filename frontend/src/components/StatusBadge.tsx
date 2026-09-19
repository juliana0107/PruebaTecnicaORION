const STATUS_COLORS: Record<string, string> = {
  // Activos
  OPERATIVO: 'green',
  EN_MANTENIMIENTO: 'yellow',
  FUERA_DE_SERVICIO: 'red',
  RETIRADO: 'gray',
  // Órdenes de trabajo
  PENDIENTE: 'gray',
  ASIGNADA: 'blue',
  EN_EJECUCION: 'yellow',
  PAUSADA: 'orange',
  COMPLETADA: 'green',
  CANCELADA: 'red',
  // Cuadrillas
  DISPONIBLE: 'green',
  NO_DISPONIBLE: 'orange',
  INACTIVA: 'gray',
  // Prioridad
  BAJA: 'gray',
  MEDIA: 'blue',
  ALTA: 'orange',
  CRITICA: 'red',
};

interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const color = STATUS_COLORS[status] || 'gray';
  return <span className={`badge ${color}`}>{status}</span>;
}