export type AssetStatus =
  | 'OPERATIVO'
  | 'EN_MANTENIMIENTO'
  | 'FUERA_DE_SERVICIO'
  | 'RETIRADO';

export type AssetCriticality = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export const ASSET_STATUSES: readonly AssetStatus[] = [
  'OPERATIVO',
  'EN_MANTENIMIENTO',
  'FUERA_DE_SERVICIO',
  'RETIRADO',
] as const;

export const ASSET_CRITICALITIES: readonly AssetCriticality[] = [
  'BAJA',
  'MEDIA',
  'ALTA',
  'CRITICA',
] as const;

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
  installed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AssetHistoryEntry {
  id: number;
  asset_id: string;
  change_type: string;
  description: string | null;
  previous_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  changed_at: Date;
}