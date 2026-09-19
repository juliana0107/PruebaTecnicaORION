import { describe, it, expect, beforeEach, vi } from 'vitest';
import { crewService } from '../crew.service';
import { crewRepository } from '../crew.repository';
import { ConflictError, NotFoundError, BusinessRuleError } from '../../../shared/errors';
import { Crew } from '../crew.types';

vi.mock('../crew.repository');

const mockedRepo = vi.mocked(crewRepository);

const sampleCrew: Crew = {
  id: '33333333-3333-3333-3333-333333333333',
  code: 'CUA-COR1-001',
  name: 'Cuadrilla PMV',
  specialty: 'PMV',
  zone: 'COR1',
  leader: 'Juan Pérez',
  status: 'DISPONIBLE',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('crewService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('crea cuadrilla con código único', async () => {
    mockedRepo.findByCode.mockResolvedValue(null);
    mockedRepo.create.mockResolvedValue(sampleCrew);
    const result = await crewService.create({
      code: sampleCrew.code, name: sampleCrew.name,
      specialty: 'PMV', zone: 'COR1', leader: 'Juan Pérez',
    });
    expect(result.status).toBe('DISPONIBLE');
  });

  it('lanza ConflictError si el código existe', async () => {
    mockedRepo.findByCode.mockResolvedValue(sampleCrew);
    await expect(
      crewService.create({ code: sampleCrew.code, name: 'X', specialty: 'PMV', zone: 'COR1', leader: 'Y' }),
    ).rejects.toThrow(ConflictError);
  });

  it('lanza NotFoundError si no existe', async () => {
    mockedRepo.findById.mockResolvedValue(null);
    await expect(crewService.getById('nope')).rejects.toThrow(NotFoundError);
  });

  it('rechaza modificar cuadrilla INACTIVA', async () => {
    mockedRepo.findById.mockResolvedValue({ ...sampleCrew, status: 'INACTIVA' });
    await expect(crewService.update(sampleCrew.id, { name: 'Nuevo' })).rejects.toThrow(BusinessRuleError);
  });

  it('rechaza cambiar estado de cuadrilla INACTIVA', async () => {
    mockedRepo.findById.mockResolvedValue({ ...sampleCrew, status: 'INACTIVA' });
    await expect(crewService.changeStatus(sampleCrew.id, 'DISPONIBLE')).rejects.toThrow(BusinessRuleError);
  });

  it('rechaza DISPONIBLE → EN_EJECUCION (transición inválida)', async () => {
    mockedRepo.findById.mockResolvedValue(sampleCrew);
    await expect(crewService.changeStatus(sampleCrew.id, 'EN_EJECUCION')).rejects.toThrow(BusinessRuleError);
  });
});