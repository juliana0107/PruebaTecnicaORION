import { PoolClient } from 'pg';
import pool from '../../config/database';
import { Asset, AssetHistoryEntry } from './asset.types';
import { CreateAssetInput, UpdateAssetInput } from './asset.schema';

export interface HistoryPayload {
  asset_id: string;
  change_type: string;
  description?: string;
  previous_value?: string;
  new_value?: string;
  changed_by?: string;
}

/**
 * Repository: única capa que conoce SQL.
 * No aplica reglas de negocio.
 */
export const assetRepository = {
  async findAll(): Promise<Asset[]> {
    const result = await pool.query<Asset>(
      `SELECT * FROM assets
       WHERE status <> 'RETIRADO'
       ORDER BY created_at DESC`,
    );
    return result.rows;
  },

  async findById(id: string, client?: PoolClient): Promise<Asset | null> {
    const executor = client ?? pool;
    const result = await executor.query<Asset>(
      'SELECT * FROM assets WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  },

  async findByCode(code: string): Promise<Asset | null> {
    const result = await pool.query<Asset>(
      'SELECT * FROM assets WHERE code = $1',
      [code],
    );
    return result.rows[0] ?? null;
  },

  async create(data: CreateAssetInput, client?: PoolClient): Promise<Asset> {
    const executor = client ?? pool;
    const result = await executor.query<Asset>(
      `INSERT INTO assets
        (code, name, asset_type_id, location_id, status, criticality,
         latitude, longitude, installed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        data.code,
        data.name,
        data.asset_type_id,
        data.location_id ?? null,
        data.status ?? 'OPERATIVO',
        data.criticality ?? 'MEDIA',
        data.latitude ?? null,
        data.longitude ?? null,
        data.installed_at ?? null,
      ],
    );
    return result.rows[0];
  },

  async update(
    id: string,
    data: UpdateAssetInput,
    client?: PoolClient,
  ): Promise<Asset | null> {
    const executor = client ?? pool;
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
    }

    if (fields.length === 0) return this.findById(id, client);

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await executor.query<Asset>(
      `UPDATE assets SET ${fields.join(', ')}
       WHERE id = $${i}
       RETURNING *`,
      values,
    );
    return result.rows[0] ?? null;
  },

  async changeStatus(
    id: string,
    newStatus: string,
    client?: PoolClient,
  ): Promise<Asset | null> {
    const executor = client ?? pool;
    const result = await executor.query<Asset>(
      `UPDATE assets
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [newStatus, id],
    );
    return result.rows[0] ?? null;
  },

  async addHistory(payload: HistoryPayload, client?: PoolClient): Promise<void> {
    const executor = client ?? pool;
    await executor.query(
      `INSERT INTO asset_history
        (asset_id, change_type, description, previous_value, new_value, changed_by)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        payload.asset_id,
        payload.change_type,
        payload.description ?? null,
        payload.previous_value ?? null,
        payload.new_value ?? null,
        payload.changed_by ?? 'system',
      ],
    );
  },

  async findHistory(assetId: string): Promise<AssetHistoryEntry[]> {
    const result = await pool.query<AssetHistoryEntry>(
      `SELECT * FROM asset_history
       WHERE asset_id = $1
       ORDER BY changed_at DESC`,
      [assetId],
    );
    return result.rows;
  },
};