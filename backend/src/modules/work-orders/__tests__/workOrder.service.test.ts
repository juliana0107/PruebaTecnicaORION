import { describe, it, expect, beforeEach, vi } from 'vitest';
import { workOrderService } from '../workOrder.service';
import { workOrderRepository } from '../workOrder.repository';
import { ConflictError, NotFoundError, BusinessRuleError } from '../../../shared/errors';
import { WorkOrder } from '../workOrder.types';

vi.mock('../workOrder.repository');
vi.mock('../../../config/database', () => ({
  default: {
    connect: vi.fn().mockResolvedValue({
      query: vi.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
      release: vi.fn(),
    }),
    query: vi.fn().mockResolvedValue({ rowCount: 1, rows: [{ status: 'OPERATIVO' }] }),
  },
}));

const mockedRepo = vi.mocked(workOrderRepository);

const sampleWO: WorkOrder = {
  id: '22222222-2222-2222-2222-222222222222',
  code: 'OT-PREV-2026-0001',
  asset_id: '11111111-1111-1111-1111-111111111111',
  crew_id: null,
  type: 'PREVENTIVA',
  priority: 'ALTA',
  status: 'PENDIENTE',
  description: 'Test',
  scheduled_at: null,
  started_at: null,
  completed_at: null,
  resolution: null,
  cancel_reason: null,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('workOrderService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('create', () => {
    it('crea OT con código único', async () => {
      mockedRepo.findByCode.mockResolvedValue(null);
      mockedRepo.create.mockResolvedValue(sampleWO);
      mockedRepo.addHistory.mockResolvedValue(undefined);

      const result = await workOrderService.create({
        code: sampleWO.code,
        asset_id: sampleWO.asset_id,
        type: 'PREVENTIVA',
        priority: 'ALTA',
        description: 'Test',
      });

      expect(result.status).toBe('PENDIENTE');
    });

    it('lanza ConflictError si el código existe', async () => {
      mockedRepo.findByCode.mockResolvedValue(sampleWO);

      await expect(
        workOrderService.create({
          code: sampleWO.code,
          asset_id: sampleWO.asset_id,
          type: 'PREVENTIVA',
          priority: 'ALTA',
          description: 'Test',
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('getById', () => {
    it('lanza NotFoundError si no existe', async () => {
      mockedRepo.findById.mockResolvedValue(null);
      await expect(workOrderService.getById('nope')).rejects.toThrow(NotFoundError);
    });
  });

  describe('state machine', () => {
    it('rechaza PENDIENTE → COMPLETADA', async () => {
      mockedRepo.findById.mockResolvedValue(sampleWO);

      await expect(
        workOrderService.complete(sampleWO.id, 'Resolución larga aquí'),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('rechaza PENDIENTE → EN_EJECUCION', async () => {
      mockedRepo.findById.mockResolvedValue(sampleWO);

      await expect(workOrderService.start(sampleWO.id)).rejects.toThrow(BusinessRuleError);
    });

    it('rechaza PAUSADA → COMPLETADA', async () => {
      mockedRepo.findById.mockResolvedValue({ ...sampleWO, status: 'PAUSADA' });

      await expect(
        workOrderService.complete(sampleWO.id, 'Resolución larga aquí'),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('rechaza cancelar una OT COMPLETADA', async () => {
      mockedRepo.findById.mockResolvedValue({ ...sampleWO, status: 'COMPLETADA' });

      await expect(
        workOrderService.cancel(sampleWO.id, 'Motivo de cancelación'),
      ).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('assignCrew', () => {
    it('rechaza asignar cuadrilla si no está en PENDIENTE', async () => {
      mockedRepo.findById.mockResolvedValue({ ...sampleWO, status: 'ASIGNADA' });

      await expect(
        workOrderService.assignCrew(sampleWO.id, '33333333-3333-3333-3333-333333333333'),
      ).rejects.toThrow(BusinessRuleError);
    });
  });
});