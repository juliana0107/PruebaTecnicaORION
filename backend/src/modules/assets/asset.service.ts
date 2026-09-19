import pool from '../../config/database';
import { assetRepository } from './asset.repository';
import {
  CreateAssetInput,
  UpdateAssetInput,
  RetireAssetInput,
} from './asset.schema';
import { Asset, AssetHistoryEntry } from './asset.types';
import { ConflictError, NotFoundError, BusinessRuleError } from '../../shared/errors';

export const assetService = {
  async list(): Promise<Asset[]> {
    return assetRepository.findAll();
  },

  async getById(id: string): Promise<Asset> {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new NotFoundError('Activo');
    return asset;
  },

  async getHistory(id: string): Promise<AssetHistoryEntry[]> {
    await this.getById(id); // valida existencia
    return assetRepository.findHistory(id);
  },

  async create(data: CreateAssetInput): Promise<Asset> {
    const existing = await assetRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictError(`El código '${data.code}' ya está registrado`);
    }

    // Transacción: crear activo + registrar historial atómicamente
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

  async retire(id: string, data: RetireAssetInput): Promise<Asset> {
    const current = await assetRepository.findById(id);
    if (!current) throw new NotFoundError('Activo');

    if (current.status === 'RETIRADO') {
      throw new BusinessRuleError('El activo ya está retirado');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updated = await assetRepository.changeStatus(id, 'RETIRADO', client);
      if (!updated) throw new NotFoundError('Activo');

      await assetRepository.addHistory(
        {
          asset_id: id,
          change_type: 'RETIRED',
          description: data.reason ?? 'Baja lógica del activo',
          previous_value: current.status,
          new_value: 'RETIRADO',
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
};