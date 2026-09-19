import { Request, Response } from 'express';
import { crewService } from './crew.service';
import { createCrewSchema, updateCrewSchema, changeCrewStatusSchema } from './crew.schema';
import { ValidationError } from '../../shared/errors';
import { getParam } from '../../shared/requestParams';
import { CrewStatus } from './crew.types';

export const crewController = {
  async list(_req: Request, res: Response) {
    const data = await crewService.list();
    res.json({ data, total: data.length });
  },
  async getById(req: Request, res: Response) {
    res.json({ data: await crewService.getById(getParam(req, 'id')) });
  },
  async create(req: Request, res: Response) {
    const p = createCrewSchema.safeParse(req.body);
    if (!p.success) throw new ValidationError('Datos inválidos', p.error.flatten());
    res.status(201).json({ data: await crewService.create(p.data) });
  },
  async update(req: Request, res: Response) {
    const p = updateCrewSchema.safeParse(req.body);
    if (!p.success) throw new ValidationError('Datos inválidos', p.error.flatten());
    res.json({ data: await crewService.update(getParam(req, 'id'), p.data) });
  },
  async changeStatus(req: Request, res: Response) {
    const p = changeCrewStatusSchema.safeParse(req.body);
    if (!p.success) throw new ValidationError('Datos inválidos', p.error.flatten());
    res.json({ data: await crewService.changeStatus(getParam(req, 'id'), p.data.status as CrewStatus) });
  },
  async retire(req: Request, res: Response) {
    res.json({ data: await crewService.retire(getParam(req, 'id')) });
  },
};