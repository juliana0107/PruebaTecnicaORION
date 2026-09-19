import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema } from './auth.schema';
import { ValidationError } from '../../shared/errors';

export const authController = {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
    const result = await authService.login(parsed.data);
    res.json({ data: result });
  },

  async me(req: Request, res: Response) {
    const userId = req.user!.sub;
    const result = await authService.me(userId);
    res.json({ data: result });
  },
};