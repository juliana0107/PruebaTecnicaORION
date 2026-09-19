import { describe, it, expect, beforeEach, vi } from 'vitest';
import { assetService } from '../asset.service';
import { assetRepository } from '../asset.repository';
import {
  ConflictError,
  NotFoundError,
  BusinessRuleError,
} from '../../../shared/errors';
import { Asset } from '../asset.types';

vi.mock('../asset.repository');
vi.mock('../../../config/database', () => ({
  default: {
    connect: vi.fn().mockResolvedValue({
      query: vi.fn(),
      release: vi.fn(),
    }),
    query: vi.fn(),
  },
}));

const mockedRepo = vi.mocked(assetRepository);

const sampleAsset: Asset = {
  id: '11111111-1111-1111-1111-111111111111',
  code: 'PMV-COR1-001',
  name: 'PMV Corredor 1',
  asset_type_id: 1,
  location_id: 1,
  status: 'OPERATIVO',
  criticality: 'ALTA',
  latitude: null,
  longitude: null,
  installed_at: null,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('assetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('crea un activo cuando el código es único', async () => {
      mockedRepo.findByCode.mockResolvedValue(null);
      mockedRepo.create.mockResolvedValue(sampleAsset);
      mockedRepo.addHistory.mockResolvedValue(undefined);

      const result = await assetService.create({
        code: sampleAsset.code,
        name: sampleAsset.name,
        asset_type_id: 1,
      });

      expect(result).toEqual(sampleAsset);
      expect(mockedRepo.addHistory).toHaveBeenCalledWith(
        expect.objectContaining({ change_type: 'CREATED' }),
        expect.anything(),
      );
    });

    it('lanza ConflictError si el código ya existe', async () => {
      mockedRepo.findByCode.mockResolvedValue(sampleAsset);

      await expect(
        assetService.create({
          code: sampleAsset.code,
          name: 'Otro',
          asset_type_id: 1,
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('getById', () => {
    it('retorna el activo si existe', async () => {
      mockedRepo.findById.mockResolvedValue(sampleAsset);

      const result = await assetService.getById(sampleAsset.id);

      expect(result).toEqual(sampleAsset);
    });

    it('lanza NotFoundError si no existe', async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(assetService.getById('no-existe')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('changeStatus', () => {
    it('permite OPERATIVO → EN_MANTENIMIENTO', async () => {
      mockedRepo.findById.mockResolvedValue(sampleAsset);
      mockedRepo.changeStatus.mockResolvedValue({
        ...sampleAsset,
        status: 'EN_MANTENIMIENTO',
      });
      mockedRepo.addHistory.mockResolvedValue(undefined);

      const result = await assetService.changeStatus(sampleAsset.id, {
        status: 'EN_MANTENIMIENTO',
        reason: 'Mantenimiento preventivo',
      });

      expect(result.status).toBe('EN_MANTENIMIENTO');
    });

    it('rechaza RETIRADO → OPERATIVO', async () => {
      mockedRepo.findById.mockResolvedValue({
        ...sampleAsset,
        status: 'RETIRADO',
      });

      await expect(
        assetService.changeStatus(sampleAsset.id, { status: 'OPERATIVO' }),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('rechaza OPERATIVO → OPERATIVO (mismo estado)', async () => {
      mockedRepo.findById.mockResolvedValue(sampleAsset);

      await expect(
        assetService.changeStatus(sampleAsset.id, { status: 'OPERATIVO' }),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('rechaza FUERA_DE_SERVICIO → EN_MANTENIMIENTO', async () => {
      mockedRepo.findById.mockResolvedValue({
        ...sampleAsset,
        status: 'FUERA_DE_SERVICIO',
      });

      await expect(
        assetService.changeStatus(sampleAsset.id, {
          status: 'EN_MANTENIMIENTO',
        }),
      ).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('update', () => {
    it('rechaza modificar un activo RETIRADO', async () => {
      mockedRepo.findById.mockResolvedValue({
        ...sampleAsset,
        status: 'RETIRADO',
      });

      await expect(
        assetService.update(sampleAsset.id, { name: 'Nuevo' }),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('lanza NotFoundError si el activo no existe', async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(
        assetService.update('no-existe', { name: 'Nuevo' }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});