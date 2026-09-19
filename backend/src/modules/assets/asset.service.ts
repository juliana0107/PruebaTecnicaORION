import pool from '../../config/database';
import { assetRepository } from './asset.repository';
import {
  CreateAssetInput,
  UpdateAssetInput,
  RetireAssetInput,
  ChangeStatusInput,
  ListAssetsQuery,
} from './asset.schema';
import { Asset, AssetHistoryEntry, AssetStatus } from './asset.types';
import {
  ConflictError,
  NotFoundError,
  BusinessRuleError,
} from '../../shared/errors';

/**
 * Mapa de transiciones válidas para el estado de un activo.
 * Refleja el ciclo de vida definido en HU-001.
 */
const ALLOWED_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  OPERATIVO: ['EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO', 'RETIRADO'],
  EN_MANTENIMIENTO: ['OPERATIVO', 'FUERA_DE_SERVICIO', 'RETIRADO'],
  FUERA_DE_SERVICIO: ['OPERATIVO', 'RETIRADO'],
  RETIRADO: [],
};

export const assetService = {
  async list(filters: ListAssetsQuery = {}): Promise<Asset[]> {
    return assetRepository.findAll(filters);
  },

  async getById(id: string): Promise<Asset> {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new NotFoundError('Activo');
    return asset;
  },

  async getHistory(id: string): Promise<AssetHistoryEntry[]> {
    await this.getById(id);
    return assetRepository.findHistory(id);
  },

  async create(data: CreateAssetInput): Promise<Asset> {
    const existing = await assetRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictError(`El código '${data.code}' ya está registrado`);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const asset = await assetRepository.create(data, client);
      await assetRepository.addHistory(
        {
          asset_id: asset.id,
          change_type: 'CREATED',
          description: 'Activo creado',
          new_value: asset.code,
        },
        client,
      );
      await client.query('COMMIT');
      return asset;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async update(id: string, data: UpdateAssetInput): Promise<Asset> {
    const current = await assetRepository.findById(id);
    if (!current) throw new NotFoundError('Activo');
    if (current.status === 'RETIRADO') {
      throw new BusinessRuleError('No se puede modificar un activo retirado');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updated = await assetRepository.update(id, data, client);
      if (!updated) throw new NotFoundError('Activo');
      await assetRepository.addHistory(
        {
          asset_id: id,
          change_type: 'UPDATED',
          description: 'Activo actualizado',
        },
        client,
      );
      await client.query('COMMIT');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async changeStatus(id: string, data: ChangeStatusInput): Promise<Asset> {
    const current = await assetRepository.findById(id);
    if (!current) throw new NotFoundError('Activo');

    const newStatus = data.status as AssetStatus;
    if (current.status === newStatus) {
      throw new BusinessRuleError(`El activo ya está en estado ${newStatus}`);
    }

    const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BusinessRuleError(
        `Transición no permitida: ${current.status} → ${newStatus}`,
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updated = await assetRepository.changeStatus(id, newStatus, client);
      if (!updated) throw new NotFoundError('Activo');

      await assetRepository.addHistory(
        {
          asset_id: id,
          change_type: 'STATUS_CHANGED',
          description: data.reason ?? `Cambio de estado a ${newStatus}`,
          previous_value: current.status,
          new_value: newStatus,
        },
        client,
      );
      await client.query('COMMIT');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async retire(id: string, data: RetireAssetInput): Promise<Asset> {
    return this.changeStatus(id, {
      status: 'RETIRADO',
      reason: data.reason,
    });
  },
};