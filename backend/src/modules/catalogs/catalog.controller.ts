import { Request, Response } from 'express';
import { catalogService } from './catalog.service';

export const catalogController = {
  async assetTypes(_req: Request, res: Response) {
    const data = await catalogService.listAssetTypes();
    res.json({ data });
  },

  async locations(_req: Request, res: Response) {
    const data = await catalogService.listLocations();
    res.json({ data });
  },
};