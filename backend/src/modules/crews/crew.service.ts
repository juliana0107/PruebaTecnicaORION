import { crewRepository } from './crew.repository';
import { CreateCrewInput, UpdateCrewInput } from './crew.schema';
import { Crew, CrewStatus } from './crew.types';
import { ConflictError, NotFoundError, BusinessRuleError } from '../../shared/errors';

const ALLOWED_TRANSITIONS: Record<CrewStatus, CrewStatus[]> = {
  DISPONIBLE: ['ASIGNADA', 'NO_DISPONIBLE', 'INACTIVA'],
  ASIGNADA: ['EN_EJECUCION', 'DISPONIBLE', 'NO_DISPONIBLE'],
  EN_EJECUCION: ['DISPONIBLE', 'NO_DISPONIBLE'],
  NO_DISPONIBLE: ['DISPONIBLE', 'INACTIVA'],
  INACTIVA: [],
};

export const crewService = {
  list: (): Promise<Crew[]> => crewRepository.findAll(),

  async getById(id: string): Promise<Crew> {
    const crew = await crewRepository.findById(id);
    if (!crew) throw new NotFoundError('Cuadrilla');
    return crew;
  },

  async create(data: CreateCrewInput): Promise<Crew> {
    const existing = await crewRepository.findByCode(data.code);
    if (existing) throw new ConflictError(`El código '${data.code}' ya existe`);
    return crewRepository.create(data);
  },

  async update(id: string, data: UpdateCrewInput): Promise<Crew> {
    const current = await this.getById(id);
    if (current.status === 'INACTIVA') {
      throw new BusinessRuleError('No se puede modificar una cuadrilla inactiva');
    }
    if (current.status === 'EN_EJECUCION') {
      throw new BusinessRuleError('No se puede modificar una cuadrilla en ejecución');
    }
    const updated = await crewRepository.update(id, data);
    if (!updated) throw new NotFoundError('Cuadrilla');
    return updated;
  },

  async changeStatus(id: string, newStatus: CrewStatus): Promise<Crew> {
    const current = await this.getById(id);
    if (current.status === newStatus) {
      throw new BusinessRuleError(`La cuadrilla ya está en estado ${newStatus}`);
    }
    const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BusinessRuleError(`Transición no permitida: ${current.status} → ${newStatus}`);
    }
    const updated = await crewRepository.changeStatus(id, newStatus);
    if (!updated) throw new NotFoundError('Cuadrilla');
    return updated;
  },

  async retire(id: string): Promise<Crew> {
    return this.changeStatus(id, 'INACTIVA');
  },
};