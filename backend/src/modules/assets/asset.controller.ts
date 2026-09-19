import { Request, Response } from 'express';
import { assetService } from './asset.service';
import {
  createAssetSchema,
  updateAssetSchema,
  retireAssetSchema,
  changeStatusSchema,
  listAssetsQuerySchema,
} from './asset.schema';
import { ValidationError } from '../../shared/errors';
import { getParam } from '../../shared/requestParams';

export const assetController = {
  async list(req: Request, res: Response) {
    const parsed = listAssetsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError('Filtros inválidos', parsed.error.flatten());
    }
    const assets = await assetService.list(parsed.data);
    res.json({ data: assets, total: assets.length });
  },

  async getById(req: Request, res: Response) {
    const asset = await assetService.getById(getParam(req, 'id'));
    res.json({ data: asset });
  },

  async history(req: Request, res: Response) {
    const history = await assetService.getHistory(getParam(req, 'id'));
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
    const parsed = updateAssetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Datos inválidos', parsed.error.flatten());
    }
    const asset = await assetService.update(getParam(req, 'id'), parsed.data);
    res.json({ data: asset });
  },

  async changeStatus(req: Request, res: Response) {
    const parsed = changeStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Datos inválidos', parsed.error.flatten());
    }
    const asset = await assetService.changeStatus(getParam(req, 'id'), parsed.data);
    res.json({ data: asset });
  },

  async retire(req: Request, res: Response) {
    const parsed = retireAssetSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      throw new ValidationError('Datos inválidos', parsed.error.flatten());
    }
    const asset = await assetService.retire(getParam(req, 'id'), parsed.data);
    res.json({ data: asset });
  },
};