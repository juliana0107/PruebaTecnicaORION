import { PoolClient } from 'pg';
import pool from '../../config/database';
import { Crew } from './crew.types';
import { CreateCrewInput, UpdateCrewInput } from './crew.schema';

export const crewRepository = {
  async findAll(): Promise<Crew[]> {
    const r = await pool.query<Crew>(`SELECT * FROM crews WHERE status <> 'INACTIVA' ORDER BY created_at DESC`);
    return r.rows;
  },
  async findById(id: string, client?: PoolClient): Promise<Crew | null> {
    const exec = client ?? pool;
    const r = await exec.query<Crew>('SELECT * FROM crews WHERE id = $1', [id]);
    return r.rows[0] ?? null;
  },
  async findByCode(code: string): Promise<Crew | null> {
    const r = await pool.query<Crew>('SELECT * FROM crews WHERE code = $1', [code]);
    return r.rows[0] ?? null;
  },
  async create(data: CreateCrewInput, client?: PoolClient): Promise<Crew> {
    const exec = client ?? pool;
    const r = await exec.query<Crew>(
      `INSERT INTO crews (code, name, specialty, zone, leader)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.code, data.name, data.specialty, data.zone, data.leader],
    );
    return r.rows[0];
  },
  async update(id: string, data: UpdateCrewInput, client?: PoolClient): Promise<Crew | null> {
    const exec = client ?? pool;
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) { fields.push(`${k} = $${i++}`); values.push(v); }
    }
    if (fields.length === 0) return this.findById(id, client);
    fields.push('updated_at = NOW()');
    values.push(id);
    const r = await exec.query<Crew>(
      `UPDATE crews SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values,
    );
    return r.rows[0] ?? null;
  },
  async changeStatus(id: string, status: string, client?: PoolClient): Promise<Crew | null> {
    const exec = client ?? pool;
    const r = await exec.query<Crew>(
      `UPDATE crews SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id],
    );
    return r.rows[0] ?? null;
  },
};