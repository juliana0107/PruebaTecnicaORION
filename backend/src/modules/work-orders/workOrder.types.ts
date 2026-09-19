export type WorkOrderType = 'PREVENTIVA' | 'CORRECTIVA';
export type WorkOrderPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type WorkOrderStatus =
  | 'PENDIENTE' | 'ASIGNADA' | 'EN_EJECUCION'
  | 'PAUSADA' | 'COMPLETADA' | 'CANCELADA';

export const WORK_ORDER_TYPES: readonly WorkOrderType[] = ['PREVENTIVA', 'CORRECTIVA'];
export const WORK_ORDER_PRIORITIES: readonly WorkOrderPriority[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
export const WORK_ORDER_STATUSES: readonly WorkOrderStatus[] = [
  'PENDIENTE', 'ASIGNADA', 'EN_EJECUCION', 'PAUSADA', 'COMPLETADA', 'CANCELADA',
];

export interface WorkOrder {
  id: string;
  code: string;
  asset_id: string;
  crew_id: string | null;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  description: string;
  scheduled_at: Date | null;
  started_at: Date | null;
  completed_at: Date | null;
  resolution: string | null;
  cancel_reason: string | null;
  created_at: Date;
  updated_at: Date;
}