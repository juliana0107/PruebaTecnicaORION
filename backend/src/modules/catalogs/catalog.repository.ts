import pool from '../../config/database';

export interface AssetType {
  id: number;
  code: string;
  name: string;
}

export interface Location {
  id: number;
  code: string;
  name: string;
}

export const catalogRepository = {
  async findAssetTypes(): Promise<AssetType[]> {
    const result = await pool.query<AssetType>(
      'SELECT id, code, name FROM asset_types ORDER BY name',
    );
    return result.rows;
  },

  async findLocations(): Promise<Location[]> {
    const result = await pool.query<Location>(
      'SELECT id, code, name FROM locations ORDER BY name',
    );
    return result.rows;
  },
};