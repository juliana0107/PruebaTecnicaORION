import pool from '../../config/database';
import { workOrderRepository } from './workOrder.repository';
import { CreateWorkOrderInput, ListWorkOrdersQuery } from './workOrder.schema';
import { WorkOrder, WorkOrderStatus } from './workOrder.types';
import { ConflictError, NotFoundError, BusinessRuleError } from '../../shared/errors';

const ALLOWED_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  PENDIENTE: ['ASIGNADA', 'CANCELADA'],
  ASIGNADA: ['EN_EJECUCION', 'CANCELADA'],
  EN_EJECUCION: ['PAUSADA', 'COMPLETADA', 'CANCELADA'],
  PAUSADA: ['EN_EJECUCION', 'CANCELADA'],
  COMPLETADA: [],
  CANCELADA: [],
};

async function withTransaction<T>(fn: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export const workOrderService = {
  list: (filters: ListWorkOrdersQuery = {}) => workOrderRepository.findAll(filters),

  async getById(id: string) {
    const wo = await workOrderRepository.findById(id);
    if (!wo) throw new NotFoundError('Orden de trabajo');
    return wo;
  },

  async getHistory(id: string) {
    await this.getById(id);
    return workOrderRepository.findHistory(id);
  },

  async create(data: CreateWorkOrderInput): Promise<WorkOrder> {
    const existing = await workOrderRepository.findByCode(data.code);
    if (existing) throw new ConflictError(`El código '${data.code}' ya existe`);

    const assetCheck = await pool.query('SELECT status FROM assets WHERE id = $1', [data.asset_id]);
    if (assetCheck.rowCount === 0) throw new NotFoundError('Activo');
    if (assetCheck.rows[0].status === 'RETIRADO') {
      throw new BusinessRuleError('No se puede asociar una OT a un activo retirado');
    }

    return withTransaction(async (client) => {
      const wo = await workOrderRepository.create(data, client);
      await workOrderRepository.addHistory(
        { work_order_id: wo.id, change_type: 'CREATED', description: 'OT creada', new_value: wo.code },
        client,
      );
      return wo;
    });
  },

  async assignCrew(id: string, crewId: string): Promise<WorkOrder> {
    const wo = await this.getById(id);
    if (wo.status !== 'PENDIENTE') {
      throw new BusinessRuleError(`No se puede asignar cuadrilla en estado ${wo.status}`);
    }
    const crewCheck = await pool.query('SELECT id, status FROM crews WHERE id = $1', [crewId]);
    if (crewCheck.rowCount === 0) throw new NotFoundError('Cuadrilla');
    if (crewCheck.rows[0].status !== 'DISPONIBLE') {
      throw new BusinessRuleError('La cuadrilla no está disponible');
    }

    return withTransaction(async (client) => {
      const updated = await workOrderRepository.updateStatus(id, 'ASIGNADA', { crew_id: crewId }, client);
      if (!updated) throw new NotFoundError('OT');
      await workOrderRepository.addHistory(
        { work_order_id: id, change_type: 'ASSIGNED', previous_value: wo.status, new_value: 'ASIGNADA' },
        client,
      );
      await client.query(`UPDATE crews SET status = 'ASIGNADA', updated_at = NOW() WHERE id = $1`, [crewId]);
      return updated;
    });
  },

  async start(id: string): Promise<WorkOrder> {
    const wo = await this.getById(id);
    if (!ALLOWED_TRANSITIONS[wo.status].includes('EN_EJECUCION')) {
      throw new BusinessRuleError(`Transición no permitida: ${wo.status} → EN_EJECUCION`);
    }
    return withTransaction(async (client) => {
      const updated = await workOrderRepository.updateStatus(id, 'EN_EJECUCION', { started_at: new Date() }, client);
      if (!updated) throw new NotFoundError('OT');
      await workOrderRepository.addHistory(
        { work_order_id: id, change_type: 'STARTED', previous_value: wo.status, new_value: 'EN_EJECUCION' },
        client,
      );
      await client.query(`UPDATE assets SET status = 'EN_MANTENIMIENTO', updated_at = NOW() WHERE id = $1`, [wo.asset_id]);
      if (wo.crew_id) {
        await client.query(`UPDATE crews SET status = 'EN_EJECUCION', updated_at = NOW() WHERE id = $1`, [wo.crew_id]);
      }
      return updated;
    });
  },

  async pause(id: string): Promise<WorkOrder> {
    const wo = await this.getById(id);
    if (!ALLOWED_TRANSITIONS[wo.status].includes('PAUSADA')) {
      throw new BusinessRuleError(`Transición no permitida: ${wo.status} → PAUSADA`);
    }
    return withTransaction(async (client) => {
      const updated = await workOrderRepository.updateStatus(id, 'PAUSADA', {}, client);
      if (!updated) throw new NotFoundError('OT');
      await workOrderRepository.addHistory(
        { work_order_id: id, change_type: 'PAUSED', previous_value: wo.status, new_value: 'PAUSADA' },
        client,
      );
      return updated;
    });
  },

  async resume(id: string): Promise<WorkOrder> {
    const wo = await this.getById(id);
    if (!ALLOWED_TRANSITIONS[wo.status].includes('EN_EJECUCION')) {
      throw new BusinessRuleError(`Transición no permitida: ${wo.status} → EN_EJECUCION`);
    }
    return withTransaction(async (client) => {
      const updated = await workOrderRepository.updateStatus(id, 'EN_EJECUCION', {}, client);
      if (!updated) throw new NotFoundError('OT');
      await workOrderRepository.addHistory(
        { work_order_id: id, change_type: 'RESUMED', previous_value: wo.status, new_value: 'EN_EJECUCION' },
        client,
      );
      return updated;
    });
  },

  async complete(id: string, resolution: string): Promise<WorkOrder> {
    const wo = await this.getById(id);
    if (!ALLOWED_TRANSITIONS[wo.status].includes('COMPLETADA')) {
      throw new BusinessRuleError(`Transición no permitida: ${wo.status} → COMPLETADA`);
    }
    return withTransaction(async (client) => {
      const updated = await workOrderRepository.updateStatus(
        id, 'COMPLETADA', { completed_at: new Date(), resolution }, client,
      );
      if (!updated) throw new NotFoundError('OT');
      await workOrderRepository.addHistory(
        { work_order_id: id, change_type: 'COMPLETED', previous_value: wo.status, new_value: 'COMPLETADA' },
        client,
      );
      await client.query(`UPDATE assets SET status = 'OPERATIVO', updated_at = NOW() WHERE id = $1`, [wo.asset_id]);
      if (wo.crew_id) {
        await client.query(`UPDATE crews SET status = 'DISPONIBLE', updated_at = NOW() WHERE id = $1`, [wo.crew_id]);
      }
      return updated;
    });
  },

  async cancel(id: string, reason: string): Promise<WorkOrder> {
    const wo = await this.getById(id);
    if (!ALLOWED_TRANSITIONS[wo.status].includes('CANCELADA')) {
      throw new BusinessRuleError(`No se puede cancelar en estado ${wo.status}`);
    }
    return withTransaction(async (client) => {
      const updated = await workOrderRepository.updateStatus(id, 'CANCELADA', { cancel_reason: reason }, client);
      if (!updated) throw new NotFoundError('OT');
      await workOrderRepository.addHistory(
        { work_order_id: id, change_type: 'CANCELLED', description: reason, previous_value: wo.status, new_value: 'CANCELADA' },
        client,
      );
      if (wo.crew_id) {
        await client.query(`UPDATE crews SET status = 'DISPONIBLE', updated_at = NOW() WHERE id = $1`, [wo.crew_id]);
      }
      return updated;
    });
  },
};