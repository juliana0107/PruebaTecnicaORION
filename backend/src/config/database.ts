import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://orion_user:orion_password@localhost:5432/orion_maintenance',
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL', err);
});

export default pool;