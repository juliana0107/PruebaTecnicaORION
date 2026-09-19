export const COLOR_HEX: Record<string, string> = {
  // Activos
  OPERATIVO: '#10b981',
  EN_MANTENIMIENTO: '#f59e0b',
  FUERA_DE_SERVICIO: '#ef4444',
  RETIRADO: '#94a3b8',
  // OT
  PENDIENTE: '#64748b',
  ASIGNADA: '#3b82f6',
  EN_EJECUCION: '#f59e0b',
  PAUSADA: '#fb923c',
  COMPLETADA: '#10b981',
  CANCELADA: '#ef4444',
  // Cuadrillas
  DISPONIBLE: '#10b981',
  NO_DISPONIBLE: '#f97316',
  INACTIVA: '#94a3b8',
  // Tipo OT
  PREVENTIVA: '#8b5cf6',
  CORRECTIVA: '#f59e0b',
  // Prioridad
  BAJA: '#94a3b8',
  MEDIA: '#3b82f6',
  ALTA: '#f97316',
  CRITICA: '#ef4444',
};

export type BarColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';

export function toBarColor(label: string): BarColor {
  const hex = COLOR_HEX[label];
  if (!hex) return 'blue';
  if (hex === '#10b981') return 'green';
  if (['#f59e0b', '#fb923c', '#f97316'].includes(hex)) return 'orange';
  if (hex === '#ef4444') return 'red';
  if (hex === '#8b5cf6') return 'purple';
  return 'blue';
}

export function formatLabel(label: string): string {
  return label.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}