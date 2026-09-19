export type CrewStatus = 'DISPONIBLE' | 'ASIGNADA' | 'EN_EJECUCION' | 'NO_DISPONIBLE' | 'INACTIVA';
export type CrewSpecialty = 'PMV' | 'CCTV' | 'METEO' | 'SENSORES' | 'AFORADORES' | 'GENERAL';

export const CREW_STATUSES: readonly CrewStatus[] = ['DISPONIBLE', 'ASIGNADA', 'EN_EJECUCION', 'NO_DISPONIBLE', 'INACTIVA'];
export const CREW_SPECIALTIES: readonly CrewSpecialty[] = ['PMV', 'CCTV', 'METEO', 'SENSORES', 'AFORADORES', 'GENERAL'];

export interface Crew {
  id: string;
  code: string;
  name: string;
  specialty: CrewSpecialty;
  zone: string;
  leader: string;
  status: CrewStatus;
  created_at: Date;
  updated_at: Date;
}