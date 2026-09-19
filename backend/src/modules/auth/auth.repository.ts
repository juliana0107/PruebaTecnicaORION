import pool from '../../config/database';
import { User } from './auth.types';

export const authRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const r = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return r.rows[0] ?? null;
  },
  async findById(id: string): Promise<User | null> {
    const r = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return r.rows[0] ?? null;
  },
};