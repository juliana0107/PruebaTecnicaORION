import { PoolClient } from 'pg';
import pool from '../../config/database';
import { WorkOrder } from './workOrder.types';
import { CreateWorkOrderInput, ListWorkOrdersQuery } from './workOrder.schema';

export const workOrderRepository = {
  async findAll(filters: ListWorkOrdersQuery = {}): Promise<WorkOrder[]> {
    const conditions = ['1=1'];
    const values: unknown[] = [];
    let i = 1;
    if (filters.status) { conditions.push(`status = $${i++}`); values.push(filters.status); }
    if (filters.priority) { conditions.push(`priority = $${i++}`); values.push(filters.priority); }
    if (filters.type) { conditions.push(`type = $${i++}`); values.push(filters.type); }
    if (filters.asset_id) { conditions.push(`asset_id = $${i++}`); values.push(filters.asset_id); }

    const r = await pool.query<WorkOrder>(
      `SELECT * FROM work_orders WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      values,
    );
    return r.rows;
  },

  async findById(id: string, client?: PoolClient): Promise<WorkOrder | null> {
    const exec = client ?? pool;
    const r = await exec.query<WorkOrder>('SELECT * FROM work_orders WHERE id = $1', [id]);
    return r.rows[0] ?? null;
  },

  async findByCode(code: string): Promise<WorkOrder | null> {
    const r = await pool.query<WorkOrder>('SELECT * FROM work_orders WHERE code = $1', [code]);
    return r.rows[0] ?? null;
  },

  async create(data: CreateWorkOrderInput, client?: PoolClient): Promise<WorkOrder> {
    const exec = client ?? pool;
    const r = await exec.query<WorkOrder>(
      `INSERT INTO work_orders
        (code, asset_id, crew_id, type, priority, status, description, scheduled_at)
       VALUES ($1,$2,$3,$4,$5,'PENDIENTE',$6,$7) RETURNING *`,
      [
        data.code, data.asset_id, data.crew_id ?? null,
        data.type, data.priority, data.description, data.scheduled_at ?? null,
      ],
    );
    return r.rows[0];
  },

  async updateStatus(
    id: string, status: string, extra: Record<string, unknown> = {}, client?: PoolClient,
  ): Promise<WorkOrder | null> {
    const exec = client ?? pool;
    const fields = ['status = $1', 'updated_at = NOW()'];
    const values: unknown[] = [status];
    let i = 2;
    for (const [k, v] of Object.entries(extra)) {
      fields.push(`${k} = $${i++}`);
      values.push(v);
    }
    values.push(id);
    const r = await exec.query<WorkOrder>(
      `UPDATE work_orders SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ?? null;
  },

  async addHistory(payload: {
    work_order_id: string; change_type: string; description?: string;
    previous_value?: string; new_value?: string; changed_by?: string;
  }, client?: PoolClient): Promise<void> {
    const exec = client ?? pool;
    await exec.query(
      `INSERT INTO work_order_history
        (work_order_id, change_type, description, previous_value, new_value, changed_by)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        payload.work_order_id, payload.change_type,
        payload.description ?? null, payload.previous_value ?? null,
        payload.new_value ?? null, payload.changed_by ?? 'system',
      ],
    );
  },

  async findHistory(woId: string) {
    const r = await pool.query(
      'SELECT * FROM work_order_history WHERE work_order_id = $1 ORDER BY changed_at DESC',
      [woId],
    );
    return r.rows;
  },
};