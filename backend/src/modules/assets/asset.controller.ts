import { Request, Response } from 'express';
import { assetService } from './asset.service';
import { createAssetSchema, updateAssetSchema, retireAssetSchema } from './asset.schema';
import { ValidationError } from '../../shared/errors';
import { getParam } from '../../shared/requestParams';

export const assetController = {
  async list(_req: Request, res: Response) {
    const assets = await assetService.list();
    res.json({ data: assets, total: assets.length });
  },

  async getById(req: Request, res: Response) {
    const id = getParam(req, 'id');
    const asset = await assetService.getById(id);
    res.json({ data: asset });
  },

  async history(req: Request, res: Response) {
    const id = getParam(req, 'id');
    const history = await assetService.getHistory(id);
    res.json({ data: history, total: history.length });
  },

  async create(req: Request, res: Response) {
    const parsed = createAssetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Datos inválidos', parsed.error.flatten());
    }
    const asset = await assetService.create(parsed.data);
    res.status(201).json({ data: asset });
  },

  async update(req: Request, res: Response) {
    const id = getParam(req, 'id');
    const parsed = updateAssetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Datos inválidos', parsed.error.flatten());
    }
    const asset = await assetService.update(id, parsed.data);
    res.json({ data: asset });
  },

  async retire(req: Request, res: Response) {
    const id = getParam(req, 'id');
    const parsed = retireAssetSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      throw new ValidationError('Datos inválidos', parsed.error.flatten());
    }
    const asset = await assetService.retire(id, parsed.data);
    res.json({ data: asset });
  },
};