import { Request, Response } from 'express';
import { workOrderService } from './workOrder.service';
import {
  createWorkOrderSchema, assignCrewSchema, completeWorkOrderSchema,
  cancelWorkOrderSchema, listWorkOrdersQuerySchema,
} from './workOrder.schema';
import { ValidationError } from '../../shared/errors';
import { getParam } from '../../shared/requestParams';

export const workOrderController = {
  async list(req: Request, res: Response) {
    const p = listWorkOrdersQuerySchema.safeParse(req.query);
    if (!p.success) throw new ValidationError('Filtros inválidos', p.error.flatten());
    const data = await workOrderService.list(p.data);
    res.json({ data, total: data.length });
  },
  async getById(req: Request, res: Response) {
    res.json({ data: await workOrderService.getById(getParam(req, 'id')) });
  },
  async history(req: Request, res: Response) {
    const data = await workOrderService.getHistory(getParam(req, 'id'));
    res.json({ data, total: data.length });
  },
  async create(req: Request, res: Response) {
    const p = createWorkOrderSchema.safeParse(req.body);
    if (!p.success) throw new ValidationError('Datos inválidos', p.error.flatten());
    res.status(201).json({ data: await workOrderService.create(p.data) });
  },
  async assignCrew(req: Request, res: Response) {
    const p = assignCrewSchema.safeParse(req.body);
    if (!p.success) throw new ValidationError('Datos inválidos', p.error.flatten());
    res.json({ data: await workOrderService.assignCrew(getParam(req, 'id'), p.data.crew_id) });
  },
  async start(req: Request, res: Response) {
    res.json({ data: await workOrderService.start(getParam(req, 'id')) });
  },
  async pause(req: Request, res: Response) {
    res.json({ data: await workOrderService.pause(getParam(req, 'id')) });
  },
  async resume(req: Request, res: Response) {
    res.json({ data: await workOrderService.resume(getParam(req, 'id')) });
  },
  async complete(req: Request, res: Response) {
    const p = completeWorkOrderSchema.safeParse(req.body);
    if (!p.success) throw new ValidationError('Datos inválidos', p.error.flatten());
    res.json({ data: await workOrderService.complete(getParam(req, 'id'), p.data.resolution) });
  },
  async cancel(req: Request, res: Response) {
    const p = cancelWorkOrderSchema.safeParse(req.body);
    if (!p.success) throw new ValidationError('Datos inválidos', p.error.flatten());
    res.json({ data: await workOrderService.cancel(getParam(req, 'id'), p.data.reason) });
  },
};