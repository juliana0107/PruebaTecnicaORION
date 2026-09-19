import pool from '../../config/database';

async function countByField(table: string, field: string): Promise<Record<string, number>> {
  const r = await pool.query(`SELECT ${field} AS k, COUNT(*)::int AS c FROM ${table} GROUP BY ${field}`);
  return r.rows.reduce((acc, row) => ({ ...acc, [row.k]: row.c }), {});
}

export const dashboardRepository = {
  async getAssetStats() {
    const totalR = await pool.query(`SELECT COUNT(*)::int AS c FROM assets WHERE status <> 'RETIRADO'`);
    const byStatus = await countByField('assets', 'status');
    const byTypeR = await pool.query(
      `SELECT at.name AS type, COUNT(*)::int AS count
       FROM assets a JOIN asset_types at ON at.id = a.asset_type_id
       WHERE a.status <> 'RETIRADO'
       GROUP BY at.name ORDER BY count DESC`,
    );
    return { total: totalR.rows[0].c, byStatus, byType: byTypeR.rows };
  },

  async getWorkOrderStats() {
    const totalR = await pool.query(`SELECT COUNT(*)::int AS c FROM work_orders`);
    const byStatus = await countByField('work_orders', 'status');
    const byType = await countByField('work_orders', 'type');
    const byPriority = await countByField('work_orders', 'priority');
    return { total: totalR.rows[0].c, byStatus, byType, byPriority };
  },

  async getCrewStats() {
    const totalR = await pool.query(`SELECT COUNT(*)::int AS c FROM crews WHERE status <> 'INACTIVA'`);
    const byStatus = await countByField('crews', 'status');
    const loadR = await pool.query(
      `SELECT c.id AS crew_id, c.name AS crew_name, COUNT(wo.id)::int AS active_orders
       FROM crews c
       LEFT JOIN work_orders wo ON wo.crew_id = c.id
         AND wo.status IN ('ASIGNADA','EN_EJECUCION','PAUSADA')
       WHERE c.status <> 'INACTIVA'
       GROUP BY c.id, c.name
       ORDER BY active_orders DESC`,
    );
    return { total: totalR.rows[0].c, byStatus, activeLoad: loadR.rows };
  },

  async getSummary() {
    const [assets, workOrders, crews] = await Promise.all([
      this.getAssetStats(),
      this.getWorkOrderStats(),
      this.getCrewStats(),
    ]);
    return { assets, workOrders, crews, generatedAt: new Date().toISOString() };
  },
};