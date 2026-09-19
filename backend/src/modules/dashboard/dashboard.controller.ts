import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  async summary(_req: Request, res: Response) {
    res.json({ data: await dashboardService.summary() });
  },
  async assets(_req: Request, res: Response) {
    res.json({ data: await dashboardService.assets() });
  },
  async workOrders(_req: Request, res: Response) {
    res.json({ data: await dashboardService.workOrders() });
  },
  async crews(_req: Request, res: Response) {
    res.json({ data: await dashboardService.crews() });
  },
};