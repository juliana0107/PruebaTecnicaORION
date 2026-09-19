export type AssetStatus = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO' | 'RETIRADO';
export type AssetCriticality = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Asset {
  id: string;
  code: string;
  name: string;
  asset_type_id: number;
  location_id: number | null;
  status: AssetStatus;
  criticality: AssetCriticality;
  latitude: number | null;
  longitude: number | null;
  installed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetType { id: number; code: string; name: string; }
export interface Location { id: number; code: string; name: string; }

export type WorkOrderStatus = 'PENDIENTE' | 'ASIGNADA' | 'EN_EJECUCION' | 'PAUSADA' | 'COMPLETADA' | 'CANCELADA';
export type WorkOrderType = 'PREVENTIVA' | 'CORRECTIVA';
export type WorkOrderPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface WorkOrder {
  id: string;
  code: string;
  asset_id: string;
  crew_id: string | null;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  description: string;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  resolution: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type CrewStatus = 'DISPONIBLE' | 'ASIGNADA' | 'EN_EJECUCION' | 'NO_DISPONIBLE' | 'INACTIVA';
export type CrewSpecialty = 'PMV' | 'CCTV' | 'METEO' | 'SENSORES' | 'AFORADORES' | 'GENERAL';

export interface Crew {
  id: string;
  code: string;
  name: string;
  specialty: CrewSpecialty;
  zone: string;
  leader: string;
  status: CrewStatus;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  assets: {
    total: number;
    byStatus: Record<string, number>;
    byType: Array<{ type: string; count: number }>;
  };
  workOrders: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  };
  crews: {
    total: number;
    byStatus: Record<string, number>;
    activeLoad: Array<{ crew_id: string; crew_name: string; active_orders: number }>;
  };
  generatedAt: string;
}

export type UserRole = 'SUPERVISOR' | 'COORDINATOR' | 'TECHNICIAN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}