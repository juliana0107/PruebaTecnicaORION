import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Envuelve un handler async para que cualquier error sea capturado
 * por el middleware de errores, sin necesidad de try/catch en cada controller.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };